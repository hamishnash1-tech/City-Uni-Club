ALTER TABLE dining_reservations
  ADD CONSTRAINT dining_reservations_member_xor_guest
  CHECK (
    (member_id IS NOT NULL AND guest_email IS NULL) OR
    (member_id IS NULL AND guest_email IS NOT NULL)
  );
