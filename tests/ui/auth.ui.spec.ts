
import { test, expect } from '../../fixtures/uiFixtures';

test('User can access EventHub after authentication', async ({authenticatedPage}) => {
  await expect(authenticatedPage.getByRole('link', { name: 'EventHub' })).toBeVisible();
});
