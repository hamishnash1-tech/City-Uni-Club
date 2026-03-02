import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://myfoyoyjtkqthjjvabmn.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Zm95b3lqdGtxdGhqanZhYm1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDI5NDAsImV4cCI6MjA4Nzc3ODk0MH0._OhoEKRYAZ0C7oon9e_WSj7p47pJlWQmqBgx2CtBtdg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export const EDGE_FUNCTIONS_URL = 'https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1'
