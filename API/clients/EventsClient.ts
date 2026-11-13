
import { APIRequestContext, APIResponse } from '@playwright/test';

export interface CreateEventRequest {
  title: string;
  description: string;
  category: 'Conference' | 'Concert' | 'Sports' | 'Workshop' | 'Festival';
  venue: string;
  city: string;
  eventDate: string;
  price: number;
  totalSeats: number;
  imageUrl?: string;
}

export class EventsClient {
  constructor(private readonly request: APIRequestContext) {}

  async createEvent(data: CreateEventRequest): Promise<APIResponse> {
    return this.request.post('events', { data });
  }

  async getEvent(eventId: number): Promise<APIResponse> {
    return this.request.get(`events/${eventId}`);
  }

  async deleteEvent(eventId: number): Promise<APIResponse> {
    return this.request.delete(`events/${eventId}`);
  }
}
