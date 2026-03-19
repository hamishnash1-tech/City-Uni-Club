-- Fix mutable search_path on all functions.
-- Without SET search_path, a malicious user could create objects in a schema
-- that appears earlier in the search path and hijack function behaviour.
-- Setting it explicitly to 'public, pg_catalog' locks the resolution order.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION get_member_by_email(p_email VARCHAR)
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    password_hash VARCHAR,
    full_name VARCHAR,
    first_name VARCHAR,
    membership_number VARCHAR,
    membership_type membership_type,
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.email, m.password_hash, m.full_name, m.first_name,
           m.membership_number, m.membership_type, m.is_active
    FROM members m
    WHERE m.email = p_email AND m.is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION create_session(
    p_member_id UUID,
    p_device_info VARCHAR DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_session_id UUID;
    v_token VARCHAR;
BEGIN
    v_session_id := uuid_generate_v4();
    v_token := encode(sha256(random()::text::bytea), 'hex');

    INSERT INTO sessions (id, member_id, token, device_info, ip_address, expires_at)
    VALUES (v_session_id, p_member_id, v_token, p_device_info, p_ip_address,
            TIMEZONE('utc', NOW() + INTERVAL '30 days'))
    RETURNING id INTO v_session_id;

    RETURN v_session_id;
END;
$$;

CREATE OR REPLACE FUNCTION validate_session(p_token VARCHAR)
RETURNS TABLE (member_id UUID, is_valid BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
    v_member_id UUID;
BEGIN
    SELECT s.member_id INTO v_member_id
    FROM sessions s
    WHERE s.token = p_token
      AND s.expires_at > TIMEZONE('utc', NOW());

    IF v_member_id IS NOT NULL THEN
        UPDATE sessions SET last_active_at = TIMEZONE('utc', NOW())
        WHERE token = p_token;
        RETURN QUERY SELECT v_member_id, true;
    ELSE
        RETURN QUERY SELECT NULL::UUID, false;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION invalidate_session(p_token VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
    DELETE FROM sessions WHERE token = p_token;
    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION record_loi_email_sent(
    p_loi_request_id UUID,
    p_sent_to TEXT,
    p_cc TEXT,
    p_resend_email_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    UPDATE loi_requests SET status = 'sent' WHERE id = p_loi_request_id;
    INSERT INTO loi_emails_sent (loi_request_id, sent_to, cc, resend_email_id)
    VALUES (p_loi_request_id, p_sent_to, p_cc, p_resend_email_id);
END;
$$;

CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
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
