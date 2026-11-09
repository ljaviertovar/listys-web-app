-- Safety review: additive schema/functions/grants only. No existing records are
-- deleted, rewritten or recalculated. DELETE below defines an explicit user action.
BEGIN;

-- The existing normalizer calls unaccent without qualification. Give it its own
-- trusted extension path so it also works from the new empty-search-path RPCs.
DO $$ DECLARE v_extension_schema text; BEGIN
  SELECT n.nspname INTO STRICT v_extension_schema
  FROM pg_extension e JOIN pg_namespace n ON n.oid = e.extnamespace
  WHERE e.extname = 'unaccent';
  EXECUTE format('ALTER FUNCTION public.normalize_item_name(text) SET search_path = pg_catalog, %I', v_extension_schema);
END $$;

ALTER TABLE public.shopping_session_items
  ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0);

CREATE OR REPLACE FUNCTION public.set_shopping_item_version()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.version := 1;
  ELSIF ROW(NEW.name, NEW.normalized_name, NEW.quantity, NEW.unit, NEW.checked,
            NEW.notes, NEW.category, NEW.sort_order, NEW.price, NEW.is_other_store)
    IS DISTINCT FROM
        ROW(OLD.name, OLD.normalized_name, OLD.quantity, OLD.unit, OLD.checked,
            OLD.notes, OLD.category, OLD.sort_order, OLD.price, OLD.is_other_store) THEN
    NEW.version := OLD.version + 1;
  ELSE
    NEW.version := OLD.version;
  END IF;
  RETURN NEW;
END;
$$;

-- PostgreSQL orders BEFORE triggers alphabetically; normalize the name first.
CREATE TRIGGER zz_shopping_item_version
  BEFORE INSERT OR UPDATE ON public.shopping_session_items
  FOR EACH ROW EXECUTE FUNCTION public.set_shopping_item_version();

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.lock_active_trip(p_session_id uuid)
RETURNS public.shopping_sessions LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_session public.shopping_sessions;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
  SELECT ss.* INTO v_session FROM public.shopping_sessions ss
  WHERE ss.id = p_session_id AND (ss.user_id = auth.uid()
    OR public.current_user_is_session_collaborator(ss.id)) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ITEM_NOT_FOUND'; END IF;
  IF v_session.status IS DISTINCT FROM 'active'::public.shopping_session_status THEN
    RAISE EXCEPTION 'SESSION_NOT_ACTIVE';
  END IF;
  RETURN v_session;
