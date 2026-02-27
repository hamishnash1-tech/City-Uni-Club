import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🚀 Running database migration...')
  console.log(`   URL: ${supabaseUrl}`)

  const sqlPath = join(__dirname, '../../supabase/migrations/001_initial_schema.sql')
  const sql = readFileSync(sqlPath, 'utf-8')

  console.log('\n📄 Executing SQL migration...')
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql })

  if (error) {
    // If rpc doesn't exist, we need to use REST API differently
    console.log('Note: Direct SQL execution not available via RPC')
    console.log('Please run the migration manually in Supabase Dashboard:')
    console.log('1. Go to SQL Editor')
    console.log('2. Copy contents from supabase/migrations/001_initial_schema.sql')
    console.log('3. Paste and run')
    console.log('\nAlternatively, use the Supabase CLI:')
    console.log(`   supabase db push --db-url "${supabaseUrl}"`)
    return false
  }

  console.log('✅ Migration completed successfully!')
  return true
}

runMigration()
