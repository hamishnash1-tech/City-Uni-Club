ALTER TABLE club_news ADD COLUMN IF NOT EXISTS is_banner BOOLEAN NOT NULL DEFAULT false;

-- Enforce at most one active banner at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_club_news_single_banner
  ON club_news (is_banner)
  WHERE is_banner = true;
