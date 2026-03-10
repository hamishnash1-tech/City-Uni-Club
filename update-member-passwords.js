#!/usr/bin/env node
/**
 * Add passwords for test member accounts
 * Run this to enable login for test members
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load backend .env
const envPath = join(__dirname, '../cityuniclub-backend/.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test member accounts to update
const testMembers = [
  { email: 'stephen.rayner@email.com', password: 'password123' },
  { email: 'james.smith@email.com', password: 'password123' },
  { email: 'emma.jones@email.com', password: 'password123' },
  { email: 'secretary@cityuniversityclub.co.uk', password: 'password123' }
];

async function updateMemberPasswords() {
  console.log('🔧 Updating member passwords...\n');
  
  for (const member of testMembers) {
    try {
      // Update password_hash in members table
      const { error } = await supabase
        .from('members')
        .update({ 
          password_hash: member.password,
          is_active: true
        })
        .eq('email', member.email);
      
      if (error) {
        console.log(`❌ ${member.email}: ${error.message}`);
      } else {
        console.log(`✅ ${member.email}: Password set to '${member.password}'`);
      }
    } catch (error) {
      console.log(`❌ ${member.email}: ${error.message}`);
    }
  }
  
  console.log('\n📝 Test credentials:');
  console.log('   Email: stephen.rayner@email.com');
  console.log('   Password: password123');
  console.log('\n   Or use:');
  console.log('   Email: secretary@cityuniversityclub.co.uk');
  console.log('   Password: password123');
}

updateMemberPasswords();
