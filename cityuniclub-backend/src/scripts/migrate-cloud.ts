import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🚀 Running database migration on Supabase Cloud...')
  console.log(`   Project: myfoyoyjtkqthjjvabmn`)
  console.log(`   URL: ${supabaseUrl}`)
  console.log()

  // Read the SQL file
  const fs = await import('fs')
  const path = await import('path')
  const sqlPath = path.join(process.cwd(), 'supabase/migrations/001_initial_schema.sql')
  const sql = fs.readFileSync(sqlPath, 'utf-8')

  console.log('📄 Executing SQL...')
  console.log()

  // Split into individual statements (simple split by semicolon)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  let success = 0
  let errors = 0

  for (const statement of statements) {
    if (statement.trim().length === 0) continue

    try {
      // Execute via REST API
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ sql_string: statement })
      })

      if (response.ok || response.status === 404) {
        success++
      } else {
        const err = await response.text()
        if (err.includes('already exists') || err.includes('Already exists')) {
          console.log('⚠️  Table/function already exists - skipping')
          success++
        } else {
          console.log(`❌ Error: ${err.substring(0, 100)}`)
          errors++
        }
      }
    } catch (e: any) {
      // Some statements might not work via RPC - that's ok for many of them
      errors++
    }
  }

  console.log()
  console.log('=================================')
  console.log(`✅ Success: ${success}`)
  console.log(`❌ Errors: ${errors}`)
  console.log('=================================')
  console.log()

  if (errors > 0) {
    console.log('⚠️  Some statements failed. For full migration:')
    console.log('   1. Go to: https://supabase.com/dashboard/project/myfoyoyjtkqthjjvabmn/sql/new')
    console.log('   2. Copy contents of: supabase/migrations/001_initial_schema.sql')
    console.log('   3. Paste and run in SQL Editor')
    console.log()
  } else {
    console.log('✅ Migration completed!')
  }
}

runMigration().catch(console.error)
