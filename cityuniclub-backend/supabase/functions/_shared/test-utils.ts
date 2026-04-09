/**
 * Shared test utilities for Supabase edge function tests.
 *
 * Usage in a test file:
 *    * import { makeRequest, makeAdminRequest, mockEnv } from '../_shared/test-utils.ts'
 */

export const TEST_SERVICE_KEY = 'test-service-role-key'
export const TEST_ANON_KEY = 'test-anon-key'
export const TEST_SUPABASE_URL = 'http://localhost:54321'

/** Sets the minimal Deno env vars that every function expects. */
export function mockEnv(overrides: Record<string, string> = {}) {
  const vars: Record<string, string> = {
    SUPABASE_URL: TEST_SUPABASE_URL,
    SUPABASE_ANON_KEY: TEST_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: TEST_SERVICE_KEY,
    RESEND_API_KEY: 'test-resend-key',
    ...overrides,
  }

  const original = Deno.env.get.bind(Deno.env)
  const stub = (key: string) => vars[key] ?? original(key)

  // Temporarily replace Deno.env.get
  Object.defineProperty(Deno.env, 'get', { value: stub, configurable: true })

  return {
    restore() {
      Object.defineProperty(Deno.env, 'get', { value: original, configurable: true })
    },
  }
}

/** Builds a POST Request with a JSON body. */
export function makeRequest(
  body: unknown,
  headers: Record<string, string> = {},
): Request {
  return new Request('http://localhost/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

/** Builds a POST Request with an admin Authorization header. */
export function makeAdminRequest(
  body: unknown,
  token = 'admin-jwt-token',
  headers: Record<string, string> = {},
): Request {
  return makeRequest(body, { Authorization: `Bearer ${token}`, ...headers })
}

/** Builds a GET Request, optionally with query params. */
export function makeGetRequest(
  params: Record<string, string> = {},
  headers: Record<string, string> = {},
): Request {
  const url = new URL('http://localhost/')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return new Request(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

/** Parses the JSON body from a Response. */
export async function json<T = unknown>(res: Response): Promise<T> {
  return res.json() as Promise<T>
}
