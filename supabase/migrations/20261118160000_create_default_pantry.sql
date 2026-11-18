-- =============================================
-- MIGRATION: set up the default Pantry on demand for accounts that already exist
-- DATE: 2026-11-18
-- =============================================
-- NON-DESTRUCTIVE REVIEW (AGENTS.md: Database & Supabase Patterns)
--
-- This migration runs exactly one statement:
--   1. CREATE OR REPLACE FUNCTION public.create_default_pantry
--        New function; it never runs at migration time. When a signed-in user calls it, it can only:
--          - read the caller's own lists,
--          - UPDATE one existing list of the caller, writing only base_lists.is_default = TRUE (name, items and group stay
--            as they are), or
--          - INSERT one default group (ON CONFLICT DO NOTHING) and one list for the caller.
--        It has no DELETE, no TRUNCATE and no DROP, and it never touches another user's rows. public.ensure_default_pantry
--        and public.ensure_default_group are left untouched.
--
-- Nothing is backfilled: only an explicit call from the account owner changes anything.
-- No table, column, index, policy or enum is added, dropped, renamed or retyped.
--
-- Rollback: DROP FUNCTION public.create_default_pantry(TEXT, TEXT) (the function owns no data).
-- =============================================

-- Gives the caller a default list. Returns { list_id, outcome } where outcome is:
--   'existing' - the caller already had a default list; nothing changed
--   'adopted'  - the caller already had a list with that name; it is now marked as the default and nothing else changed
--   'created'  - a new, empty list was created in the caller's implicit default group and marked as the default
-- Concurrent calls of the same user are serialised by an advisory lock, and the partial unique index
-- uq_base_lists_one_default_per_user stays as the last guard against a second default list.
CREATE OR REPLACE FUNCTION public.create_default_pantry(
  p_group_name TEXT,
  p_list_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_group_id UUID;
  v_list_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF COALESCE(char_length(btrim(p_group_name)), 0) NOT BETWEEN 1 AND 100
     OR COALESCE(char_length(btrim(p_list_name)), 0) NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'Invalid default names';
  END IF;

  -- One call at a time per user: the second caller waits, then sees what the first one did.
  PERFORM pg_advisory_xact_lock(hashtext('default_pantry:' || v_user_id::TEXT));

  SELECT id INTO v_list_id
  FROM public.base_lists
  WHERE user_id = v_user_id AND is_default;

  IF v_list_id IS NOT NULL THEN
    RETURN jsonb_build_object('list_id', v_list_id, 'outcome', 'existing');
  END IF;

  BEGIN
    -- The oldest list with that name (ignoring case and edge spaces) becomes the default instead of a duplicate.
    SELECT id INTO v_list_id
    FROM public.base_lists
    WHERE user_id = v_user_id
      AND lower(btrim(name)) = lower(btrim(p_list_name))
    ORDER BY created_at ASC NULLS LAST, id
    LIMIT 1;

    IF v_list_id IS NOT NULL THEN
      UPDATE public.base_lists
      SET is_default = TRUE
      WHERE id = v_list_id;

      RETURN jsonb_build_object('list_id', v_list_id, 'outcome', 'adopted');
    END IF;

    INSERT INTO public.groups (user_id, name, is_default)
    VALUES (v_user_id, btrim(p_group_name), TRUE)
    ON CONFLICT (user_id) WHERE is_default DO NOTHING;

    SELECT id INTO v_group_id
    FROM public.groups
    WHERE user_id = v_user_id AND is_default;

    INSERT INTO public.base_lists (group_id, user_id, name, is_default)
    VALUES (v_group_id, v_user_id, btrim(p_list_name), TRUE)
    RETURNING id INTO v_list_id;

    RETURN jsonb_build_object('list_id', v_list_id, 'outcome', 'created');
  EXCEPTION WHEN unique_violation THEN
    -- Another path (the dashboard provisioning in another tab) marked a default list first: report it, change nothing.
    SELECT id INTO v_list_id
    FROM public.base_lists
    WHERE user_id = v_user_id AND is_default;

    IF v_list_id IS NULL THEN
      RAISE;
    END IF;

    RETURN jsonb_build_object('list_id', v_list_id, 'outcome', 'existing');
  END;
END;
$$;
