CREATE TABLE booking_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_type VARCHAR(20) NOT NULL CHECK (booking_type IN ('dining', 'event')),
    booking_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    previous_value JSONB,
    new_value JSONB,
    performed_by_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    performed_by_admin_email VARCHAR(255),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_booking_audit_log_booking ON booking_audit_log(booking_type, booking_id);
CREATE INDEX idx_booking_audit_log_performed_at ON booking_audit_log(performed_at DESC);
