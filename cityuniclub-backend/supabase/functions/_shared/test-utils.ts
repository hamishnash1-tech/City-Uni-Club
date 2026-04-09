export function makeRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request('http://localhost/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
}

export function makeAdminRequest(body: unknown): Request {
  return makeRequest(body, { 'Authorization': 'Bearer test-token' })
}

export function makeGetRequest(url = 'http://localhost/', headers: Record<string, string> = {}): Request {
  return new Request(url, { method: 'GET', headers })
}

export function mockEnv(vars: Record<string, string>): void {
  for (const [key, value] of Object.entries(vars)) {
    Deno.env.set(key, value)
  }
}

export async function json(res: Response): Promise<unknown> {
  return res.json()
}
