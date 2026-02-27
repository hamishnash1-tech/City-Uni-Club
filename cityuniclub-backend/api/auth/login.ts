import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL || 'https://myfoyoyjtkqthjjvabmn.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

const generateSessionToken = (): string => {
  return crypto.randomBytes(48).toString('hex');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      // Get member by email
      const { data: member, error: memberError } = await supabase
        .from('members')
        .select('id, email, password_hash, full_name, first_name, membership_number, membership_type, is_active')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (memberError || !member) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password
      const isValid = await verifyPassword(password, member.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Create session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          member_id: member.id,
          token: generateSessionToken(),
          device_info: req.headers['user-agent'] || null,
          ip_address: req.headers['x-forwarded-for'] as string || null,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (sessionError || !sessionData) {
        return res.status(500).json({ error: 'Failed to create session' });
      }

      return res.status(200).json({
        member: {
          id: member.id,
          email: member.email,
          full_name: member.full_name,
          first_name: member.first_name,
          membership_number: member.membership_number,
          membership_type: member.membership_type
        },
        session: {
          token: sessionData.token,
          expires_at: sessionData.expires_at
        }
      });
    } else if (req.method === 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
}
