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

      const { region } = req.query;

      let query = supabase
        .from('reciprocal_clubs')
        .select('*')
        .eq('is_active', true)
        .order('region', { ascending: true })
        .order('country', { ascending: true })
        .order('name', { ascending: true });

      if (region && region !== 'All') {
        query = query.eq('region', region as string);
      }

      const { data: clubs, error } = await query;

      if (error) {
        return res.status(500).json({ error: 'Failed to get clubs' });
      }

      return res.status(200).json({ clubs });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Get clubs error:', error);
    return res.status(500).json({ error: error.message || 'Failed to get clubs' });
  }
}
