import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://myfoyoyjtkqthjjvabmn.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function authenticate(req: Request): Promise<string | null> {
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

  if (!data) {
    return null;
  }

  // Update last active
  await supabase
    .from('sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('token', token);

  return data.member_id;
}

export default async function handler(req: Request, res: Response) {
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
      const member_id = await authenticate(req);
      
      if (!member_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7) || '';

      await supabase
        .from('sessions')
        .delete()
        .eq('token', token);

      return res.status(200).json({ message: 'Logged out successfully' });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: error.message || 'Logout failed' });
  }
}
