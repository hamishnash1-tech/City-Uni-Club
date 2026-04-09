import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { handler } from './index.ts'

Deno.env.set('SUPABASE_URL', 'http://localhost:54321')
Deno.env.set('SUPABASE_ANON_KEY', 'test-anon-key')
Deno.env.set('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')

const auditLog = { from: () => ({ insert: () => Promise.resolve({}) }) }

function makeReq(body: unknown): Request {
  return new Request('http://localhost/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

Deno.test('OPTIONS returns ok', async () => {
  const req = new Request('http://localhost/admin-login', { method: 'OPTIONS' })
  const res = await handler(req, {})
  assertEquals(res.status, 200)
})

Deno.test('missing email returns error', async () => {
  const res = await handler(makeReq({ password: 'pass' }), {})
  assertEquals(res.status, 401)
  const body = await res.json()
  assertEquals(body.error, 'Email and password are required')
})

Deno.test('missing password returns error', async () => {
  const res = await handler(makeReq({ email: 'a@b.com' }), {})
  assertEquals(res.status, 401)
  const body = await res.json()
  assertEquals(body.error, 'Email and password are required')
})

Deno.test('empty body returns error', async () => {
  const req = new Request('http://localhost/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'not-json',
  })
  const res = await handler(req, {})
  assertEquals(res.status, 401)
})

Deno.test('wrong credentials returns error', async () => {
  const supabase = {
    auth: {
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Invalid login' } }),
    },
  }
  const res = await handler(makeReq({ email: 'a@b.com', password: 'wrong' }), { supabase, supabaseAdmin: auditLog })
  assertEquals(res.status, 401)
  const body = await res.json()
  assertEquals(body.error, 'Invalid email or password')
})

Deno.test('non-admin user is rejected', async () => {
  const supabase = {
    auth: {
      signInWithPassword: () => Promise.resolve({
        data: { user: { id: 'u1', email: 'a@b.com', app_metadata: { role: 'user' } }, session: {} },
        error: null,
      }),
      signOut: () => Promise.resolve({}),
    },
  }
  const res = await handler(makeReq({ email: 'a@b.com', password: 'pass' }), { supabase, supabaseAdmin: auditLog })
  assertEquals(res.status, 401)
  const body = await res.json()
  assertEquals(body.error, 'Access denied: Admin access required')
})

Deno.test('valid admin login succeeds', async () => {
  const supabase = {
    auth: {
      signInWithPassword: () => Promise.resolve({
        data: {
          user: { id: 'u1', email: 'admin@cuc.com', app_metadata: { role: 'admin' } },
          session: { access_token: 'tok', refresh_token: 'ref', expires_at: 9999 },
        },
        error: null,
      }),
    },
  }
  const res = await handler(makeReq({ email: 'admin@cuc.com', password: 'pass' }), { supabase, supabaseAdmin: auditLog })
  assertEquals(res.status, 200)
  const body = await res.json()
  assertEquals(body.success, true)
  assertEquals(body.user.role, 'admin')
  assertEquals(body.session.token, 'tok')
})
