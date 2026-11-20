ALTER TABLE public.tickets
  ADD COLUMN include_in_spending boolean NOT NULL DEFAULT false;
