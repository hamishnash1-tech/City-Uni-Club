-- Convert membership_number from VARCHAR to auto-incrementing integer

-- Drop constraints first
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_membership_number_key;
DROP INDEX IF EXISTS idx_members_membership_number;
ALTER TABLE members ALTER COLUMN membership_number DROP NOT NULL;

-- Add a temporary integer column
ALTER TABLE members ADD COLUMN membership_number_int INTEGER;

-- Assign sequential integers to all existing members ordered by created_at
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS n
  FROM members
)
UPDATE members SET membership_number_int = numbered.n
FROM numbered WHERE members.id = numbered.id;

-- Drop the old column and rename the new one
ALTER TABLE members DROP COLUMN membership_number;
ALTER TABLE members RENAME COLUMN membership_number_int TO membership_number;

-- Create sequence starting after the current max
CREATE SEQUENCE IF NOT EXISTS members_membership_number_seq;
SELECT setval('members_membership_number_seq', COALESCE(MAX(membership_number), 0)) FROM members;

-- Set default and ownership
ALTER TABLE members ALTER COLUMN membership_number SET DEFAULT nextval('members_membership_number_seq');
ALTER TABLE members ALTER COLUMN membership_number SET NOT NULL;
ALTER SEQUENCE members_membership_number_seq OWNED BY members.membership_number;

-- Re-add unique constraint and index
ALTER TABLE members ADD CONSTRAINT members_membership_number_unique UNIQUE (membership_number);
CREATE INDEX idx_members_membership_number ON members(membership_number);