END;
$$;
REVOKE ALL ON FUNCTION private.lock_active_trip(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.validate_trip_item_fields(p_fields jsonb)
RETURNS void LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE v_key text; v_value jsonb; v_number numeric;
BEGIN
  IF jsonb_typeof(p_fields) IS DISTINCT FROM 'object' OR p_fields = '{}'::jsonb THEN
    RAISE EXCEPTION 'INVALID_ITEM_FIELDS';
  END IF;
  FOR v_key, v_value IN SELECT * FROM jsonb_each(p_fields) LOOP
    IF v_key IN ('name', 'unit', 'notes', 'category') THEN
      IF jsonb_typeof(v_value) <> 'string' OR length(v_value #>> '{}') >
        (CASE v_key WHEN 'name' THEN 200 WHEN 'unit' THEN 20 WHEN 'notes' THEN 500 ELSE 50 END)
        OR (v_key = 'name' AND length(btrim(v_value #>> '{}')) = 0) THEN
        RAISE EXCEPTION 'INVALID_ITEM_FIELDS';
      END IF;
    ELSIF v_key = 'checked' THEN
      IF jsonb_typeof(v_value) <> 'boolean' THEN RAISE EXCEPTION 'INVALID_ITEM_FIELDS'; END IF;
    ELSIF v_key IN ('quantity', 'sort_order') THEN
      IF jsonb_typeof(v_value) <> 'number' THEN RAISE EXCEPTION 'INVALID_ITEM_FIELDS'; END IF;
      v_number := (v_value #>> '{}')::numeric;
      IF (v_key = 'quantity' AND (v_number < 0.1 OR v_number > 99 OR v_number * 10 <> trunc(v_number * 10)))
        OR (v_key = 'sort_order' AND (v_number <> trunc(v_number) OR v_number < -2147483648 OR v_number > 2147483647)) THEN
        RAISE EXCEPTION 'INVALID_ITEM_FIELDS';
      END IF;
    ELSE
      RAISE EXCEPTION 'INVALID_ITEM_FIELDS';
    END IF;
  END LOOP;
END;
$$;
REVOKE ALL ON FUNCTION private.validate_trip_item_fields(jsonb) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.update_shopping_session_item_versioned(
  p_item_id uuid, p_expected_version integer, p_fields jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_session_id uuid; v_item public.shopping_session_items;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
  IF p_expected_version IS NULL OR p_expected_version <= 0 THEN RAISE EXCEPTION 'INVALID_ITEM_FIELDS'; END IF;
  PERFORM private.validate_trip_item_fields(p_fields);
  SELECT shopping_session_id INTO v_session_id FROM public.shopping_session_items WHERE id = p_item_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'ITEM_NOT_FOUND'; END IF;
  PERFORM private.lock_active_trip(v_session_id);
  SELECT * INTO v_item FROM public.shopping_session_items
    WHERE id = p_item_id AND shopping_session_id = v_session_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'ITEM_NOT_FOUND'; END IF;
  IF v_item.version <> p_expected_version THEN
    RETURN jsonb_build_object('outcome', 'conflict', 'item', to_jsonb(v_item));
  END IF;
  UPDATE public.shopping_session_items SET
    name = CASE WHEN p_fields ? 'name' THEN p_fields->>'name' ELSE name END,
    quantity = CASE WHEN p_fields ? 'quantity' THEN (p_fields->>'quantity')::numeric ELSE quantity END,
    unit = CASE WHEN p_fields ? 'unit' THEN p_fields->>'unit' ELSE unit END,
    checked = CASE WHEN p_fields ? 'checked' THEN (p_fields->>'checked')::boolean ELSE checked END,
    notes = CASE WHEN p_fields ? 'notes' THEN p_fields->>'notes' ELSE notes END,
    category = CASE WHEN p_fields ? 'category' THEN p_fields->>'category' ELSE category END,
    sort_order = CASE WHEN p_fields ? 'sort_order' THEN (p_fields->>'sort_order')::integer ELSE sort_order END
  WHERE id = p_item_id AND version = p_expected_version RETURNING * INTO v_item;
  RETURN jsonb_build_object('outcome', 'updated', 'item', to_jsonb(v_item));
END;
$$;

CREATE OR REPLACE FUNCTION public.create_shopping_session_item_active(p_session_id uuid, p_fields jsonb)
RETURNS public.shopping_session_items LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_item public.shopping_session_items; v_order integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
  PERFORM private.validate_trip_item_fields(p_fields);
  IF NOT (p_fields ? 'name') OR p_fields ?| ARRAY['checked', 'sort_order'] THEN RAISE EXCEPTION 'INVALID_ITEM_FIELDS'; END IF;
  PERFORM private.lock_active_trip(p_session_id);
  SELECT coalesce(max(sort_order), -1) + 1 INTO v_order FROM public.shopping_session_items WHERE shopping_session_id = p_session_id;
  INSERT INTO public.shopping_session_items (shopping_session_id, name, quantity, unit, notes, category, sort_order, checked)
  VALUES (p_session_id, p_fields->>'name', coalesce((p_fields->>'quantity')::numeric, 1),
    p_fields->>'unit', p_fields->>'notes', p_fields->>'category', v_order, false) RETURNING * INTO v_item;
  RETURN v_item;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_shopping_session_item_active(p_item_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_session_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
  SELECT shopping_session_id INTO v_session_id FROM public.shopping_session_items WHERE id = p_item_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'ITEM_NOT_FOUND'; END IF;
  PERFORM private.lock_active_trip(v_session_id);
  DELETE FROM public.shopping_session_items WHERE id = p_item_id AND shopping_session_id = v_session_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'ITEM_NOT_FOUND'; END IF;
  RETURN v_session_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_shopping_session_item_versioned(uuid, integer, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_shopping_session_item_active(uuid, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_shopping_session_item_active(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_shopping_session_item_versioned(uuid, integer, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_shopping_session_item_active(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_shopping_session_item_active(uuid) TO authenticated;

-- Only authenticated, authorized functions may change items; keep SELECT + RLS.
REVOKE INSERT, UPDATE, DELETE ON public.shopping_session_items FROM PUBLIC, anon, authenticated;
DO $$ DECLARE v_column record; BEGIN
  FOR v_column IN SELECT attname FROM pg_attribute
    WHERE attrelid = 'public.shopping_session_items'::regclass AND attnum > 0 AND NOT attisdropped LOOP
    EXECUTE format('REVOKE INSERT (%I), UPDATE (%I) ON public.shopping_session_items FROM PUBLIC, anon, authenticated', v_column.attname, v_column.attname);
  END LOOP;
END $$;

-- The existing reconciliation is SECURITY INVOKER and needs item DML. Keep its
-- implementation private; only this ownership-checked boundary may elevate it.
ALTER FUNCTION public.attach_receipt_to_session(uuid, uuid, jsonb, uuid[], numeric, integer, boolean) SET SCHEMA private;
REVOKE ALL ON FUNCTION private.attach_receipt_to_session(uuid, uuid, jsonb, uuid[], numeric, integer, boolean) FROM PUBLIC, anon, authenticated;

CREATE FUNCTION public.attach_receipt_to_session(
  p_ticket_id uuid, p_session_id uuid, p_links jsonb, p_added_item_ids uuid[],
  p_total_amount numeric, p_max_items integer, p_complete_session boolean
) RETURNS TABLE(completed_now boolean, matched_count integer, checked_now_count integer,
  added_count integer, priced_count integer, over_limit_count integer, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_base_list_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Unauthorized'; END IF;
  -- Match reconciliation's receipt -> session -> list -> item lock order.
  PERFORM 1 FROM public.tickets WHERE id = p_ticket_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ticket not found' USING ERRCODE = 'P0002'; END IF;
  SELECT base_list_id INTO v_base_list_id FROM public.shopping_sessions
    WHERE id = p_session_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND OR NOT EXISTS (SELECT 1 FROM public.base_lists WHERE id = v_base_list_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Shopping session not found' USING ERRCODE = 'P0002';
  END IF;
  RETURN QUERY SELECT * FROM private.attach_receipt_to_session(p_ticket_id, p_session_id,
    p_links, p_added_item_ids, p_total_amount, p_max_items, p_complete_session);
END;
$$;
REVOKE ALL ON FUNCTION public.attach_receipt_to_session(uuid, uuid, jsonb, uuid[], numeric, integer, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.attach_receipt_to_session(uuid, uuid, jsonb, uuid[], numeric, integer, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.attach_receipt_to_session(
  p_ticket_id uuid, p_session_id uuid, p_links jsonb DEFAULT '[]'::jsonb,
  p_added_item_ids uuid[] DEFAULT ARRAY[]::uuid[], p_total_amount numeric DEFAULT NULL, p_max_items integer DEFAULT 250
) RETURNS TABLE(completed_now boolean, matched_count integer, checked_now_count integer,
  added_count integer, priced_count integer, over_limit_count integer, replayed boolean)
LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
  SELECT * FROM public.attach_receipt_to_session(p_ticket_id, p_session_id, p_links,
    p_added_item_ids, p_total_amount, p_max_items, TRUE);
$$;
REVOKE ALL ON FUNCTION public.attach_receipt_to_session(uuid, uuid, jsonb, uuid[], numeric, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.attach_receipt_to_session(uuid, uuid, jsonb, uuid[], numeric, integer) TO authenticated;

NOTIFY pgrst, 'reload schema';
COMMIT;
