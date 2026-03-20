-- Create event_assets table for multiple files per event (PDFs, images, etc.)
CREATE TABLE event_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'Details',
  file_url TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_event_assets_event_id ON event_assets(event_id);

-- Migrate any existing single PDF data into the new table
INSERT INTO event_assets (event_id, type, file_url, file_name, mime_type)
SELECT id, 'Details', pdf_url, pdf_name, 'application/pdf'
FROM events
WHERE pdf_url IS NOT NULL;
