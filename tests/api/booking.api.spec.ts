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
    const eventResponse = await eventsClient.createEvent(eventData);
    const eventBody = await eventResponse.json();
    eventId = eventBody.data?.id;

    expect(eventResponse.status()).toBe(201);
    expect(eventId).toBeDefined();

    const bookingData = createBookingData(eventId!);
    const bookingResponse = await bookingsClient.createBooking(bookingData);
    const bookingBody = await bookingResponse.json();
    bookingId = bookingBody.data?.id;

    expect(bookingResponse.status()).toBe(201);
    expect(bookingId).toBeDefined();

    expect(bookingBody.data.quantity).toBe(bookingData.quantity);
    expect(Number(bookingBody.data.totalPrice)).toBe(
      eventData.price * bookingData.quantity
    );
    expect(bookingBody.data.bookingRef).toBeTruthy();
    expect(bookingBody.data.status).toBe('confirmed');

    const eventAfterBooking = await eventsClient.getEvent(eventId!);
    expect(eventAfterBooking.status()).toBe(200);

    const eventAfterBookingBody = await eventAfterBooking.json();
    expect(eventAfterBookingBody.data.availableSeats).toBe(
      eventData.totalSeats - bookingData.quantity
    );

    const cancelResponse = await bookingsClient.cancelBooking(bookingId!);
    expect(cancelResponse.status()).toBe(200);
    bookingId = undefined;

    const eventAfterCancel = await eventsClient.getEvent(eventId!);
    expect(eventAfterCancel.status()).toBe(200);

    const eventAfterCancelBody = await eventAfterCancel.json();
    expect(eventAfterCancelBody.data.availableSeats).toBe(
      eventData.totalSeats
    );

  } finally {
    try {
      if (bookingId !== undefined) {
        const response = await bookingsClient.cancelBooking(bookingId);
        if (!response.ok()) {
          console.warn(`Booking cleanup failed: ${response.status()}`);
        }
      }
    } catch (error) {
      console.warn('Booking cleanup error:', error);
    }

    try {
      if (eventId !== undefined) {
        const response = await eventsClient.deleteEvent(eventId);
        if (!response.ok()) {
          console.warn(`Event cleanup failed: ${response.status()}`);
        }
      }
    } catch (error) {
      console.warn('Event cleanup error:', error);
    }
  }
});

test('Reject booking with invalid ticket quantity', async ({
  authenticatedRequest
}) => {
  const eventsClient = new EventsClient(authenticatedRequest);
  const bookingsClient = new BookingsClient(authenticatedRequest);

  let eventId: number | undefined;

  try {
    const eventResponse = await eventsClient.createEvent(createEventData());
    const eventBody = await eventResponse.json();
    eventId = eventBody.data?.id;

    expect(eventResponse.status()).toBe(201);
    expect(eventId).toBeDefined();

    for (const quantity of [0, 11]) {
      const bookingData = createBookingData(eventId!);
      bookingData.quantity = quantity;

      const response = await bookingsClient.createBooking(bookingData);

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body.success).toBe(false);
    }

  } finally {
    if (eventId !== undefined) {
      try {
        const response = await eventsClient.deleteEvent(eventId);
        if (!response.ok()) {
          console.warn(`Event cleanup failed: ${response.status()}`);
        }
      } catch (error) {
        console.warn('Event cleanup error:', error);
      }
    }
  }
});

test('Reject booking when available seats are insufficient', async ({
  authenticatedRequest
}) => {
  const eventsClient = new EventsClient(authenticatedRequest);
  const bookingsClient = new BookingsClient(authenticatedRequest);

  const eventData = createEventData();
  eventData.totalSeats = 1;

  let eventId: number | undefined;

  try {
    const eventResponse = await eventsClient.createEvent(eventData);
    const eventBody = await eventResponse.json();
    eventId = eventBody.data?.id;

    expect(eventResponse.status()).toBe(201);
    expect(eventId).toBeDefined();

    const bookingData = createBookingData(eventId!);
    bookingData.quantity = 2;

    const response = await bookingsClient.createBooking(bookingData);

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.success).toBe(false);

  } finally {
    if (eventId !== undefined) {
      try {
        const response = await eventsClient.deleteEvent(eventId);
        if (!response.ok()) {
          console.warn(`Event cleanup failed: ${response.status()}`);
        }
      } catch (error) {
        console.warn('Event cleanup error:', error);
      }
    }
  }
});