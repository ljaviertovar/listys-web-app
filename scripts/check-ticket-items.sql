-- Quick check: Find tickets with mismatch between total_items and actual count
-- Run with: npx supabase db execute --db-url <your-db-url> < scripts/check-ticket-items.sql

SELECT
  t.id,
  t.store_name,
  t.total_items as "total_items_field",
  COUNT(ti.id) as "actual_items_count",
  t.ocr_status,
  t.created_at
FROM tickets t
LEFT JOIN ticket_items ti ON ti.ticket_id = t.id
GROUP BY t.id, t.store_name, t.total_items, t.ocr_status, t.created_at
HAVING t.total_items != COUNT(ti.id)
ORDER BY t.created_at DESC
LIMIT 10;

-- Full details for the most recent ticket with items
\echo '\n--- Most recent ticket with items ---'
SELECT
  t.id as ticket_id,
  t.store_name,
  t.total_items,
  t.ocr_status,
  ti.id as item_id,
  ti.name as item_name,
  ti.quantity,
  ti.price
FROM tickets t
LEFT JOIN ticket_items ti ON ti.ticket_id = t.id
WHERE t.total_items > 0
ORDER BY t.created_at DESC, ti.created_at ASC
LIMIT 30;
