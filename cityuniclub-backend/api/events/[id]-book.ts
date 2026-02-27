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

  return data?.member_id || null;
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
      const { id } = req.query;
      const { meal_option, guest_count, special_requests } = req.body;
      
      const member_id = await authenticate(req);
      if (!member_id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('id, price_per_person, event_type')
        .eq('id', id as string)
        .eq('is_active', true)
        .single();

      if (eventError || !event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Validate meal option for lunch_dinner events
      if (event.event_type === 'lunch_dinner' && !meal_option) {
        return res.status(400).json({ error: 'Meal option required for lunch/dinner events' });
      }

      const totalPrice = Number(event.price_per_person) * guest_count;

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('event_bookings')
        .insert({
          event_id: id,
          member_id,
          meal_option: meal_option || null,
          guest_count,
          special_requests: special_requests || null,
          total_price: totalPrice,
          status: 'pending',
          booked_at: new Date().toISOString()
        })
        .select(`
          *,
          events (
            id,
            title,
            event_type,
            event_date
          )
        `)
        .single();

      if (bookingError) {
        console.error('Create booking error:', bookingError);
        return res.status(500).json({ error: 'Failed to create booking' });
      }

      return res.status(201).json({
        booking,
        message: 'Booking created successfully'
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Book event error:', error);
    return res.status(500).json({ error: error.message || 'Failed to book event' });
  }
}
