import { Page, APIRequestContext, request as playwrightRequest } from '@playwright/test';

const API_BASE_URL = 'http://localhost:4000';

/**
 * Authenticate by writing directly to localStorage, then navigate to /list.
 * Faster than going through the login UI — use this as a precondition in
 * non-authentication test suites.
 */
export async function loginViaStorage(page: Page, username = 'admin') {
  await page.goto('/login'); // establish origin before accessing localStorage
  await page.evaluate((user) => {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('username', user);
  }, username);
  await page.goto('/list');
  await page.waitForSelector('tbody', { state: 'visible' });
}

/** Open an API request context pointed at the backend. Caller must call dispose(). */
export async function createApiContext(): Promise<APIRequestContext> {
  return playwrightRequest.newContext({ baseURL: API_BASE_URL });
}

/**
 * Delete every employee via the backend API.
 * Call in beforeEach to guarantee a clean slate.
 */
export async function clearAllEmployees(): Promise<void> {
  const api = await createApiContext();
  try {
    const res = await api.get('/employees');
    const employees: Array<{ id: number }> = await res.json();
    for (const emp of employees) {
      await api.delete(`/employees/${emp.id}`);
    }
  } finally {
    await api.dispose();
  }
}

/**
 * Create a single employee via the backend API and return its auto-generated id.
 */
export async function createEmployee(
  name: string,
  email: string,
  position: string
): Promise<number> {
  const api = await createApiContext();
  try {
    const res = await api.post('/employees', { data: { name, email, position } });
    const data: { id: number } = await res.json();
    return data.id;
  } finally {
    await api.dispose();
  }
}
