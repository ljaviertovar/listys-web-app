-- =============================================
-- MIGRATION: Rename shopping_runs to shopping_sessions
-- PURPOSE: Update terminology from "shopping run" to "shopping session" for better UX
-- DATE: 2026-02-02
-- =============================================

-- Step 1: Create new enum type
CREATE TYPE shopping_session_status AS ENUM ('active', 'completed');

-- Step 2: Rename tables
ALTER TABLE public.shopping_runs RENAME TO shopping_sessions;
ALTER TABLE public.shopping_run_items RENAME TO shopping_session_items;

-- Step 3: Update column in shopping_session_items
ALTER TABLE public.shopping_session_items
  RENAME COLUMN shopping_run_id TO shopping_session_id;

-- Step 4: Update status column to use new enum type
-- First, drop the default
ALTER TABLE public.shopping_sessions
  ALTER COLUMN status DROP DEFAULT;

-- Change the column type
ALTER TABLE public.shopping_sessions
  ALTER COLUMN status TYPE shopping_session_status
  USING status::text::shopping_session_status;

-- Re-add the default with new type
ALTER TABLE public.shopping_sessions
  ALTER COLUMN status SET DEFAULT 'active'::shopping_session_status;

-- Step 5: Rename indexes
ALTER INDEX idx_shopping_runs_user_id RENAME TO idx_shopping_sessions_user_id;
ALTER INDEX idx_shopping_runs_base_list_id RENAME TO idx_shopping_sessions_base_list_id;
ALTER INDEX idx_shopping_runs_status RENAME TO idx_shopping_sessions_status;
ALTER INDEX idx_shopping_run_items_shopping_run_id RENAME TO idx_shopping_session_items_shopping_session_id;
ALTER INDEX idx_shopping_run_items_sort_order RENAME TO idx_shopping_session_items_sort_order;
ALTER INDEX idx_shopping_run_items_checked RENAME TO idx_shopping_session_items_checked;

-- Step 6: Drop old RLS policies on shopping_sessions
DROP POLICY IF EXISTS "Users can view their own shopping runs" ON public.shopping_sessions;
DROP POLICY IF EXISTS "Users can create their own shopping runs" ON public.shopping_sessions;
DROP POLICY IF EXISTS "Users can update their own shopping runs" ON public.shopping_sessions;
DROP POLICY IF EXISTS "Users can delete their own shopping runs" ON public.shopping_sessions;

-- Step 7: Create new RLS policies on shopping_sessions
CREATE POLICY "Users can view their own shopping sessions"
  ON public.shopping_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping sessions"
  ON public.shopping_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping sessions"
  ON public.shopping_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping sessions"
  ON public.shopping_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Step 8: Drop old RLS policies on shopping_session_items
DROP POLICY IF EXISTS "Users can view items of their shopping runs" ON public.shopping_session_items;
DROP POLICY IF EXISTS "Users can create items in their shopping runs" ON public.shopping_session_items;
DROP POLICY IF EXISTS "Users can update items in their shopping runs" ON public.shopping_session_items;
DROP POLICY IF EXISTS "Users can delete items from their shopping runs" ON public.shopping_session_items;

-- Step 9: Create new RLS policies on shopping_session_items
CREATE POLICY "Users can view items of their shopping sessions"
  ON public.shopping_session_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_sessions
      WHERE shopping_sessions.id = shopping_session_items.shopping_session_id
      AND shopping_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items in their shopping sessions"
  ON public.shopping_session_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shopping_sessions
      WHERE shopping_sessions.id = shopping_session_items.shopping_session_id
      AND shopping_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their shopping sessions"
  ON public.shopping_session_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_sessions
      WHERE shopping_sessions.id = shopping_session_items.shopping_session_id
      AND shopping_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their shopping sessions"
  ON public.shopping_session_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_sessions
      WHERE shopping_sessions.id = shopping_session_items.shopping_session_id
      AND shopping_sessions.user_id = auth.uid()
    )
  );

-- Step 10: Drop old enum type (after confirming new type is in use)
DROP TYPE IF EXISTS shopping_run_status;

-- Step 11: Rename triggers if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_shopping_runs_updated_at'
  ) THEN
    ALTER TRIGGER update_shopping_runs_updated_at
      ON public.shopping_sessions
      RENAME TO update_shopping_sessions_updated_at;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_shopping_run_items_updated_at'
  ) THEN
    ALTER TRIGGER update_shopping_run_items_updated_at
      ON public.shopping_session_items
      RENAME TO update_shopping_session_items_updated_at;
  END IF;
END $$;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- Next steps:
-- 1. Run: npx supabase db push
-- 2. Regenerate types: npx supabase gen types typescript --local > src/features/database.types.ts
-- 3. Update TypeScript code to use new table/type names
-- =============================================
