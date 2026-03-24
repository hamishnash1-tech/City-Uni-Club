-- Allow null passwords; members must use forgot password to set a bcrypt hash
ALTER TABLE members ALTER COLUMN password_hash DROP NOT NULL;
UPDATE members SET password_hash = NULL WHERE password_hash = 'password123';
