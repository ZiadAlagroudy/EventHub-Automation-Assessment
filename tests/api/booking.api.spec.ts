
import { test, expect } from '../../fixtures/apiFixtures';
import { EventsClient } from '../../API/clients/EventsClient';
import { BookingsClient } from '../../API/clients/BookingsClient';
import { createEventData, createBookingData } from '../../utils/testData';

test('Create booking, verify price and seats, then cancel', async ({
  authenticatedRequest
}) => {
  const eventsClient = new EventsClient(authenticatedRequest);
  const bookingsClient = new BookingsClient(authenticatedRequest);

  const eventData = createEventData();

  let eventId: number | undefined;
  let bookingId: number | undefined;

  try {
    // Create a test event
    const eventResponse = await eventsClient.createEvent(eventData);
    expect(eventResponse.status()).toBe(201);

    const eventBody = await eventResponse.json();
    eventId = eventBody.data.id;

    // Create a booking
    const bookingData = createBookingData(eventId!);

    const bookingResponse = await bookingsClient.createBooking(bookingData);
    expect(bookingResponse.status()).toBe(201);

    const bookingBody = await bookingResponse.json();
    bookingId = bookingBody.data.id;

    // Verify booking details
    expect(bookingBody.data.quantity).toBe(bookingData.quantity);

    expect(Number(bookingBody.data.totalPrice)).toBe(
      eventData.price * bookingData.quantity
    );

    expect(bookingBody.data.bookingRef).toBeTruthy();
    expect(bookingBody.data.status).toBe('confirmed');

    // Verify available seats decreased
    const eventAfterBooking = await eventsClient.getEvent(eventId!);
    expect(eventAfterBooking.status()).toBe(200);

    const eventAfterBookingBody = await eventAfterBooking.json();

    expect(eventAfterBookingBody.data.availableSeats).toBe(
      eventData.totalSeats - bookingData.quantity
    );

    // Cancel booking
    const cancelResponse = await bookingsClient.cancelBooking(bookingId!);
    expect(cancelResponse.status()).toBe(200);
    bookingId = undefined;

    // Verify seats restored
    const eventAfterCancel = await eventsClient.getEvent(eventId!);
    expect(eventAfterCancel.status()).toBe(200);

    const eventAfterCancelBody = await eventAfterCancel.json();

    expect(eventAfterCancelBody.data.availableSeats).toBe(
      eventData.totalSeats
    );

    console.log('Booking created, verified and cancelled successfully');

  } finally {
    // Cleanup booking if test failed before cancellation
    if (bookingId !== undefined) {
      await bookingsClient.cancelBooking(bookingId);
    }

    // Cleanup test event
    if (eventId !== undefined) {
      await eventsClient.deleteEvent(eventId);
    }
  }
});


test('Reject booking with invalid ticket quantity', async ({
  authenticatedRequest
}) => {
  const eventsClient = new EventsClient(authenticatedRequest);
  const bookingsClient = new BookingsClient(authenticatedRequest);

  const eventResponse = await eventsClient.createEvent(createEventData());
  expect(eventResponse.status()).toBe(201);

  const eventBody = await eventResponse.json();
  const eventId = eventBody.data.id;

  try {
    for (const quantity of [0, 11]) {
      const bookingData = createBookingData(eventId);
      bookingData.quantity = quantity;

      const response = await bookingsClient.createBooking(bookingData);

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
    }
  } finally {
    await eventsClient.deleteEvent(eventId);
  }
});


test('Reject booking when available seats are insufficient', async ({
  authenticatedRequest
}) => {
  const eventsClient = new EventsClient(authenticatedRequest);
  const bookingsClient = new BookingsClient(authenticatedRequest);

  const eventData = createEventData();
  eventData.totalSeats = 1;

  const eventResponse = await eventsClient.createEvent(eventData);
  expect(eventResponse.status()).toBe(201);

  const eventBody = await eventResponse.json();
  const eventId = eventBody.data.id;

  try {
    const bookingData = createBookingData(eventId);
    bookingData.quantity = 2;

    const response = await bookingsClient.createBooking(bookingData);

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.success).toBe(false);
  } finally {
    await eventsClient.deleteEvent(eventId);
  }
});
