-- =============================================
-- MIGRATION: Listys V3 boards — marker for the account's default list ("Default" chip)
-- DATE: 2026-11-01
-- =============================================
-- NON-DESTRUCTIVE REVIEW (AGENTS.md: Database & Supabase Patterns)
--
-- This migration runs exactly four statements. None of them removes, renames or retypes anything:
--   1. ALTER TABLE public.base_lists ADD COLUMN is_default ... DEFAULT FALSE
--        Adds a column. Existing rows receive FALSE as a constant default.
--   2. CREATE UNIQUE INDEX uq_base_lists_one_default_per_user ... WHERE is_default
--        Partial index. At this point no row has is_default = TRUE, so no row can violate it and nothing is rejected.
--   3. UPDATE public.base_lists SET is_default = TRUE for ONE list per user: the oldest list that sits in the user's
--        default group and carries the default Pantry name. It writes a single flag on rows that exist; it deletes and
--        rewrites nothing else. Accounts without such a list are left as they are (no chip).
--   4. CREATE OR REPLACE FUNCTION public.ensure_default_pantry
--        Same function as before; the only change is that the list it creates is marked is_default. It never runs at
--        migration time and it has no UPDATE or DELETE.
--
-- Rollback: ALTER TABLE public.base_lists DROP COLUMN is_default (a column with only flags; no user data lives in it).
-- =============================================

-- 1. Marker for the list every account starts with.
ALTER TABLE public.base_lists
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. At most one default list per user.
CREATE UNIQUE INDEX IF NOT EXISTS uq_base_lists_one_default_per_user
  ON public.base_lists(user_id)
  WHERE is_default;

-- 3. Mark the Pantry that accounts already have: one per user, the oldest one in the default group.
UPDATE public.base_lists AS bl
SET is_default = TRUE
FROM (
  SELECT DISTINCT ON (l.user_id) l.id
  FROM public.base_lists l
  JOIN public.groups g ON g.id = l.group_id AND g.is_default
  WHERE l.name = 'Pantry'
  ORDER BY l.user_id, l.created_at ASC NULLS LAST, l.id
) AS first_pantry
WHERE bl.id = first_pantry.id
  AND NOT bl.is_default;

-- 4. A new account's Pantry is born marked.
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

  INSERT INTO public.groups (user_id, name, is_default)
  VALUES (v_user_id, btrim(p_group_name), TRUE)
  ON CONFLICT (user_id) WHERE is_default DO NOTHING
  RETURNING id INTO v_group_id;

  IF v_group_id IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.base_lists (group_id, user_id, name, is_default)
  VALUES (v_group_id, v_user_id, btrim(p_list_name), TRUE);

  RETURN TRUE;
END;
$$;
