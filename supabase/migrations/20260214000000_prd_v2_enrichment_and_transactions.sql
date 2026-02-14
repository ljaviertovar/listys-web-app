-- =============================================
-- MIGRATION: PRD v2 enrichment + transactional merge/sync
-- DATE: 2026-02-14
-- =============================================

CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.normalize_item_name(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  normalized TEXT;
BEGIN
  normalized := COALESCE(input_text, '');
  normalized := unaccent(normalized);
  normalized := lower(normalized);
  normalized := regexp_replace(normalized, '[^a-z0-9\s]+', ' ', 'g');
  normalized := regexp_replace(normalized, '\s+', ' ', 'g');
  normalized := btrim(normalized);
  RETURN normalized;
END;
$$;

-- Enrichment fields on base_list_items
ALTER TABLE public.base_list_items
  ADD COLUMN IF NOT EXISTS normalized_name TEXT,
  ADD COLUMN IF NOT EXISTS purchase_count INTEGER,
  ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_purchased_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS average_price NUMERIC;

-- Normalized fields on ticket/session items
ALTER TABLE public.ticket_items
  ADD COLUMN IF NOT EXISTS normalized_name TEXT;

ALTER TABLE public.shopping_session_items
  ADD COLUMN IF NOT EXISTS normalized_name TEXT,
  ADD COLUMN IF NOT EXISTS price NUMERIC;

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS ocr_attempts INTEGER NOT NULL DEFAULT 0;

UPDATE public.base_list_items
SET
  normalized_name = public.normalize_item_name(name),
  purchase_count = COALESCE(purchase_count, 1),
  first_seen_at = COALESCE(first_seen_at, created_at, NOW()),
  last_purchased_at = COALESCE(last_purchased_at, updated_at, created_at, NOW())
WHERE normalized_name IS NULL
   OR purchase_count IS NULL
   OR first_seen_at IS NULL
   OR last_purchased_at IS NULL;

UPDATE public.ticket_items
SET normalized_name = public.normalize_item_name(name)
WHERE normalized_name IS NULL;

UPDATE public.shopping_session_items
SET normalized_name = public.normalize_item_name(name)
WHERE normalized_name IS NULL;

-- Merge duplicated base_list_items before adding unique constraint.
WITH ranked AS (
  SELECT
    id,
    base_list_id,
    public.normalize_item_name(name) AS dedupe_key,
    quantity,
    unit,
    notes,
    category,
    sort_order,
    purchase_count,
    first_seen_at,
    last_purchased_at,
    average_price,
    created_at,
    updated_at,
    ROW_NUMBER() OVER (
      PARTITION BY base_list_id, public.normalize_item_name(name)
      ORDER BY created_at ASC NULLS LAST, id ASC
    ) AS rn
  FROM public.base_list_items
),
agg AS (
  SELECT
    r.base_list_id,
    r.dedupe_key,
    SUM(COALESCE(r.quantity, 0)) AS total_quantity,
    MIN(COALESCE(r.first_seen_at, r.created_at, NOW())) AS merged_first_seen,
    MAX(COALESCE(r.last_purchased_at, r.updated_at, r.created_at, NOW())) AS merged_last_purchased,
    SUM(COALESCE(r.purchase_count, 1)) AS merged_purchase_count,
    AVG(r.average_price) FILTER (WHERE r.average_price IS NOT NULL) AS merged_avg_price
  FROM ranked r
  GROUP BY r.base_list_id, r.dedupe_key
)
UPDATE public.base_list_items bl
SET
  normalized_name = a.dedupe_key,
  quantity = CASE WHEN a.total_quantity > 0 THEN a.total_quantity ELSE bl.quantity END,
  purchase_count = GREATEST(a.merged_purchase_count, 1),
  first_seen_at = a.merged_first_seen,
  last_purchased_at = a.merged_last_purchased,
  average_price = a.merged_avg_price
FROM ranked r
JOIN agg a ON a.base_list_id = r.base_list_id AND a.dedupe_key = r.dedupe_key
WHERE bl.id = r.id
  AND r.rn = 1;

DELETE FROM public.base_list_items bl
USING (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY base_list_id, public.normalize_item_name(name)
        ORDER BY created_at ASC NULLS LAST, id ASC
      ) AS rn
    FROM public.base_list_items
  ) x
  WHERE x.rn > 1
) d
WHERE bl.id = d.id;

ALTER TABLE public.base_list_items
  ALTER COLUMN normalized_name SET NOT NULL,
  ALTER COLUMN purchase_count SET NOT NULL,
  ALTER COLUMN purchase_count SET DEFAULT 1,
  ALTER COLUMN first_seen_at SET NOT NULL,
  ALTER COLUMN first_seen_at SET DEFAULT NOW(),
  ALTER COLUMN last_purchased_at SET NOT NULL,
  ALTER COLUMN last_purchased_at SET DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS uq_base_list_items_base_list_id_normalized_name
  ON public.base_list_items(base_list_id, normalized_name);

