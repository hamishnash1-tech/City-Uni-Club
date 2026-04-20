-- Default member_until to 2027-03-31 and backfill existing rows.

ALTER TABLE members ALTER COLUMN member_until SET DEFAULT '2027-03-31';

UPDATE members SET member_until = '2027-03-31' WHERE member_until IS NULL;
