import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { handler } from './index.ts'
import { makeRequest, json } from '../_shared/test-utils.ts'

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

function mockAuditInsert() {
  return { insert: () => Promise.resolve({ error: null }) }
}

function mockAdmin() {
  return { from: () => mockAuditInsert() }
}

function mockSupabaseWithSignInError(message = 'Invalid login credentials') {
  return {
    auth: {
      signInWithPassword: () => Promise.resolve({
        data: { user: null, session: null },
        error: { message },
      }),
      signOut: () => Promise.resolve({ error: null }),
    },
  }
}

function mockSupabaseWithUser(role: string) {
  return {
    auth: {
      signInWithPassword: () => Promise.resolve({
        data: {
          user: {
            id: 'user-id',
            email: 'test@example.com',
            app_metadata: { role },
          },
          session: {
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            expires_at: 9999999999,
          },
        },
        error: null,
      }),
      signOut: () => Promise.resolve({ error: null }),
    },
  }
}

// ---------------------------------------------------------------------------
// CORS preflight
// ---------------------------------------------------------------------------

Deno.test('OPTIONS returns ok', async () => {
  const req = new Request('http://localhost/', { method: 'OPTIONS' })
  const res = await handler(req)
  assertEquals(res.status, 200)
})

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

Deno.test('missing email returns 401', async () => {
  const res = await handler(makeRequest({ password: 'secret' }))
  assertEquals(res.status, 401)
  const body = await json<{ error: string }>(res)
  assertEquals(body.error, 'Email and password are required')
})

Deno.test('missing password returns 401', async () => {
  const res = await handler(makeRequest({ email: 'admin@example.com' }))
  assertEquals(res.status, 401)
  const body = await json<{ error: string }>(res)
  assertEquals(body.error, 'Email and password are required')
})

Deno.test('empty body returns 401', async () => {
  const res = await handler(makeRequest({}))
  assertEquals(res.status, 401)
})

// ---------------------------------------------------------------------------
// Wrong credentials
// ---------------------------------------------------------------------------

Deno.test('wrong credentials returns 401', async () => {
  const res = await handler(
    makeRequest({ email: 'x@x.com', password: 'wrong' }),
    { supabase: mockSupabaseWithSignInError(), supabaseAdmin: mockAdmin() },
  )
  assertEquals(res.status, 401)
  const body = await json<{ error: string }>(res)
  assertEquals(body.error, 'Invalid email or password')
})

// ---------------------------------------------------------------------------
// Non-admin user
// ---------------------------------------------------------------------------

Deno.test('non-admin user returns 401', async () => {
  const res = await handler(
    makeRequest({ email: 'member@example.com', password: 'pass' }),
    { supabase: mockSupabaseWithUser('user'), supabaseAdmin: mockAdmin() },
  )
  assertEquals(res.status, 401)
  const body = await json<{ error: string }>(res)
  assertEquals(body.error, 'Access denied: Admin access required')
})

// ---------------------------------------------------------------------------
// Successful admin login
// ---------------------------------------------------------------------------

Deno.test('valid admin credentials returns 200 with token', async () => {
  const res = await handler(
    makeRequest({ email: 'secretary@cityuniversityclub.co.uk', password: 'correct' }),
    { supabase: mockSupabaseWithUser('admin'), supabaseAdmin: mockAdmin() },
  )
  assertEquals(res.status, 200)
  const body = await json<{ success: boolean; session: { token: string }; user: { role: string } }>(res)
  assertEquals(body.success, true)
  assertEquals(body.session.token, 'access-token')
  assertEquals(body.user.role, 'admin')
})
