
import { test, expect } from '../../fixtures/testFixtures';

import { EventsClient } from '../../API/clients/EventsClient';
import { BookingsClient } from '../../API/clients/BookingsClient';

import { EventPage } from '../../pages/eventsPage';
import { MyBookingsPage } from '../../pages/myBookingsPage';

import { createEventData } from '../../utils/testData';

test('User can book tickets and cancel the booking', async ({

    
  authenticatedPage,
  authenticatedRequest
}) => {
  const eventsClient = new EventsClient(authenticatedRequest);
  const bookingsClient = new BookingsClient(authenticatedRequest);

  const eventPage = new EventPage(authenticatedPage);
  const myBookingsPage = new MyBookingsPage(authenticatedPage);

  const eventData = createEventData();
  const quantity = 2;

  let eventId: number | undefined;
  let bookingId: number | undefined;

  try {
    // STEP 1: Create an event using API
    const createResponse = await eventsClient.createEvent(eventData);
    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    eventId = createBody.data.id;

    console.log('Created Event ID:', eventId);

    // STEP 2: Open event details in UI
    await eventPage.goto(eventId!);

    // STEP 3: Select quantity and verify total price
    await eventPage.setTicketQuantity(quantity);
    await eventPage.verifyTotalPrice(eventData.price, quantity);

    // STEP 4: Enter customer information
    await eventPage.fillCustomerDetails(
      'Automation Test User',
      'automation@example.com',
      '+201111111111'
    );

    // STEP 5: Confirm booking and capture reference
    const bookingReference = await eventPage.confirmBooking();

    console.log('Booking Reference:', bookingReference);

    // STEP 6: Verify booking through API
    const bookingResponse =
      await bookingsClient.getBookingByReference(bookingReference);

    expect(bookingResponse.status()).toBe(200);

    const bookingBody = await bookingResponse.json();
    bookingId = bookingBody.data.id;

    expect(bookingBody.data.bookingRef).toBe(bookingReference);
    expect(bookingBody.data.quantity).toBe(quantity);

    expect(Number(bookingBody.data.totalPrice)).toBe(
      eventData.price * quantity
    );

    expect(bookingBody.data.status).toBe('confirmed');

    // STEP 7: Verify seats decreased through API
    const eventAfterBooking = await eventsClient.getEvent(eventId!);
    expect(eventAfterBooking.status()).toBe(200);

    const eventAfterBookingBody = await eventAfterBooking.json();

    expect(eventAfterBookingBody.data.availableSeats).toBe(
      eventData.totalSeats - quantity
    );

    // STEP 8: Navigate to My Bookings
    await eventPage.viewMyBookings();

    // STEP 9: Verify booking appears with correct details
    await myBookingsPage.verifyBooking(
      bookingReference,
      eventData.title,
      eventData.price * quantity
    );

    // STEP 10: Cancel the booking through UI
    await myBookingsPage.cancelBooking(bookingReference);
    bookingId = undefined;

    // STEP 11: Verify seats restored after cancellation
    const eventAfterCancel = await eventsClient.getEvent(eventId!);
    expect(eventAfterCancel.status()).toBe(200);

    const eventAfterCancelBody = await eventAfterCancel.json();

    expect(eventAfterCancelBody.data.availableSeats).toBe(
      eventData.totalSeats
    );

    console.log('UI Booking E2E Test completed successfully');

  } finally {
    // Cleanup: cancel booking if test failed before cancellation
    if (bookingId !== undefined) {
      await bookingsClient.cancelBooking(bookingId);
    }

    // Cleanup: delete event created by this test
    if (eventId !== undefined) {
      await eventsClient.deleteEvent(eventId);
    }
  }

});

test('Booking with invalid email', async ({
  authenticatedPage,
  authenticatedRequest
}) => {
  const eventsClient = new EventsClient(authenticatedRequest);
  const bookingsClient = new BookingsClient(authenticatedRequest);

  const eventData = createEventData();

  let eventId: number | undefined;

  try {
    // Arrange: Create an isolated event
    const createResponse = await eventsClient.createEvent(eventData);
    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    eventId = createBody.data.id;

    const eventPage = new EventPage(authenticatedPage);
    await eventPage.goto(eventId!);

    // Act: Enter invalid customer email
    await eventPage.fillCustomerDetails(
      'Automation Test User',
      'invalid-email',
      '+201111111111'
    );

    await authenticatedPage.getByRole('button', {
      name: 'Confirm Booking'
    }).click();

    // Verify email validation message
    await eventPage.verifyInvalidEmailMessage();

    // Assert: Booking should not be confirmed
    await expect(
      authenticatedPage.getByText(/Booking Confirmed!/)
    ).toHaveCount(0);

    // Assert: No booking should have been created for this event
    const bookingsResponse = await bookingsClient.getBookings();
    expect(bookingsResponse.status()).toBe(200);

    const bookingsBody = await bookingsResponse.json();

    // The API returns a paginated list of bookings.
    const bookings = bookingsBody.data;

    expect(Array.isArray(bookings)).toBe(true);

    const matchingBookings = bookings.filter(
      (booking: { eventId: number }) => booking.eventId === eventId
    );

    expect(matchingBookings).toHaveLength(0);

  } finally {
    if (eventId !== undefined) {
      await eventsClient.deleteEvent(eventId);
    }
  }
});


