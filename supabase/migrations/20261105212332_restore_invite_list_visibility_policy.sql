-- Restore invite acceptance access on environments where the shared-list policy is missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'base_lists'
      AND policyname = 'Invited users can view base lists with active invite links'
  ) THEN
    CREATE POLICY "Invited users can view base lists with active invite links"
      ON public.base_lists
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.list_invite_links
          WHERE list_invite_links.base_list_id = base_lists.id
            AND list_invite_links.is_active = TRUE
        )
      );
  END IF;
END;
$$;
