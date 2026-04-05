-- =============================================
-- MIGRATION: Phase 1 — Shared Lists via Invite Links
-- DATE: 2026-04-01
-- =============================================
-- Adds:
--   1. list_collaborators   — tracks per-list access grants
--   2. list_invite_links    — short-lived shareable tokens
--   3. Updated RLS on base_lists / base_list_items to include collaborators
--   4. shopping_session_participants   — Phase 2 prep (tracks active shoppers)
--   5. Updated RLS on shopping_sessions / shopping_session_items for collaborators
-- =============================================

-- =============================================
-- 0. HELPER FUNCTION (breaks RLS circular reference)
-- =============================================
-- Reads base_lists as SECURITY DEFINER to avoid the recursion:
--   base_lists SELECT policy -> list_collaborators -> base_lists -> ...
CREATE OR REPLACE FUNCTION public.current_user_owns_list(p_list_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.base_lists
    WHERE id = p_list_id AND user_id = auth.uid()
  );
$$;

-- =============================================
-- 1. LIST_COLLABORATORS
-- =============================================
CREATE TABLE IF NOT EXISTS public.list_collaborators (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_list_id     UUID NOT NULL REFERENCES public.base_lists(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- role column is for future extensibility; all current collaborators are 'editor'
  role             TEXT NOT NULL DEFAULT 'editor',
  invited_by       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_list_collaborators_list_user UNIQUE (base_list_id, user_id)
);

ALTER TABLE public.list_collaborators ENABLE ROW LEVEL SECURITY;

-- Owner of the list sees all collaborators; collaborators see each other
CREATE POLICY "List owner or collaborators can view collaborators"
  ON public.list_collaborators FOR SELECT
  USING (
    public.current_user_owns_list(base_list_id)
    OR user_id = auth.uid()
  );

-- Only the list owner can add collaborators (via invite acceptance flow)
CREATE POLICY "List owner can add collaborators"
  ON public.list_collaborators FOR INSERT
  WITH CHECK (
    public.current_user_owns_list(base_list_id)
  );

-- Owner can remove anyone; collaborators can remove themselves
CREATE POLICY "List owner or self can remove collaborator"
  ON public.list_collaborators FOR DELETE
  USING (
    user_id = auth.uid()
    OR public.current_user_owns_list(base_list_id)
  );

CREATE INDEX idx_list_collaborators_base_list_id ON public.list_collaborators(base_list_id);
CREATE INDEX idx_list_collaborators_user_id ON public.list_collaborators(user_id);

-- =============================================
-- 2. LIST_INVITE_LINKS
-- =============================================
CREATE TABLE IF NOT EXISTS public.list_invite_links (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_list_id UUID NOT NULL REFERENCES public.base_lists(id) ON DELETE CASCADE,
  -- token is a cryptographically random URL-safe string generated at the app layer
  token        TEXT NOT NULL,
  created_by   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at   TIMESTAMPTZ,
  max_uses     INTEGER,
  use_count    INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_list_invite_links_token UNIQUE (token),
  CONSTRAINT chk_max_uses_positive CHECK (max_uses IS NULL OR max_uses > 0),
  CONSTRAINT chk_use_count_non_negative CHECK (use_count >= 0)
);

ALTER TABLE public.list_invite_links ENABLE ROW LEVEL SECURITY;

-- List owner manages invite links; any authenticated user can read a link by token
CREATE POLICY "List owner can view invite links"
  ON public.list_invite_links FOR SELECT
  USING (
    public.current_user_owns_list(base_list_id)
    OR auth.uid() IS NOT NULL
  );

CREATE POLICY "List owner can create invite links"
  ON public.list_invite_links FOR INSERT
  WITH CHECK (
    public.current_user_owns_list(base_list_id)
  );

CREATE POLICY "List owner can update invite links"
  ON public.list_invite_links FOR UPDATE
  USING (
    public.current_user_owns_list(base_list_id)
  );

CREATE POLICY "List owner can delete invite links"
  ON public.list_invite_links FOR DELETE
  USING (
    public.current_user_owns_list(base_list_id)
  );

CREATE UNIQUE INDEX idx_list_invite_links_token ON public.list_invite_links(token);
CREATE INDEX idx_list_invite_links_base_list_id ON public.list_invite_links(base_list_id);

-- =============================================
-- 3. EXTEND RLS ON base_lists — add shared access
-- =============================================

-- Collaborators can view shared lists
CREATE POLICY "Collaborators can view shared base lists"
  ON public.base_lists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.list_collaborators
      WHERE list_collaborators.base_list_id = base_lists.id
        AND list_collaborators.user_id = auth.uid()
    )
  );

-- Collaborators can update shared lists (add/edit items, not rename/delete)
CREATE POLICY "Collaborators can update shared base lists"
  ON public.base_lists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.list_collaborators
      WHERE list_collaborators.base_list_id = base_lists.id
        AND list_collaborators.user_id = auth.uid()
    )
  );

-- =============================================
-- 4. EXTEND RLS ON base_list_items — add shared access
-- =============================================

-- Collaborators can view items in shared lists
CREATE POLICY "Collaborators can view items in shared base lists"
  ON public.base_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.list_collaborators
      WHERE list_collaborators.base_list_id = base_list_items.base_list_id
        AND list_collaborators.user_id = auth.uid()
    )
  );

-- Collaborators can add items to shared lists
CREATE POLICY "Collaborators can create items in shared base lists"
  ON public.base_list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.list_collaborators
      WHERE list_collaborators.base_list_id = base_list_items.base_list_id
        AND list_collaborators.user_id = auth.uid()
    )
  );

