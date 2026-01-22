-- Migration: Handle orphaned tickets when groups are deleted
-- This migration documents and ensures proper handling of tickets when their groups are deleted.
--
-- Current behavior: group_id is set to NULL when a group is deleted (ON DELETE SET NULL)
-- This migration ensures the UI can gracefully handle orphaned tickets.

-- Verify the constraint exists (for documentation purposes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name LIKE '%tickets_group_id_fkey%'
    AND table_name = 'tickets'
  ) THEN
    RAISE EXCEPTION 'Expected group_id foreign key constraint not found on tickets table';
  END IF;
END $$;

-- Add comment to document the behavior
COMMENT ON COLUMN public.tickets.group_id IS 'Group ID. Set to NULL when the group is deleted (orphaned tickets). UI handles NULL gracefully with visual indicators.';

-- Create an index on NULL group_id to efficiently query orphaned tickets
CREATE INDEX IF NOT EXISTS idx_tickets_orphaned ON public.tickets(user_id) WHERE group_id IS NULL;

-- Add a helpful function to find orphaned tickets for a user
CREATE OR REPLACE FUNCTION get_orphaned_tickets_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.tickets
  WHERE user_id = p_user_id
  AND group_id IS NULL;
$$;

COMMENT ON FUNCTION get_orphaned_tickets_count IS 'Returns the count of orphaned tickets (no group assigned) for a given user';
