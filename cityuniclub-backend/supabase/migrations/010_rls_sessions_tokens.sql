-- Enable RLS on sessions and password_reset_tokens tables.
-- These tables were omitted from initial RLS setup.
-- All legitimate access goes through SECURITY DEFINER functions which bypass RLS,
-- so no policies are needed — enabling RLS with no policies blocks direct API access.

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
