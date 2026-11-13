
// import { test, expect } from '@playwright/test';
// import { AuthClient } from '../../API/clients/authClients';

// test('Login with valid credentials', async ({ request }) => {
//   const authClient = new AuthClient(request);

//   const email = process.env.EVENTHUB_EMAIL!;
//   const password = process.env.EVENTHUB_PASSWORD!;

//   const response = await authClient.login(email, password);

//   expect(response.status()).toBe(200);

//   const body = await response.json();

//   expect(body.success).toBe(true);
//   expect(body.token).toBeTruthy();

//   console.log('Login successful');
// });