-- Collaborators can update items in shared lists
CREATE POLICY "Collaborators can update items in shared base lists"
  ON public.base_list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.list_collaborators
      WHERE list_collaborators.base_list_id = base_list_items.base_list_id
        AND list_collaborators.user_id = auth.uid()
    )
  );

-- Collaborators can delete items in shared lists
CREATE POLICY "Collaborators can delete items in shared base lists"
  ON public.base_list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.list_collaborators
      WHERE list_collaborators.base_list_id = base_list_items.base_list_id
        AND list_collaborators.user_id = auth.uid()
    )
  );

-- =============================================
-- 5. SHOPPING_SESSION_PARTICIPANTS (Phase 2 prep)
-- =============================================
CREATE TABLE IF NOT EXISTS public.shopping_session_participants (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_session_id  UUID NOT NULL REFERENCES public.shopping_sessions(id) ON DELETE CASCADE,
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 'shopping' = currently active in the session; 'idle' = joined but inactive
  status               TEXT NOT NULL DEFAULT 'shopping',
  last_active_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_shopping_session_participants UNIQUE (shopping_session_id, user_id),
  CONSTRAINT chk_participant_status CHECK (status IN ('shopping', 'idle'))
);

ALTER TABLE public.shopping_session_participants ENABLE ROW LEVEL SECURITY;

-- Participants and session owners can view participants
CREATE POLICY "Session participants can view other participants"
  ON public.shopping_session_participants FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.shopping_sessions
      WHERE shopping_sessions.id = shopping_session_participants.shopping_session_id
        AND shopping_sessions.user_id = auth.uid()
    )
  );

-- Users can join sessions for shared lists they have access to
CREATE POLICY "Users can join sessions they have access to"
  ON public.shopping_session_participants FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND (
      -- session owner
      EXISTS (
        SELECT 1 FROM public.shopping_sessions
        WHERE shopping_sessions.id = shopping_session_participants.shopping_session_id
          AND shopping_sessions.user_id = auth.uid()
      )
      -- or collaborator on the base list
      OR EXISTS (
        SELECT 1
        FROM public.shopping_sessions ss
        JOIN public.list_collaborators lc ON lc.base_list_id = ss.base_list_id
        WHERE ss.id = shopping_session_participants.shopping_session_id
          AND lc.user_id = auth.uid()
      )
    )
  );

-- Users can update their own participation status
CREATE POLICY "Users can update their own participation"
  ON public.shopping_session_participants FOR UPDATE
  USING (user_id = auth.uid());

-- Users can remove themselves; session owner can remove anyone
CREATE POLICY "Users can leave or owner can remove participants"
  ON public.shopping_session_participants FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.shopping_sessions
      WHERE shopping_sessions.id = shopping_session_participants.shopping_session_id
        AND shopping_sessions.user_id = auth.uid()
    )
  );

CREATE INDEX idx_shopping_session_participants_session_id ON public.shopping_session_participants(shopping_session_id);
CREATE INDEX idx_shopping_session_participants_user_id ON public.shopping_session_participants(user_id);

-- =============================================
-- 6. EXTEND RLS ON shopping_sessions — collaborators can view/update
-- =============================================

-- Collaborators on the base list can view sessions on that list
CREATE POLICY "Collaborators can view sessions on shared lists"
  ON public.shopping_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.list_collaborators
      WHERE list_collaborators.base_list_id = shopping_sessions.base_list_id
        AND list_collaborators.user_id = auth.uid()
    )
  );

-- Collaborators can update session items (e.g., check off items during shopping)
CREATE POLICY "Collaborators can update sessions on shared lists"
  ON public.shopping_sessions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.list_collaborators
      WHERE list_collaborators.base_list_id = shopping_sessions.base_list_id
        AND list_collaborators.user_id = auth.uid()
    )
  );

-- =============================================
-- 7. EXTEND RLS ON shopping_session_items — collaborators can check items
-- =============================================

-- Collaborators can view session items
CREATE POLICY "Collaborators can view items in sessions on shared lists"
  ON public.shopping_session_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.shopping_sessions ss
      JOIN public.list_collaborators lc ON lc.base_list_id = ss.base_list_id
      WHERE ss.id = shopping_session_items.shopping_session_id
        AND lc.user_id = auth.uid()
    )
  );

-- Collaborators can update (check/uncheck) session items
CREATE POLICY "Collaborators can update items in sessions on shared lists"
  ON public.shopping_session_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.shopping_sessions ss
      JOIN public.list_collaborators lc ON lc.base_list_id = ss.base_list_id
      WHERE ss.id = shopping_session_items.shopping_session_id
        AND lc.user_id = auth.uid()
    )
  );

-- Collaborators can add items to active sessions
CREATE POLICY "Collaborators can insert items in sessions on shared lists"
  ON public.shopping_session_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.shopping_sessions ss
      JOIN public.list_collaborators lc ON lc.base_list_id = ss.base_list_id
      WHERE ss.id = shopping_session_items.shopping_session_id
        AND lc.user_id = auth.uid()
    )
  );

-- Collaborators can delete items from active sessions
CREATE POLICY "Collaborators can delete items in sessions on shared lists"
  ON public.shopping_session_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.shopping_sessions ss
      JOIN public.list_collaborators lc ON lc.base_list_id = ss.base_list_id
      WHERE ss.id = shopping_session_items.shopping_session_id
        AND lc.user_id = auth.uid()
    )
  );
