-- =============================================
-- MIGRATION: PRD v3 Phase 2 — default group on demand (flat lists)
-- DATE: 2026-10-24
-- =============================================
-- NON-DESTRUCTIVE REVIEW (AGENTS.md: Database & Supabase Patterns)
--
-- This migration runs exactly one statement:
--   1. CREATE OR REPLACE FUNCTION public.ensure_default_group
--        New function; it never runs at migration time. When called it only INSERTs one row into public.groups
--        (ON CONFLICT DO NOTHING on the partial unique index uq_groups_one_default_per_user) and SELECTs the user's
--        default group. It has no UPDATE, no DELETE, no TRUNCATE and no DROP, and it never reads or changes a list.
--
-- Nothing is backfilled: accounts that already have lists get their default group the first time they create a list
-- without naming a group. No table, column, index, policy or enum is added, dropped, renamed or retyped, and
-- public.ensure_default_pantry (Phase 1) is left untouched.
-- =============================================

-- Returns the id of the caller's implicit default group, creating it when it does not exist yet.
-- Concurrent callers race on the partial unique index: the loser waits for the winner's commit, inserts nothing and then
-- finds the winner's row with its own SELECT (a new statement, so a new snapshot under READ COMMITTED).
CREATE OR REPLACE FUNCTION public.ensure_default_group(
  p_group_name TEXT
)
RETURNS UUID
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

  IF COALESCE(char_length(btrim(p_group_name)), 0) NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'Invalid default group name';
  END IF;

  INSERT INTO public.groups (user_id, name, is_default)
  VALUES (v_user_id, btrim(p_group_name), TRUE)
  ON CONFLICT (user_id) WHERE is_default DO NOTHING;

  SELECT g.id INTO v_group_id
  FROM public.groups g
  WHERE g.user_id = v_user_id
    AND g.is_default;

  RETURN v_group_id;
END;
$$;
