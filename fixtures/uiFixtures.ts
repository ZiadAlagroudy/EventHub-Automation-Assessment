
import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/loginPage';

type UiFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<UiFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const email = process.env.EVENTHUB_EMAIL;
    const password = process.env.EVENTHUB_PASSWORD;

    if (!email || !password) {
      throw new Error('Missing EventHub credentials in .env');
    }

    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(email, password);

    await use(page);
  }
});

export { expect };
