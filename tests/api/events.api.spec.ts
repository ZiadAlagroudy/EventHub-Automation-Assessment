import { test, expect } from '../../fixtures/apiFixtures';
import { EventsClient } from '../../API/clients/EventsClient';
import { createEventData } from '../../utils/testData';

test('Create and retrieve an event', async ({
  authenticatedRequest
}) => {
  const eventsClient = new EventsClient(authenticatedRequest);
  const eventData = createEventData();

  let eventId: number | undefined;

  try {
    const createResponse = await eventsClient.createEvent(eventData);

    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();

    expect(createBody.success).toBe(true);

    eventId = createBody.data.id;

    expect(eventId).toBeDefined();

    const getResponse = await eventsClient.getEvent(eventId!);

    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();

    expect(getBody.data.title).toBe(eventData.title);
    expect(getBody.data.price).toBe(eventData.price.toString()); // NOTE: price is returned as text, not number
    expect(getBody.data.availableSeats).toBe(eventData.totalSeats);

  } finally {
    if (eventId !== undefined) {
      const deleteResponse = await eventsClient.deleteEvent(eventId);

      expect(deleteResponse.status()).toBe(200);
    }
  }
});


