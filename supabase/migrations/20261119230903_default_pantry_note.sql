-- Non-destructive: replaces two functions only; no rows are changed at migration time.
-- Future inserts add a note; existing and adopted lists retain their data.

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

  INSERT INTO public.base_lists (group_id, user_id, name, is_default, notes)
  VALUES (v_group_id, v_user_id, btrim(p_list_name), TRUE, 'What you usually keep at home. It fills itself from your receipts.');

  RETURN TRUE;
END;
$$;

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

    INSERT INTO public.base_lists (group_id, user_id, name, is_default, notes)
    VALUES (v_group_id, v_user_id, btrim(p_list_name), TRUE, 'What you usually keep at home. It fills itself from your receipts.')
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

