-- Remembers that the person set the purchase date, so reading the receipt again does not overwrite it.
-- Additive only: one column with a default, no rows are changed or removed.
ALTER TABLE public.tickets ADD COLUMN purchase_date_by_user boolean NOT NULL DEFAULT false;
