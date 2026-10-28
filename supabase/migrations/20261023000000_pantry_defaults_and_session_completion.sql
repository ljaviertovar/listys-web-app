-- =============================================
-- MIGRATION: PRD v3 Phase 1 — default Pantry list + atomic session completion
-- DATE: 2026-10-23
-- =============================================
-- NON-DESTRUCTIVE REVIEW (AGENTS.md: Database & Supabase Patterns)
--
-- This migration runs exactly four statements. None of them reads, rewrites or removes an existing row:
--   1. ALTER TABLE public.groups ADD COLUMN is_default ... DEFAULT FALSE
--        Adds a column. Existing rows receive FALSE as a constant default; no UPDATE is run.
--   2. CREATE UNIQUE INDEX uq_groups_one_default_per_user ... WHERE is_default
--        Partial index. No existing row has is_default = TRUE, so no row can violate it and nothing is rejected.
--   3. CREATE OR REPLACE FUNCTION public.ensure_default_pantry
--        New function; never runs at migration time. When called it only INSERTs (one group and one list) and
--        returns early for users that already own a list. It has no UPDATE or DELETE.
--   4. CREATE OR REPLACE FUNCTION public.complete_shopping_session
--        New function; never runs at migration time. When called it UPDATEs only the session being completed and
--        the base-list items it checks (the same rows public.sync_shopping_session_to_base_list already updates),
--        and INSERTs new base-list items. It has no DELETE, no TRUNCATE and no DROP.
--
-- Intentionally untouched: public.sync_shopping_session_to_base_list and shopping_sessions.sync_to_base. They
-- stay for rollback safety and are removed, with explicit confirmation, in a later change.
-- No policy, table, enum or column is dropped, renamed or retyped. Existing history is not recalculated.
-- =============================================

-- 1. Marker for the implicit default group of a user (hidden from the UI in a later phase).
ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. At most one default group per user. This is the database guarantee behind idempotent provisioning.
CREATE UNIQUE INDEX IF NOT EXISTS uq_groups_one_default_per_user
  ON public.groups(user_id)
  WHERE is_default;

