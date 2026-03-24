ALTER TABLE event_assets ENABLE ROW LEVEL SECURITY;

-- Public read (website displays assets without auth)
CREATE POLICY "Public can read event assets"
  ON event_assets FOR SELECT
  TO public
  USING (true);

-- All writes go through edge functions using service role, which bypasses RLS
