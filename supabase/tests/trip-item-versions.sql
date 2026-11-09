-- Run only against a provisioned local database, after the additive migration.
-- All fixture rows and changes are rolled back. No migrations or global reset.
BEGIN;
CREATE FUNCTION pg_temp.assert_true(ok boolean, label text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'Assertion failed: %', label; END IF; END $$;
SELECT gen_random_uuid() AS owner_id, gen_random_uuid() AS other_id, gen_random_uuid() AS collaborator_id,
  gen_random_uuid() AS list_id, gen_random_uuid() AS group_id, gen_random_uuid() AS session_id, gen_random_uuid() AS item_id \gset
INSERT INTO auth.users(id) VALUES (:'owner_id'), (:'other_id'), (:'collaborator_id');
INSERT INTO public.groups(id, user_id, name) VALUES (:'group_id', :'owner_id', 'Version fixture');
INSERT INTO public.base_lists(id, user_id, group_id, name) VALUES (:'list_id', :'owner_id', :'group_id', 'Version fixture');
INSERT INTO public.shopping_sessions(id, user_id, base_list_id, name) VALUES (:'session_id', :'owner_id', :'list_id', 'Version fixture');
INSERT INTO public.shopping_session_items(id, shopping_session_id, name, version) VALUES (:'item_id', :'session_id', 'Milk', 999);
SELECT pg_temp.assert_true(version = 1, 'server owns initial version') FROM public.shopping_session_items WHERE id = :'item_id';
SELECT set_config('test.item_id', :'item_id', true), set_config('test.session_id', :'session_id', true);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', :'owner_id', true);
SELECT pg_temp.assert_true((public.update_shopping_session_item_versioned(:'item_id', 1, '{"checked":true}')->'item'->>'version')::int = 2, 'owner CAS');
SELECT pg_temp.assert_true(public.update_shopping_session_item_versioned(:'item_id', 1, '{"checked":false}')->>'outcome' = 'conflict', 'stale CAS');
SELECT pg_temp.assert_true((public.update_shopping_session_item_versioned(:'item_id', 2, '{"checked":true}')->'item'->>'version')::int = 2, 'no-op preserves version');
DO $$ BEGIN
  BEGIN
    UPDATE public.shopping_session_items SET checked = false WHERE id = current_setting('test.item_id')::uuid;
    RAISE EXCEPTION 'Direct UPDATE was allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
SELECT set_config('request.jwt.claim.sub', :'other_id', true);
DO $$ BEGIN
  BEGIN
    PERFORM public.update_shopping_session_item_versioned(current_setting('test.item_id')::uuid, 1, '{"checked":false}');
    RAISE EXCEPTION 'Other user was allowed';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'ITEM_NOT_FOUND' THEN RAISE; END IF;
  END;
END $$;
RESET ROLE;
INSERT INTO public.list_collaborators(base_list_id, user_id, role, invited_by) VALUES (:'list_id', :'collaborator_id', 'editor', :'owner_id');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', :'collaborator_id', true);
SELECT pg_temp.assert_true(public.update_shopping_session_item_versioned(:'item_id', 2, '{"checked":false}')->>'outcome' = 'updated', 'collaborator CAS');
SELECT set_config('request.jwt.claim.sub', :'owner_id', true);
SELECT pg_temp.assert_true((public.create_shopping_session_item_active(:'session_id', '{"name":"Bread"}')).version = 1, 'active creation');
RESET ROLE;
-- The receipt functions run as their owner; exercise their version-trigger path.
UPDATE public.shopping_session_items SET price = 4.25, quantity = 2 WHERE id = :'item_id';
SELECT pg_temp.assert_true(version = 4, 'receipt-path fields increment version') FROM public.shopping_session_items WHERE id = :'item_id';
UPDATE public.shopping_sessions SET status = 'completed' WHERE id = :'session_id';
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  BEGIN
    PERFORM public.update_shopping_session_item_versioned(current_setting('test.item_id')::uuid, 4, '{"checked":true}');
    RAISE EXCEPTION 'Completed trip accepted a check';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'SESSION_NOT_ACTIVE' THEN RAISE; END IF;
  END;
  BEGIN
    PERFORM public.create_shopping_session_item_active(current_setting('test.session_id')::uuid, '{"name":"Late"}');
    RAISE EXCEPTION 'Completed trip accepted a new item';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'SESSION_NOT_ACTIVE' THEN RAISE; END IF;
  END;
  BEGIN
    PERFORM public.delete_shopping_session_item_active(current_setting('test.item_id')::uuid);
    RAISE EXCEPTION 'Completed trip accepted a delete';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'SESSION_NOT_ACTIVE' THEN RAISE; END IF;
  END;
END $$;
RESET ROLE;
SET LOCAL ROLE anon;
SELECT pg_temp.assert_true(NOT has_function_privilege(current_user, 'public.update_shopping_session_item_versioned(uuid,integer,jsonb)', 'execute'), 'anonymous denied');
RESET ROLE;
SELECT pg_temp.assert_true(NOT has_function_privilege('authenticated',
  'private.attach_receipt_to_session(uuid,uuid,jsonb,uuid[],numeric,integer,boolean)', 'execute'), 'receipt implementation is private');
ROLLBACK;
