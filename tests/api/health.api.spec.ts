
import { test, expect } from '@playwright/test';

test('API Health Check', async ({ request }) => {
  const response = await request.get('health');

  console.log('URL:', response.url());
  console.log('Status:', response.status());

  expect(response.status()).toBe(200);
});
