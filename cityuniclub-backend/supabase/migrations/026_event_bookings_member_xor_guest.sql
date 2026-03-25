ALTER TABLE event_bookings
  ADD CONSTRAINT event_bookings_member_xor_guest
  CHECK (
    (member_id IS NOT NULL AND guest_email IS NULL) OR
    (member_id IS NULL AND guest_email IS NOT NULL)
  );
