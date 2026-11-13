-- Elevate only the checked session-start operation; authenticated callers must
-- not receive direct write access to shopping_session_items.
BEGIN;

ALTER FUNCTION public.start_shopping_session(uuid, text, uuid)
  SECURITY DEFINER;

ALTER FUNCTION public.start_shopping_session(uuid, text, uuid)
  SET search_path = '';

REVOKE ALL ON FUNCTION public.start_shopping_session(uuid, text, uuid)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_shopping_session(uuid, text, uuid)
  TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
