
import { test, expect } from '../../fixtures/apiFixtures';

test('Authenticated user can access bookings', async ({
  authenticatedRequest
}) => {
  const response = await authenticatedRequest.get('bookings');

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body.success).toBe(true);
});
