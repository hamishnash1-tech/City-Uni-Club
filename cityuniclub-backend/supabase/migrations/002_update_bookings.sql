-- Add member_email and guest_emails to event_bookings
ALTER TABLE event_bookings 
ADD COLUMN IF NOT EXISTS member_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS guest_emails JSONB DEFAULT '[]';

-- Update existing bookings with member email from members table
UPDATE event_bookings eb
SET member_email = m.email
FROM members m
WHERE eb.member_id = m.id AND eb.member_email IS NULL;

-- Make member_id nullable for non-member bookings
ALTER TABLE event_bookings ALTER COLUMN member_id DROP NOT NULL;