CREATE INDEX IF NOT EXISTS idx_base_list_items_dynamic_order
  ON public.base_list_items(base_list_id, purchase_count DESC, last_purchased_at DESC, sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_ticket_items_normalized_name
  ON public.ticket_items(ticket_id, normalized_name);

CREATE INDEX IF NOT EXISTS idx_shopping_session_items_normalized_name
  ON public.shopping_session_items(shopping_session_id, normalized_name);

CREATE OR REPLACE FUNCTION public.set_normalized_name_from_name()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.normalized_name := public.normalize_item_name(NEW.name);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_base_list_items_set_normalized_name ON public.base_list_items;
CREATE TRIGGER trg_base_list_items_set_normalized_name
  BEFORE INSERT OR UPDATE OF name
  ON public.base_list_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_normalized_name_from_name();

DROP TRIGGER IF EXISTS trg_ticket_items_set_normalized_name ON public.ticket_items;
CREATE TRIGGER trg_ticket_items_set_normalized_name
  BEFORE INSERT OR UPDATE OF name
  ON public.ticket_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_normalized_name_from_name();

DROP TRIGGER IF EXISTS trg_shopping_session_items_set_normalized_name ON public.shopping_session_items;
CREATE TRIGGER trg_shopping_session_items_set_normalized_name
  BEFORE INSERT OR UPDATE OF name
  ON public.shopping_session_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_normalized_name_from_name();

CREATE OR REPLACE FUNCTION public.merge_ticket_items_to_base_list(
  p_ticket_id UUID,
  p_base_list_id UUID,
  p_item_ids UUID[] DEFAULT NULL,
  p_max_items INTEGER DEFAULT 250
)
RETURNS TABLE(new_count INTEGER, updated_count INTEGER, skipped_count INTEGER)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_user_id UUID;
  v_group_id UUID;
  v_current_count INTEGER;
  v_potential_new_count INTEGER;
  v_existing RECORD;
  v_price NUMERIC;
  v_sort_order INTEGER;
  rec RECORD;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  PERFORM 1
  FROM public.tickets t
  WHERE t.id = p_ticket_id
    AND t.user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket not found';
  END IF;

  SELECT bl.group_id INTO v_group_id
  FROM public.base_lists bl
  WHERE bl.id = p_base_list_id
    AND bl.user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Base list not found';
  END IF;

  SELECT COUNT(*) INTO v_current_count
  FROM public.base_list_items
  WHERE base_list_id = p_base_list_id;

  WITH source_items AS (
    SELECT DISTINCT ti.normalized_name
    FROM public.ticket_items ti
    WHERE ti.ticket_id = p_ticket_id
      AND (p_item_ids IS NULL OR ti.id = ANY(p_item_ids))
      AND ti.normalized_name IS NOT NULL
      AND ti.normalized_name <> ''
  )
  SELECT COUNT(*) INTO v_potential_new_count
  FROM source_items si
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.base_list_items bli
    WHERE bli.base_list_id = p_base_list_id
      AND bli.normalized_name = si.normalized_name
  );

  IF v_current_count + v_potential_new_count > p_max_items THEN
    RAISE EXCEPTION 'Cannot merge items. This would exceed the maximum limit of % items per list (current: %, trying to add: %).',
      p_max_items, v_current_count, v_potential_new_count;
  END IF;

  new_count := 0;
  updated_count := 0;
  skipped_count := 0;

  FOR rec IN
    SELECT ti.*
    FROM public.ticket_items ti
    WHERE ti.ticket_id = p_ticket_id
      AND (p_item_ids IS NULL OR ti.id = ANY(p_item_ids))
  LOOP
    IF rec.normalized_name IS NULL OR rec.normalized_name = '' THEN
      skipped_count := skipped_count + 1;
      CONTINUE;
    END IF;

    SELECT * INTO v_existing
    FROM public.base_list_items bli
    WHERE bli.base_list_id = p_base_list_id
      AND bli.normalized_name = rec.normalized_name
    FOR UPDATE;

    v_price := rec.price;

    IF FOUND THEN
      UPDATE public.base_list_items
      SET
        quantity = COALESCE(base_list_items.quantity, 0) + COALESCE(rec.quantity, 1),
        unit = COALESCE(base_list_items.unit, rec.unit),
        category = COALESCE(base_list_items.category, rec.category),
        purchase_count = COALESCE(base_list_items.purchase_count, 0) + 1,
        last_purchased_at = NOW(),
        average_price = CASE
          WHEN v_price IS NULL THEN base_list_items.average_price
          WHEN base_list_items.average_price IS NULL THEN v_price
          ELSE ((base_list_items.average_price * GREATEST(COALESCE(base_list_items.purchase_count, 0), 0)) + v_price)
               / (GREATEST(COALESCE(base_list_items.purchase_count, 0), 0) + 1)
        END,
        updated_at = NOW()
      WHERE id = v_existing.id;

      updated_count := updated_count + 1;
    ELSE
      SELECT COALESCE(MAX(sort_order), -1) + 1 INTO v_sort_order
      FROM public.base_list_items
      WHERE base_list_id = p_base_list_id;

      INSERT INTO public.base_list_items (
        base_list_id,
        name,
        quantity,
        unit,
        category,
        sort_order,
        normalized_name,
        purchase_count,
        first_seen_at,
        last_purchased_at,
        average_price
      ) VALUES (
        p_base_list_id,
        rec.name,
        COALESCE(rec.quantity, 1),
        rec.unit,
        rec.category,
        v_sort_order,
        rec.normalized_name,
        1,
        NOW(),
        NOW(),
        v_price
      );

      new_count := new_count + 1;
    END IF;
  END LOOP;

  UPDATE public.tickets
  SET
    base_list_id = p_base_list_id,
    group_id = v_group_id
  WHERE id = p_ticket_id
    AND user_id = v_user_id;

  RETURN QUERY SELECT new_count, updated_count, skipped_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_shopping_session_to_base_list(
  p_session_id UUID,
  p_max_items INTEGER DEFAULT 250
)
RETURNS TABLE(new_count INTEGER, updated_count INTEGER, skipped_count INTEGER)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_user_id UUID;
  v_base_list_id UUID;
  v_current_count INTEGER;
  v_potential_new_count INTEGER;
  v_existing RECORD;
  v_sort_order INTEGER;
  rec RECORD;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT ss.base_list_id INTO v_base_list_id
  FROM public.shopping_sessions ss
  WHERE ss.id = p_session_id
    AND ss.user_id = v_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Shopping session not found';
  END IF;

  SELECT COUNT(*) INTO v_current_count
  FROM public.base_list_items
  WHERE base_list_id = v_base_list_id;

  WITH source_items AS (
    SELECT DISTINCT ssi.normalized_name
    FROM public.shopping_session_items ssi
    WHERE ssi.shopping_session_id = p_session_id
      AND COALESCE(ssi.checked, FALSE) = TRUE
      AND ssi.normalized_name IS NOT NULL
      AND ssi.normalized_name <> ''
  )
  SELECT COUNT(*) INTO v_potential_new_count
  FROM source_items si
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.base_list_items bli
    WHERE bli.base_list_id = v_base_list_id
      AND bli.normalized_name = si.normalized_name
  );

  IF v_current_count + v_potential_new_count > p_max_items THEN
    RAISE EXCEPTION 'Cannot sync items. This would exceed the maximum limit of % items per list (current: %, trying to add: %).',
      p_max_items, v_current_count, v_potential_new_count;
  END IF;

  new_count := 0;
  updated_count := 0;
  skipped_count := 0;

  FOR rec IN
    SELECT *
    FROM public.shopping_session_items ssi
    WHERE ssi.shopping_session_id = p_session_id
      AND COALESCE(ssi.checked, FALSE) = TRUE
  LOOP
    IF rec.normalized_name IS NULL OR rec.normalized_name = '' THEN
      skipped_count := skipped_count + 1;
      CONTINUE;
    END IF;

    SELECT * INTO v_existing
    FROM public.base_list_items bli
    WHERE bli.base_list_id = v_base_list_id
      AND bli.normalized_name = rec.normalized_name
    FOR UPDATE;

    IF FOUND THEN
      UPDATE public.base_list_items
      SET
        quantity = rec.quantity,
        unit = rec.unit,
        notes = rec.notes,
        category = rec.category,
        purchase_count = COALESCE(base_list_items.purchase_count, 0) + 1,
        last_purchased_at = NOW(),
        average_price = CASE
          WHEN rec.price IS NULL THEN base_list_items.average_price
          WHEN base_list_items.average_price IS NULL THEN rec.price
          ELSE ((base_list_items.average_price * GREATEST(COALESCE(base_list_items.purchase_count, 0), 0)) + rec.price)
               / (GREATEST(COALESCE(base_list_items.purchase_count, 0), 0) + 1)
        END,
        updated_at = NOW()
      WHERE id = v_existing.id;

      updated_count := updated_count + 1;
    ELSE
      SELECT COALESCE(MAX(sort_order), -1) + 1 INTO v_sort_order
      FROM public.base_list_items
      WHERE base_list_id = v_base_list_id;

      INSERT INTO public.base_list_items (
        base_list_id,
        name,
        quantity,
        unit,
        notes,
        category,
        sort_order,
        normalized_name,
        purchase_count,
        first_seen_at,
        last_purchased_at,
        average_price
      ) VALUES (
        v_base_list_id,
        rec.name,
        COALESCE(rec.quantity, 1),
        rec.unit,
        rec.notes,
        rec.category,
        v_sort_order,
        rec.normalized_name,
        1,
        NOW(),
        NOW(),
        rec.price
      );

      new_count := new_count + 1;
    END IF;
  END LOOP;

  RETURN QUERY SELECT new_count, updated_count, skipped_count;
END;
$$;
