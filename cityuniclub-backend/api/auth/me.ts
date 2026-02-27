import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://myfoyoyjtkqthjjvabmn.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function authenticate(req: VercelRequest): Promise<string | null> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  const { data } = await supabase
    .from('sessions')
    .select('member_id')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  return data?.member_id || null;
}

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
    if (req.method === 'GET') {
      const member_id = await authenticate(req);
      
      if (!member_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { data: member, error } = await supabase
        .from('members')
        .select('id, email, full_name, first_name, phone_number, membership_number, membership_type, member_since, member_until, is_active')
        .eq('id', member_id)
        .single();

      if (error || !member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      return res.status(200).json({ member });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Get member error:', error);
    return res.status(500).json({ error: error.message || 'Failed to get member' });
  }
}
