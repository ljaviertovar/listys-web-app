-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- GROUPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own groups"
  ON public.groups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own groups"
  ON public.groups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own groups"
  ON public.groups FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_groups_user_id ON public.groups(user_id);

-- =============================================
-- BASE LISTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.base_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for base_lists
ALTER TABLE public.base_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own base lists"
  ON public.base_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own base lists"
  ON public.base_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own base lists"
  ON public.base_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own base lists"
  ON public.base_lists FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_base_lists_user_id ON public.base_lists(user_id);
CREATE INDEX idx_base_lists_group_id ON public.base_lists(group_id);

-- =============================================
-- BASE LIST ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.base_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_list_id UUID NOT NULL REFERENCES public.base_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit TEXT,
  notes TEXT,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for base_list_items
ALTER TABLE public.base_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items of their base lists"
  ON public.base_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.base_lists
      WHERE base_lists.id = base_list_items.base_list_id
      AND base_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items in their base lists"
  ON public.base_list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.base_lists
      WHERE base_lists.id = base_list_items.base_list_id
      AND base_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their base lists"
  ON public.base_list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.base_lists
      WHERE base_lists.id = base_list_items.base_list_id
      AND base_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their base lists"
  ON public.base_list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.base_lists
      WHERE base_lists.id = base_list_items.base_list_id
      AND base_lists.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_base_list_items_base_list_id ON public.base_list_items(base_list_id);
CREATE INDEX idx_base_list_items_sort_order ON public.base_list_items(sort_order);

-- =============================================
-- SHOPPING RUNS TABLE
-- =============================================
CREATE TYPE shopping_run_status AS ENUM ('active', 'completed');

CREATE TABLE IF NOT EXISTS public.shopping_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_list_id UUID NOT NULL REFERENCES public.base_lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status shopping_run_status DEFAULT 'active',
  total_amount NUMERIC,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  sync_to_base BOOLEAN DEFAULT false,
  general_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for shopping_runs
ALTER TABLE public.shopping_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own shopping runs"
  ON public.shopping_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shopping runs"
  ON public.shopping_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shopping runs"
  ON public.shopping_runs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shopping runs"
  ON public.shopping_runs FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_shopping_runs_user_id ON public.shopping_runs(user_id);
CREATE INDEX idx_shopping_runs_base_list_id ON public.shopping_runs(base_list_id);
CREATE INDEX idx_shopping_runs_status ON public.shopping_runs(status);

-- =============================================
-- SHOPPING RUN ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.shopping_run_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shopping_run_id UUID NOT NULL REFERENCES public.shopping_runs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit TEXT,
  checked BOOLEAN DEFAULT false,
  notes TEXT,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for shopping_run_items
ALTER TABLE public.shopping_run_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items of their shopping runs"
  ON public.shopping_run_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_runs
      WHERE shopping_runs.id = shopping_run_items.shopping_run_id
      AND shopping_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items in their shopping runs"
  ON public.shopping_run_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shopping_runs
      WHERE shopping_runs.id = shopping_run_items.shopping_run_id
      AND shopping_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their shopping runs"
  ON public.shopping_run_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_runs
      WHERE shopping_runs.id = shopping_run_items.shopping_run_id
      AND shopping_runs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their shopping runs"
  ON public.shopping_run_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_runs
      WHERE shopping_runs.id = shopping_run_items.shopping_run_id
      AND shopping_runs.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_shopping_run_items_shopping_run_id ON public.shopping_run_items(shopping_run_id);
CREATE INDEX idx_shopping_run_items_sort_order ON public.shopping_run_items(sort_order);
CREATE INDEX idx_shopping_run_items_checked ON public.shopping_run_items(checked);

-- =============================================
-- TICKETS TABLE
-- =============================================
CREATE TYPE ocr_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  base_list_id UUID REFERENCES public.base_lists(id) ON DELETE SET NULL,
  image_path TEXT NOT NULL,
  store_name TEXT,
  total_items INTEGER DEFAULT 0,
  processed_at TIMESTAMP WITH TIME ZONE,
  ocr_status ocr_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets"
  ON public.tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets"
  ON public.tickets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tickets"
  ON public.tickets FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX idx_tickets_ocr_status ON public.tickets(ocr_status);
CREATE INDEX idx_tickets_created_at ON public.tickets(created_at DESC);

-- =============================================
-- TICKET ITEMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.ticket_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  price NUMERIC,
  unit TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for ticket_items
ALTER TABLE public.ticket_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items of their tickets"
  ON public.ticket_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = ticket_items.ticket_id
      AND tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items in their tickets"
  ON public.ticket_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = ticket_items.ticket_id
      AND tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their tickets"
  ON public.ticket_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = ticket_items.ticket_id
      AND tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their tickets"
  ON public.ticket_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = ticket_items.ticket_id
      AND tickets.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_ticket_items_ticket_id ON public.ticket_items(ticket_id);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_base_lists_updated_at
  BEFORE UPDATE ON public.base_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_base_list_items_updated_at
  BEFORE UPDATE ON public.base_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_runs_updated_at
  BEFORE UPDATE ON public.shopping_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_run_items_updated_at
  BEFORE UPDATE ON public.shopping_run_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
