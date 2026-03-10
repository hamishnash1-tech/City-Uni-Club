# 🔴 CRITICAL: Enable Realtime for LOI Notifications

## Problem
Supabase Realtime is NOT enabled on the `loi_requests` table.
This means the admin dashboard cannot receive real-time notifications.

## Solution - Choose ONE method:

### Method 1: Supabase Dashboard (EASIEST)

1. **Go to:** https://supabase.com/dashboard/project/myfoyoyjtkqthjjvabmn/database/replication

2. **Find the table:** Look for `loi_requests` in the list

3. **Toggle ON:** Click the toggle switch next to `loi_requests`
   - Switch should turn BLUE (enabled)

4. **If table not listed:**
   - Click "Add Source" button
   - Select `loi_requests` from dropdown
   - Click "Save"

### Method 2: SQL Editor

1. **Go to:** https://supabase.com/dashboard/project/myfoyoyjtkqthjjvabmn/sql/new

2. **Paste this SQL:**
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE loi_requests;
   ```

3. **Click "Run"**

4. **Verify success:** Should see "Success. No rows returned"

## Verify It Worked

Run this SQL to check:
```sql
SELECT tablename, enabled 
FROM pg_publication_tables 
WHERE tablename = 'loi_requests';
```

Should return: `enabled = true`

## After Enabling Realtime

1. **Refresh admin dashboard:** https://admin.cityuniversityclub.co.uk
2. **Allow notifications** when browser prompts
3. **Submit LOI from website** in another window
4. **Dashboard will auto-update** within 2-3 seconds
