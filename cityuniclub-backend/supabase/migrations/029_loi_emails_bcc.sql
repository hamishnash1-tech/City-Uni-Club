ALTER TABLE loi_emails_sent ADD COLUMN IF NOT EXISTS bcc TEXT;

CREATE OR REPLACE FUNCTION record_loi_email_sent(
    p_loi_request_id UUID,
    p_sent_to TEXT,
    p_cc TEXT,
    p_resend_email_id TEXT,
    p_bcc TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE loi_requests SET status = 'sent' WHERE id = p_loi_request_id;
    INSERT INTO loi_emails_sent (loi_request_id, sent_to, cc, bcc, resend_email_id)
    VALUES (p_loi_request_id, p_sent_to, p_cc, p_bcc, p_resend_email_id);
END;
$$;