-- 3. Provision the default group and its first list for a user that owns no list yet.
--    Returns TRUE only when this call created them.
--    The default group doubles as the "already provisioned" marker, so deleting the list does not recreate it.
CREATE OR REPLACE FUNCTION public.ensure_default_pantry(
  p_group_name TEXT,
  p_list_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_group_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF COALESCE(char_length(btrim(p_group_name)), 0) NOT BETWEEN 1 AND 100
     OR COALESCE(char_length(btrim(p_list_name)), 0) NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'Invalid default names';
  END IF;

  -- Accounts that already have lists are never touched.
  IF EXISTS (SELECT 1 FROM public.base_lists WHERE user_id = v_user_id) THEN
    RETURN FALSE;
  END IF;

  -- Concurrent callers race on the partial unique index: the loser waits for the winner's commit, gets no row
  -- back, and returns without creating a second list.
  INSERT INTO public.groups (user_id, name, is_default)
  VALUES (v_user_id, btrim(p_group_name), TRUE)
  ON CONFLICT (user_id) WHERE is_default DO NOTHING
  RETURNING id INTO v_group_id;

  IF v_group_id IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.base_lists (group_id, user_id, name)
  VALUES (v_group_id, v_user_id, btrim(p_list_name));

  RETURN TRUE;
END;
$$;

-- 4. Complete a session and apply its checked items to the base list in one transaction.
--    Errors use stable message tokens: SESSION_NOT_FOUND (also for other users' sessions) and SESSION_NOT_ACTIVE.
--    A full list never blocks completion: new items that do not fit are skipped and counted in over_limit_count.
CREATE OR REPLACE FUNCTION public.complete_shopping_session(
  p_session_id UUID,
  p_total_amount NUMERIC DEFAULT NULL,
  p_general_notes TEXT DEFAULT NULL,
  p_max_items INTEGER DEFAULT 250
)
RETURNS TABLE(new_count INTEGER, updated_count INTEGER, skipped_count INTEGER, over_limit_count INTEGER)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_base_list_id UUID;
  v_status TEXT;
  v_current_count INTEGER;
  v_capacity INTEGER;
  v_existing RECORD;
  v_sort_order INTEGER;
  rec RECORD;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- The row lock serializes concurrent completions: the second one sees 'completed' and fails without effects.
  SELECT ss.base_list_id, ss.status::TEXT INTO v_base_list_id, v_status
  FROM public.shopping_sessions ss
  WHERE ss.id = p_session_id
    AND ss.user_id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SESSION_NOT_FOUND';
  END IF;

  IF v_status <> 'active' THEN
    RAISE EXCEPTION 'SESSION_NOT_ACTIVE';
  END IF;

  -- Serializes capacity accounting between completions that target the same list.
  PERFORM 1 FROM public.base_lists WHERE id = v_base_list_id FOR UPDATE;

  UPDATE public.shopping_sessions
  SET
    status = 'completed',
    completed_at = NOW(),
    sync_to_base = TRUE,
    total_amount = COALESCE(p_total_amount, total_amount),
    general_notes = COALESCE(p_general_notes, general_notes),
    updated_at = NOW()
  WHERE id = p_session_id;

  SELECT COUNT(*) INTO v_current_count
  FROM public.base_list_items
  WHERE base_list_id = v_base_list_id;

  v_capacity := GREATEST(COALESCE(p_max_items, 250) - v_current_count, 0);

  new_count := 0;
  updated_count := 0;
  over_limit_count := 0;

  -- Checked items whose name normalizes to nothing cannot be matched or stored.
  SELECT COUNT(*)::INTEGER INTO skipped_count
  FROM public.shopping_session_items ssi
  WHERE ssi.shopping_session_id = p_session_id
    AND COALESCE(ssi.checked, FALSE) = TRUE
    AND (ssi.normalized_name IS NULL OR ssi.normalized_name = '');

  -- One purchase per distinct item per trip, applied in the order the items appear in the session.
  FOR rec IN
    SELECT d.*
    FROM (
      SELECT DISTINCT ON (ssi.normalized_name) ssi.*
      FROM public.shopping_session_items ssi
      WHERE ssi.shopping_session_id = p_session_id
        AND COALESCE(ssi.checked, FALSE) = TRUE
        AND ssi.normalized_name IS NOT NULL
        AND ssi.normalized_name <> ''
      ORDER BY ssi.normalized_name, ssi.sort_order, ssi.id
    ) d
    ORDER BY d.sort_order, d.id
  LOOP
    SELECT * INTO v_existing
    FROM public.base_list_items bli
    WHERE bli.base_list_id = v_base_list_id
      AND bli.normalized_name = rec.normalized_name
    FOR UPDATE;

    IF FOUND THEN
      UPDATE public.base_list_items
      SET
        quantity = rec.quantity,
        unit = rec.unit,
        notes = rec.notes,
        category = rec.category,
        purchase_count = COALESCE(base_list_items.purchase_count, 0) + 1,
        last_purchased_at = NOW(),
        average_price = CASE
          WHEN rec.price IS NULL THEN base_list_items.average_price
          WHEN base_list_items.average_price IS NULL THEN rec.price
          ELSE ((base_list_items.average_price * GREATEST(COALESCE(base_list_items.purchase_count, 0), 0)) + rec.price)
               / (GREATEST(COALESCE(base_list_items.purchase_count, 0), 0) + 1)
        END,
        updated_at = NOW()
      WHERE id = v_existing.id;

      updated_count := updated_count + 1;
    ELSIF v_capacity > 0 THEN
      SELECT COALESCE(MAX(sort_order), -1) + 1 INTO v_sort_order
      FROM public.base_list_items
      WHERE base_list_id = v_base_list_id;

      INSERT INTO public.base_list_items (
        base_list_id,
        name,
        quantity,
        unit,
        notes,
        category,
        sort_order,
        normalized_name,
        purchase_count,
        first_seen_at,
        last_purchased_at,
        average_price
      ) VALUES (
        v_base_list_id,
        rec.name,
        COALESCE(rec.quantity, 1),
        rec.unit,
        rec.notes,
        rec.category,
        v_sort_order,
        rec.normalized_name,
        1,
        NOW(),
        NOW(),
        rec.price
      );

      v_capacity := v_capacity - 1;
      new_count := new_count + 1;
    ELSE
      skipped_count := skipped_count + 1;
      over_limit_count := over_limit_count + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT new_count, updated_count, skipped_count, over_limit_count;
END;
$$;
