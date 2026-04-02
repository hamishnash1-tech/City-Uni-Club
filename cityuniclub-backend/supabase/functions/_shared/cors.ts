const ALLOWED_ORIGINS = [
  'https://www.cityuniversityclub.co.uk',
  'https://admin.cityuniversityclub.co.uk',
  'http://localhost:5173',
  'http://localhost:5174',
]

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-token, prefer',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  }
}
