CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    auth_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_auth_user_id ON audit_logs(auth_user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit_logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record_id TEXT;
    v_old JSONB;
    v_new JSONB;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_record_id := OLD.id::TEXT;
        v_old := to_jsonb(OLD);
        v_new := NULL;
    ELSIF TG_OP = 'INSERT' THEN
        v_record_id := NEW.id::TEXT;
        v_old := NULL;
        v_new := to_jsonb(NEW);
    ELSE
        v_record_id := NEW.id::TEXT;
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
    END IF;

    INSERT INTO audit_logs (table_name, operation, record_id, old_data, new_data, auth_user_id)
    VALUES (TG_TABLE_NAME, TG_OP, v_record_id, v_old, v_new, auth.uid());

    RETURN NULL;
END;
$$;

-- Apply trigger to all key tables
CREATE TRIGGER audit_members
    AFTER INSERT OR UPDATE OR DELETE ON members
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER audit_loi_requests
    AFTER INSERT OR UPDATE OR DELETE ON loi_requests
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER audit_event_bookings
    AFTER INSERT OR UPDATE OR DELETE ON event_bookings
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER audit_dining_reservations
    AFTER INSERT OR UPDATE OR DELETE ON dining_reservations
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER audit_reciprocal_clubs
    AFTER INSERT OR UPDATE OR DELETE ON reciprocal_clubs
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER audit_sessions
    AFTER INSERT OR UPDATE OR DELETE ON sessions
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
