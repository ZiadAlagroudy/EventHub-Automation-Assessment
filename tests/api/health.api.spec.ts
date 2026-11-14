import { test, expect } from '@playwright/test';
import { config } from '../../utils/config';

test('API Health Check', async ({ request }) => {
  const response = await request.get(`${config.apiBaseUrl}health`);

  expect(response.status()).toBe(200);
});