-- Fix Supabase Realtime for collaborators.
--
-- Supabase Realtime evaluates RLS policies using the subscriber JWT before
-- forwarding a postgres_changes event. Policies that JOIN tables which
-- themselves have RLS policies can fail silently during this evaluation,
-- causing collaborators to receive no events even when entitled to see the rows.
--
-- The existing codebase already uses the SECURITY DEFINER pattern to avoid this
-- (see current_user_owns_list). We apply the same pattern here.
--
-- No rows are removed or modified. This only updates policy definitions.

-- 1. HELPER FUNCTIONS (SECURITY DEFINER)

CREATE OR REPLACE FUNCTION public.current_user_is_list_collaborator(p_list_id UUID)
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.list_collaborators WHERE base_list_id = p_list_id AND user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_session_collaborator(p_session_id UUID)
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.shopping_sessions ss
    JOIN public.list_collaborators lc ON lc.base_list_id = ss.base_list_id
    WHERE ss.id = p_session_id AND lc.user_id = auth.uid()
  );
$$;

-- 2. REBUILD base_list_items COLLABORATOR POLICIES

DROP POLICY IF EXISTS "Collaborators can view items in shared base lists" ON public.base_list_items;
DROP POLICY IF EXISTS "Collaborators can create items in shared base lists" ON public.base_list_items;
DROP POLICY IF EXISTS "Collaborators can update items in shared base lists" ON public.base_list_items;
DROP POLICY IF EXISTS "Collaborators can delete items in shared base lists" ON public.base_list_items;

CREATE POLICY "Collaborators can view items in shared base lists" ON public.base_list_items FOR SELECT USING (public.current_user_is_list_collaborator(base_list_id));
CREATE POLICY "Collaborators can create items in shared base lists" ON public.base_list_items FOR INSERT WITH CHECK (public.current_user_is_list_collaborator(base_list_id));
CREATE POLICY "Collaborators can update items in shared base lists" ON public.base_list_items FOR UPDATE USING (public.current_user_is_list_collaborator(base_list_id));
CREATE POLICY "Collaborators can delete items in shared base lists" ON public.base_list_items FOR DELETE USING (public.current_user_is_list_collaborator(base_list_id));

-- 3. REBUILD shopping_session_items COLLABORATOR POLICIES

DROP POLICY IF EXISTS "Collaborators can view items in sessions on shared lists" ON public.shopping_session_items;
DROP POLICY IF EXISTS "Collaborators can update items in sessions on shared lists" ON public.shopping_session_items;
DROP POLICY IF EXISTS "Collaborators can insert items in sessions on shared lists" ON public.shopping_session_items;
DROP POLICY IF EXISTS "Collaborators can delete items in sessions on shared lists" ON public.shopping_session_items;

CREATE POLICY "Collaborators can view items in sessions on shared lists" ON public.shopping_session_items FOR SELECT USING (public.current_user_is_session_collaborator(shopping_session_id));
CREATE POLICY "Collaborators can update items in sessions on shared lists" ON public.shopping_session_items FOR UPDATE USING (public.current_user_is_session_collaborator(shopping_session_id));
CREATE POLICY "Collaborators can insert items in sessions on shared lists" ON public.shopping_session_items FOR INSERT WITH CHECK (public.current_user_is_session_collaborator(shopping_session_id));
CREATE POLICY "Collaborators can delete items in sessions on shared lists" ON public.shopping_session_items FOR DELETE USING (public.current_user_is_session_collaborator(shopping_session_id));
