ALTER TABLE reciprocal_clubs ADD COLUMN IF NOT EXISTS logo_path VARCHAR(500);

COMMENT ON COLUMN reciprocal_clubs.logo_path IS 'Relative path to club logo asset, e.g. /assets/club-logos/United_Kingdom_London_Bucks_Club.png';
