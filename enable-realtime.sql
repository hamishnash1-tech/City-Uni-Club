-- Enable Realtime for loi_requests table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/myfoyoyjtkqthjjvabmn/sql/new

-- Step 1: Enable realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE loi_requests;

-- Step 2: Verify it's enabled
SELECT schemaname, tablename, enabled 
FROM pg_publication_tables 
WHERE tablename = 'loi_requests';

-- If the above shows 'enabled = true', realtime is working!
