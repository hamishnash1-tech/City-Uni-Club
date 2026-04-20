-- Add CSV-sourced membership categories to the membership_type enum.
-- These coexist with the existing values (Full Membership, Associate Membership,
-- Junior Membership, Senior Membership, Corporate Membership) since Postgres
-- does not support removing enum values without a full type rebuild.

ALTER TYPE membership_type ADD VALUE IF NOT EXISTS 'Country';
ALTER TYPE membership_type ADD VALUE IF NOT EXISTS 'Overseas';
ALTER TYPE membership_type ADD VALUE IF NOT EXISTS 'Full 35 to 59';
ALTER TYPE membership_type ADD VALUE IF NOT EXISTS 'Under 35';
ALTER TYPE membership_type ADD VALUE IF NOT EXISTS '60 to 64';
ALTER TYPE membership_type ADD VALUE IF NOT EXISTS '65 to 69';
ALTER TYPE membership_type ADD VALUE IF NOT EXISTS '70 and over';
ALTER TYPE membership_type ADD VALUE IF NOT EXISTS 'Retired 65 to 69';
ALTER TYPE membership_type ADD VALUE IF NOT EXISTS 'Honorary';
ALTER TYPE membership_type ADD VALUE IF NOT EXISTS 'Spousal';
ALTER TYPE membership_type ADD VALUE IF NOT EXISTS 'Group';
ALTER TYPE membership_type ADD VALUE IF NOT EXISTS 'Old Stoics';
