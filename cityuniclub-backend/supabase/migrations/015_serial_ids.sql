-- Add serial short_id to events, assigned in date order
ALTER TABLE events ADD COLUMN IF NOT EXISTS short_id INTEGER;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY event_date ASC NULLS LAST, created_at ASC) AS n
  FROM events
)
UPDATE events SET short_id = numbered.n
FROM numbered WHERE events.id = numbered.id;

CREATE SEQUENCE IF NOT EXISTS events_short_id_seq START WITH 1;
ALTER TABLE events ALTER COLUMN short_id SET DEFAULT nextval('events_short_id_seq');
ALTER SEQUENCE events_short_id_seq OWNED BY events.short_id;
SELECT setval('events_short_id_seq', COALESCE(MAX(short_id), 0)) FROM events;
ALTER TABLE events ADD CONSTRAINT events_short_id_unique UNIQUE (short_id);

-- Add serial short_id to club_news, assigned in published_date order
ALTER TABLE club_news ADD COLUMN IF NOT EXISTS short_id INTEGER;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY published_date ASC, created_at ASC) AS n
  FROM club_news
)
UPDATE club_news SET short_id = numbered.n
FROM numbered WHERE club_news.id = numbered.id;

CREATE SEQUENCE IF NOT EXISTS club_news_short_id_seq START WITH 1;
ALTER TABLE club_news ALTER COLUMN short_id SET DEFAULT nextval('club_news_short_id_seq');
ALTER SEQUENCE club_news_short_id_seq OWNED BY club_news.short_id;
SELECT setval('club_news_short_id_seq', COALESCE(MAX(short_id), 0)) FROM club_news;
ALTER TABLE club_news ADD CONSTRAINT club_news_short_id_unique UNIQUE (short_id);
