
import { Page, Locator, expect } from '@playwright/test';

export class EventPage {
  readonly page: Page;
  readonly increaseTicketsButton: Locator;
  readonly decreaseTicketsButton: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly confirmBookingButton: Locator;
  readonly ticketCount: Locator;
  readonly ticketPrice: Locator;
  readonly totalPrice: Locator;
  readonly availableSeats: Locator;
  readonly bookingReference: Locator;
  readonly emailValidationMessage: Locator;
  readonly nameValidationMessage: Locator;
  readonly phoneValidationMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.increaseTicketsButton = page.getByRole('button', {
      name: '+',
      exact: true
    });

    this.decreaseTicketsButton = page.getByRole('button', {
      name: '−',
      exact: true
    });

    this.fullNameInput = page.getByRole('textbox', {
      name: 'Full Name'
    });

    this.emailInput = page.getByTestId('customer-email');

    this.phoneInput = page.getByRole('textbox', {
      name: 'Phone Number'
    });

    this.confirmBookingButton = page.getByRole('button', {
      name: 'Confirm Booking'
    });

    this.ticketCount = page.locator('#ticket-count');
    this.ticketPrice = page.locator('.text-2xl.font-bold.text-indigo-700');
    this.totalPrice = page.locator("span[class='text-indigo-700']");
    this.availableSeats = page.locator('.text-emerald-600.font-semibold');
    this.bookingReference = page.locator('.booking-ref');
    this.emailValidationMessage = page.getByText('Enter a valid email',{ exact: true });
    this.nameValidationMessage = page.getByText('Name must be at least 2 chars',{ exact: true });
    this.phoneValidationMessage = page.getByText('Enter a valid 10-digit phone',{ exact: true });  

}


  async goto(eventId: number): Promise<void> {
  await this.page.goto(`/events/${eventId}`);

  await expect(this.confirmBookingButton).toBeVisible();
}

  async setTicketQuantity(quantity: number): Promise<void> {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    throw new Error('Quantity must be between 1 and 10');
  }

  // Verify default quantity is 1
  await expect(this.ticketCount).toHaveText('1');

  // Increase quantity using the + button
  for (let i = 1; i < quantity; i++) {
    await this.increaseTicketsButton.click();

    // Verify quantity after each click
    await expect(this.ticketCount).toHaveText(String(i + 1));
  }
}

  async verifyTotalPrice(
  unitPrice: number,
  quantity: number
  ): Promise<void> {
  const expectedTotal = unitPrice * quantity;

  // Verify price per ticket
  await expect(this.ticketPrice).toContainText(
    `$${unitPrice.toLocaleString('en-US')}`
  );

  // Verify total price
  await expect(this.totalPrice).toHaveText(
    `$${expectedTotal.toLocaleString('en-US')}`
  );
}

  async fillCustomerDetails(
    name: string,
    email: string,
    phone: string
  ): Promise<void> {
    await this.fullNameInput.fill(name);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
  }

  async verifyInvalidEmailMessage(): Promise<void> {
  await expect(this.emailValidationMessage).toBeVisible();
}

  async verifyRequiredFieldsValidation(): Promise<void> {
  await expect(this.nameValidationMessage).toBeVisible();
  await expect(this.emailValidationMessage).toBeVisible();
  await expect(this.phoneValidationMessage).toBeVisible();
}
  
async confirmBooking(): Promise<string> {
  await this.confirmBookingButton.click();

  // Verify booking confirmation message
  await expect(
    this.page.getByText(/Booking Confirmed!/)
  ).toBeVisible();

  // Verify booking reference is displayed
  await expect(this.bookingReference).toBeVisible();

  // Capture booking reference
  const reference = (await this.bookingReference.innerText()).trim();

  expect(reference).toMatch(/^[A-Z0-9]+-[A-Z0-9]+$/);

  return reference;
}


  async viewMyBookings(): Promise<void> {
    await this.page.getByRole('button', {
      name: 'View My Bookings'
    }).click();
  }
}
