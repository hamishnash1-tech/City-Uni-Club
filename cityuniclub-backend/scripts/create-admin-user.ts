/**
 * Create admin user in Supabase Auth
 * Run this once to create the admin account for the admin portal
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Admin user credentials
const adminEmail = 'secretary@cityuniversityclub.co.uk'
const adminPassword = 'CUCAdmin2026!'

async function createAdminUser() {
  console.log('🔧 Creating admin user in Supabase Auth...')
  console.log(`   Email: ${adminEmail}`)
  console.log(`   Password: ${adminPassword}`)
  console.log()

  try {
    // Create user with admin role
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        full_name: 'Club Secretary',
      }
    })

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log('⚠️  User already exists, updating role...')
        
        // Find existing user
        const { data: users } = await supabase.auth.admin.listUsers()
        const existingUser = users.users.find(u => u.email === adminEmail)
        
        if (existingUser) {
          // Update user metadata to add admin role
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              user_metadata: {
                role: 'admin',
                full_name: 'Club Secretary',
              }
            }
          )
          
          if (updateError) throw updateError
          
          console.log('✅ Updated existing user with admin role')
          console.log(`   User ID: ${existingUser.id}`)
        }
      } else {
        throw error
      }
    } else {
      console.log('✅ Admin user created successfully!')
      console.log(`   User ID: ${data.user.id}`)
      console.log(`   Email: ${data.user.email}`)
      console.log(`   Role: admin`)
    }

    console.log()
    console.log('📝 You can now login to the admin portal with:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log()

  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message)
    process.exit(1)
  }
}

createAdminUser()
