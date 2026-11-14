import {
  test as base,
  expect,
  APIRequestContext
} from '@playwright/test';

import { config } from '../utils/config';
import { AuthClient } from '../API/clients/authClients';

const API_BASE_URL = config.apiBaseUrl;

type ApiFixtures = {
  authenticatedRequest: APIRequestContext;
};

export const test = base.extend<ApiFixtures>({
  authenticatedRequest: async ({ playwright }, use) => {
    const email = process.env.EVENTHUB_EMAIL;
    const password = process.env.EVENTHUB_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing EventHub credentials in .env');
    }

    const loginRequest = await playwright.request.newContext({
      baseURL: API_BASE_URL
    });

    try {
      const authClient = new AuthClient(loginRequest);
      const loginResponse = await authClient.login(email, password);

      expect(loginResponse.status()).toBe(200);

      const loginBody = await loginResponse.json();
      const token = loginBody.token;

      if (!token) {
        throw new Error('Login response did not contain a JWT');
      }

      const authenticatedRequest = await playwright.request.newContext({
        baseURL: API_BASE_URL,
        extraHTTPHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      try {
        await use(authenticatedRequest);
      } finally {
        await authenticatedRequest.dispose();
      }
    } finally {
      await loginRequest.dispose();
    }
  }
});

export { expect };
