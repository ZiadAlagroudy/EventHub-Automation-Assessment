
import { Page, Locator, expect } from '@playwright/test';

export class MyBookingsPage {
  constructor(private readonly page: Page) {}

  bookingCard(reference: string): Locator {
    return this.page.getByTestId('booking-card').filter({
      hasText: reference
    });
  }

  async verifyBooking(
    reference: string,
    eventTitle: string,
    totalPrice: number
  ): Promise<void> {
    const card = this.bookingCard(reference);

    await expect(card).toBeVisible();
    await expect(card).toContainText(reference);
    await expect(card).toContainText(eventTitle);
    await expect(card).toContainText(
      `$${totalPrice.toLocaleString('en-US')}`
    );
  }

  async cancelBooking(reference: string): Promise<void> {
    const card = this.bookingCard(reference);

    // Cancel only the booking matching this reference
    await card.getByTestId('cancel-booking-btn').click();

    // Verify the confirmation dialog refers to this booking
    await expect(
      this.page.getByText(`This will cancel ${reference}`, {
        exact: false
      })
    ).toBeVisible();

    // Confirm cancellation
    await this.page.getByTestId('confirm-dialog-yes').click();

    // Verify cancellation succeeded
    await expect(
      this.page.getByText('Booking cancelled successfully')
    ).toBeVisible();

    // Verify the booking is removed from My Bookings
    await expect(card).toHaveCount(0);
  }

  async dismissCancellation(reference: string): Promise<void> {
  const card = this.bookingCard(reference);

  await card.getByTestId('cancel-booking-btn').click();

  // Verify confirmation dialog appears
  await expect(
    this.page.getByText(`This will cancel ${reference}`, {
      exact: false
    })
  ).toBeVisible();

  // Dismiss cancellation
  await this.page.getByRole('button', {
    name: 'Cancel',
    exact: true
  }).click();

  // Booking must remain visible
  await expect(card).toBeVisible();

  // Confirmation dialog should close
  await expect(
    this.page.getByTestId('confirm-dialog-yes')
  ).toBeHidden();
}
}
