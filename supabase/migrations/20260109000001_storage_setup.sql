-- Create storage bucket for ticket images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tickets', 'tickets', false);

-- RLS for storage bucket
CREATE POLICY "Users can upload their own ticket images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'tickets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own ticket images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'tickets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own ticket images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'tickets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own ticket images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'tickets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
