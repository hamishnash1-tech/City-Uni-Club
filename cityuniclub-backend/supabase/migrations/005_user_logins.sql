CREATE TABLE user_logins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app TEXT NOT NULL CHECK (app IN ('main', 'admin')),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    user_id UUID,
    email TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    logged_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_logins_member_id ON user_logins(member_id);
CREATE INDEX idx_user_logins_user_id ON user_logins(user_id);
CREATE INDEX idx_user_logins_logged_in_at ON user_logins(logged_in_at DESC);

ALTER TABLE user_logins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read user_logins" ON user_logins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );
