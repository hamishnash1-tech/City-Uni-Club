#!/usr/bin/env node
/**
 * Create admin user in Supabase Auth
 * Run this to create/update the admin account for the admin portal
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend .env
dotenv.config({ path: join(__dirname, '../cityuniclub-backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Check cityuniclub-backend/.env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Admin user credentials
const adminEmail = 'secretary@cityuniversityclub.co.uk';
const adminPassword = 'CUCAdmin2026!';

async function createAdminUser() {
  console.log('🔧 Creating admin user in Supabase Auth...');
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log();

  try {
    // First, check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) throw listError;

    const existingAdmin = existingUsers.users.find(u => u.email === adminEmail);

    if (existingAdmin) {
      console.log('ℹ️  User already exists, updating admin role...');
      
      // Update user metadata to ensure admin role
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingAdmin.id,
        {
          user_metadata: {
            role: 'admin',
            full_name: 'Club Secretary',
          },
          // Ensure email is confirmed
          email_confirm: true,
        }
      );
      
      if (updateError) throw updateError;
      
      console.log('✅ Updated existing user with admin role');
      console.log(`   User ID: ${existingAdmin.id}`);
      console.log(`   Email Confirmed: ${existingAdmin.email_confirmed_at ? 'Yes' : 'No'}`);
    } else {
      // Create new admin user
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          role: 'admin',
          full_name: 'Club Secretary',
        }
      });

      if (error) throw error;

      console.log('✅ Admin user created successfully!');
      console.log(`   User ID: ${data.user.id}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Role: admin`);
    }

    console.log();
    console.log('📝 You can now login to the admin portal with:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log();
    console.log('🔗 Admin Portal: https://project-9tmp2.vercel.app/login');
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdminUser();
