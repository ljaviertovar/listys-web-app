-- Migration: Fix merged tickets missing group_id
-- Tickets that were merged to a base list should inherit the group_id from that base list

-- Update all tickets that have a base_list_id but no group_id
-- Set their group_id to match the group_id of their associated base list
UPDATE public.tickets t
SET group_id = bl.group_id
FROM public.base_lists bl
WHERE t.base_list_id = bl.id
  AND t.group_id IS NULL
  AND bl.group_id IS NOT NULL;

-- Add a comment explaining this relationship
COMMENT ON COLUMN public.tickets.base_list_id IS 'Base list ID if this ticket was merged. When set, group_id should match the base_list.group_id.';