test('Ticket quantity boundaries', async ({
  authenticatedPage,
  authenticatedRequest
}) => {
  const eventsClient = new EventsClient(authenticatedRequest);
  const eventPage = new EventPage(authenticatedPage);

  const eventData = createEventData();
  let eventId: number | undefined;

  try {
    // Arrange: Create an event with enough available seats
    const createResponse = await eventsClient.createEvent(eventData);
    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    eventId = createBody.data.id;

    await eventPage.goto(eventId!);

    // Minimum boundary: quantity starts at 1
    await expect(eventPage.ticketCount).toHaveText('1');

    // Attempt to decrease below minimum
    await expect(eventPage.decreaseTicketsButton).toBeDisabled();
    await expect(eventPage.ticketCount).toHaveText('1');

    // Increase to maximum quantity (10)
    await eventPage.setTicketQuantity(10);

    // Verify total price at maximum quantity
    await eventPage.verifyTotalPrice(eventData.price, 10);

    // Attempt to increase beyond maximum
    await expect(eventPage.increaseTicketsButton).toBeDisabled();
    await expect(eventPage.ticketCount).toHaveText('10');

  } finally {
    if (eventId !== undefined) {
      await eventsClient.deleteEvent(eventId);
    }
  }
});


test('Booking with empty required fields', async ({
  authenticatedPage,
  authenticatedRequest
}) => {
  const eventsClient = new EventsClient(authenticatedRequest);
  const eventPage = new EventPage(authenticatedPage);

  const eventData = createEventData();
  let eventId: number | undefined;

  try {
    // Arrange: Create a new event
    const createResponse = await eventsClient.createEvent(eventData);
    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    eventId = createBody.data.id;

    await eventPage.goto(eventId!);

    // Act: Submit booking with empty customer fields
    await eventPage.confirmBookingButton.click();

    // Assert: All three validation messages should appear
    await eventPage.verifyRequiredFieldsValidation();

    // Assert: Booking should not be confirmed
    await expect(
      authenticatedPage.getByText(/Booking Confirmed!/)
    ).toHaveCount(0);

    // Assert: User remains on booking form
    await expect(eventPage.confirmBookingButton).toBeVisible();

  } finally {
    if (eventId !== undefined) {
      await eventsClient.deleteEvent(eventId);
    }
  }
});


test('Booking remains active when user dismisses cancellation', async ({
  authenticatedPage,
  authenticatedRequest
}) => {
  const eventsClient = new EventsClient(authenticatedRequest);
  const bookingsClient = new BookingsClient(authenticatedRequest);
  const myBookingsPage = new MyBookingsPage(authenticatedPage);

  const eventData = createEventData();

  let eventId: number | undefined;
  let bookingId: number | undefined;

  try {
    // STEP 1: Create event via API
    const eventResponse = await eventsClient.createEvent(eventData);
    expect(eventResponse.status()).toBe(201);

    const eventBody = await eventResponse.json();
    eventId = eventBody.data.id;

    // STEP 2: Create booking via API
    const bookingResponse = await bookingsClient.createBooking({
      eventId: eventId!,
      customerName: 'Automation Test User',
      customerEmail: 'automation@example.com',
      customerPhone: '+201111111111',
      quantity: 2
    });

    expect(bookingResponse.status()).toBe(201);

    const bookingBody = await bookingResponse.json();
    bookingId = bookingBody.data.id;

    const bookingReference = bookingBody.data.bookingRef;

    // STEP 3: Navigate to My Bookings
    //await authenticatedPage.goto('/my-bookings');

    // STEP 3: Navigate to My Bookings
      await authenticatedPage.goto('/');
      await authenticatedPage.getByTestId('nav-bookings').click();
      console.log('Current URL:', authenticatedPage.url())
      console.log('Booking Reference:', bookingReference);
      console.log('Visible booking cards:',
      await authenticatedPage.getByTestId('booking-card').count());
      console.log('Page content:',(await authenticatedPage.locator('body').innerText()).slice(0, 1500));
    // STEP 4: Verify booking is displayed
    await myBookingsPage.verifyBooking(
      bookingReference,
      eventData.title,
      eventData.price * 2
    );

    // STEP 5: Click Cancel Booking, then dismiss confirmation
    await myBookingsPage.dismissCancellation(bookingReference);

    // STEP 6: Verify booking still exists in API
    const bookingAfterDismiss =
      await bookingsClient.getBookingById(bookingId!);

    expect(bookingAfterDismiss.status()).toBe(200);

    const bookingAfterDismissBody = await bookingAfterDismiss.json();

    expect(bookingAfterDismissBody.data.bookingRef).toBe(
      bookingReference
    );

    expect(bookingAfterDismissBody.data.status).toBe('confirmed');

    // STEP 7: Verify seats are still reserved
    const eventAfterDismiss = await eventsClient.getEvent(eventId!);
    expect(eventAfterDismiss.status()).toBe(200);

    const eventAfterDismissBody = await eventAfterDismiss.json();

    expect(eventAfterDismissBody.data.availableSeats).toBe(
      eventData.totalSeats - 2
    );

  } finally {
    // Cleanup booking
    if (bookingId !== undefined) {
      await bookingsClient.cancelBooking(bookingId);
    }

    // Cleanup event
    if (eventId !== undefined) {
      await eventsClient.deleteEvent(eventId);
    }
  }
});




