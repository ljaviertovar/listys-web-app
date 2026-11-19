-- Existing trips are left intact. A row per owner serializes starts, including direct writes.
BEGIN;

CREATE SCHEMA IF NOT EXISTS private;
CREATE TABLE private.shopping_session_start_locks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);
REVOKE ALL ON private.shopping_session_start_locks FROM PUBLIC, anon, authenticated;
ALTER TABLE private.shopping_session_start_locks ENABLE ROW LEVEL SECURITY;

CREATE INDEX shopping_sessions_active_owner_lookup
ON public.shopping_sessions (user_id) WHERE status = 'active';

CREATE FUNCTION private.guard_one_active_trip_per_account()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  active_id uuid;
BEGIN
  IF NEW.status IS DISTINCT FROM 'active' THEN RETURN NEW; END IF;
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'active' AND OLD.user_id = NEW.user_id THEN RETURN NEW; END IF;
  END IF;
  IF auth.uid() IS NOT NULL AND auth.uid() <> NEW.user_id THEN
    RAISE EXCEPTION 'Cannot start a trip for another account' USING ERRCODE = '42501';
  END IF;

  INSERT INTO private.shopping_session_start_locks (user_id) VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id;

  SELECT s.id INTO active_id
  FROM public.shopping_sessions s
  WHERE s.user_id = NEW.user_id AND s.status = 'active' AND s.id <> NEW.id
  ORDER BY s.started_at DESC NULLS LAST, s.id
  LIMIT 1;

  IF FOUND THEN
    RAISE EXCEPTION 'ACCOUNT_TRIP_ALREADY_ACTIVE' USING ERRCODE = 'P0001',
      DETAIL = CASE WHEN auth.uid() = NEW.user_id THEN active_id::text ELSE NULL END;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.guard_one_active_trip_per_account() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER guard_one_active_trip_per_account
BEFORE INSERT OR UPDATE OF user_id, status ON public.shopping_sessions
FOR EACH ROW EXECUTE FUNCTION private.guard_one_active_trip_per_account();

COMMIT;
