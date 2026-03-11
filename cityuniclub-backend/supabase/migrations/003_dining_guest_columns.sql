-- Add guest contact fields for non-member dining reservations
ALTER TABLE dining_reservations
  ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);
