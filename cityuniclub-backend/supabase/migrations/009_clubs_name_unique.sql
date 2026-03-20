ALTER TABLE reciprocal_clubs ALTER COLUMN name SET NOT NULL;
ALTER TABLE reciprocal_clubs DROP CONSTRAINT IF EXISTS reciprocal_clubs_name_unique;
ALTER TABLE reciprocal_clubs ADD CONSTRAINT reciprocal_clubs_name_unique UNIQUE (name);
