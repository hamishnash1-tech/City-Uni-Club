ALTER TABLE event_bookings
  ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);

-- Backfill from member_email if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_bookings' AND column_name = 'member_email'
  ) THEN
    UPDATE event_bookings
    SET guest_email = member_email
    WHERE guest_email IS NULL AND member_email IS NOT NULL;
  END IF;
END $$;
