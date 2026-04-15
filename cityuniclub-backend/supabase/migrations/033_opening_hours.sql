-- Default opening hours per day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
CREATE TABLE IF NOT EXISTS opening_hours_defaults (
  day_of_week  smallint PRIMARY KEY CHECK (day_of_week BETWEEN 0 AND 6),
  open_time    time,       -- null = closed
  close_time   time,       -- null = closed
  is_closed    boolean NOT NULL DEFAULT false
);

INSERT INTO opening_hours_defaults (day_of_week, open_time, close_time, is_closed) VALUES
  (0, null,    null,    true),   -- Sunday:    Closed
  (1, null,    null,    true),   -- Monday:    Closed
  (2, '09:00', '17:00', false),  -- Tuesday:   9am–5pm
  (3, '09:00', '17:00', false),  -- Wednesday: 9am–5pm
  (4, '09:00', '17:00', false),  -- Thursday:  9am–5pm
  (5, '09:00', '17:00', false),  -- Friday:    9am–5pm
  (6, null,    null,    true)    -- Saturday:  Closed
ON CONFLICT (day_of_week) DO NOTHING;

-- Date-specific overrides (e.g. bank holidays, special events)
CREATE TABLE IF NOT EXISTS opening_hours_overrides (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date        date UNIQUE NOT NULL,
  open_time   time,       -- null = closed
  close_time  time,       -- null = closed
  is_closed   boolean NOT NULL DEFAULT false,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Public read access (opening hours are public info)
ALTER TABLE opening_hours_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_hours_overrides ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'opening_hours_defaults' AND policyname = 'public read defaults') THEN
    CREATE POLICY "public read defaults" ON opening_hours_defaults FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'opening_hours_overrides' AND policyname = 'public read overrides') THEN
    CREATE POLICY "public read overrides" ON opening_hours_overrides FOR SELECT USING (true);
  END IF;
END $$;
