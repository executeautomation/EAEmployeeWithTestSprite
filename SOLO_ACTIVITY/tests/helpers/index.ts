import { Page, APIRequestContext, request as playwrightRequest } from '@playwright/test';

const API_BASE_URL = 'http://localhost:4000';

/**
 * Authenticate by setting localStorage directly, then navigate to /list.
 * This is faster than going through the login UI and is used as a precondition
 * in non-auth test suites.
 */
export async function loginViaStorage(page: Page, username = 'admin') {
  // Navigate to the app first to establish the origin
  await page.goto('/login');
  await page.evaluate((user) => {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('username', user);
  }, username);
  await page.goto('/list');
  // Wait for the employee table to be visible
  await page.waitForSelector('tbody', { state: 'visible' });
}

/**
 * Create a new API context pointing at the backend.
 * Caller is responsible for calling apiContext.dispose() when done.
 */
export async function createApiContext(): Promise<APIRequestContext> {
  return playwrightRequest.newContext({ baseURL: API_BASE_URL });
}

/**
 * Fetch all employees and delete each one via the backend API.
 * Call this in beforeEach to ensure a clean slate.
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
 * Create a single employee via the backend API and return its id.
 */
export async function createEmployee(
  name: string,
  email: string,
  position: string
): Promise<number> {
  const api = await createApiContext();
  try {
    const res = await api.post('/employees', {
      data: { name, email, position },
    });
    const data: { id: number } = await res.json();
    return data.id;
  } finally {
    await api.dispose();
  }
}
