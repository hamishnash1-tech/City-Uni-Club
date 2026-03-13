-- Table to track emails sent for LOI requests
CREATE TABLE loi_emails_sent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loi_request_id UUID NOT NULL REFERENCES loi_requests(id) ON DELETE CASCADE,
    sent_to TEXT NOT NULL,
    cc TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resend_email_id TEXT
);

CREATE INDEX idx_loi_emails_sent_loi_request_id ON loi_emails_sent(loi_request_id);

ALTER TABLE loi_emails_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage loi_emails_sent" ON loi_emails_sent
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Atomically marks an LOI as sent and records the email
CREATE OR REPLACE FUNCTION record_loi_email_sent(
    p_loi_request_id UUID,
    p_sent_to TEXT,
    p_cc TEXT,
    p_resend_email_id TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE loi_requests SET status = 'sent' WHERE id = p_loi_request_id;
    INSERT INTO loi_emails_sent (loi_request_id, sent_to, cc, resend_email_id)
    VALUES (p_loi_request_id, p_sent_to, p_cc, p_resend_email_id);
END;
$$;
