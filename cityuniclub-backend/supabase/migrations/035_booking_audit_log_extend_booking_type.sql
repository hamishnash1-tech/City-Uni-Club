ALTER TABLE booking_audit_log DROP CONSTRAINT booking_audit_log_booking_type_check;
ALTER TABLE booking_audit_log ADD CONSTRAINT booking_audit_log_booking_type_check
    CHECK (booking_type IN ('dining', 'event', 'event_admin', 'loi'));
