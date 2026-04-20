-- Convert membership_number back to VARCHAR and drop uniqueness so CSV
-- values like '001920f', '001920H', '01947' can be stored verbatim.
-- The auto-increment sequence (added in 024) is dropped; new members
-- will have membership_number assigned from the CSV or manually.

ALTER TABLE members ALTER COLUMN membership_number DROP DEFAULT;
ALTER TABLE members ALTER COLUMN membership_number DROP NOT NULL;
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_membership_number_unique;
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_membership_number_key;
DROP SEQUENCE IF EXISTS members_membership_number_seq;

ALTER TABLE members ALTER COLUMN membership_number TYPE VARCHAR(50) USING membership_number::VARCHAR;

-- Keep the index for lookup performance; just not unique anymore.
DROP INDEX IF EXISTS idx_members_membership_number;
CREATE INDEX idx_members_membership_number ON members(membership_number);
