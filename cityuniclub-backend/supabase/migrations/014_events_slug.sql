ALTER TABLE events ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

UPDATE events
SET slug = CONCAT(
  COALESCE(TO_CHAR(event_date, 'YYYY-MM-DD'), 'tba'),
  '-',
  LOWER(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g')),
  '-',
  LEFT(REPLACE(id::text, '-', ''), 8)
)
WHERE slug IS NULL;

ALTER TABLE events ALTER COLUMN slug SET NOT NULL;
ALTER TABLE events ADD CONSTRAINT events_slug_unique UNIQUE (slug);
CREATE INDEX idx_events_slug ON events(slug);
