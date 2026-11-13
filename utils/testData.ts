
import { CreateEventRequest } from '../API/clients/EventsClient';
import { CreateBookingRequest } from '../API/clients/BookingsClient';

export function createEventData(): CreateEventRequest {
  return {
    title: `Automation Event ${Date.now()}`,
    description: 'Event created for automated testing',
    category: 'Conference',
    venue: 'Automation Test Center',
    city: 'Cairo',
    eventDate: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    price: 150,
    totalSeats: 20,
    imageUrl: 'https://example.com/event.jpg'
  };
}


export function createBookingData(eventId: number): CreateBookingRequest {
  return {
    eventId,
    customerName: 'Automation Test User',
    customerEmail: 'automation@example.com',
    customerPhone: '+201000000000',
    quantity: 2
  };
}
