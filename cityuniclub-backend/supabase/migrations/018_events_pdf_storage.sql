-- Add PDF fields to events table
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS pdf_url  TEXT,
  ADD COLUMN IF NOT EXISTS pdf_name TEXT;

-- Create storage bucket for event PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-pdfs', 'event-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "event_pdfs_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-pdfs');

-- Admin upload
CREATE POLICY "event_pdfs_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-pdfs'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Admin delete
CREATE POLICY "event_pdfs_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-pdfs'
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
