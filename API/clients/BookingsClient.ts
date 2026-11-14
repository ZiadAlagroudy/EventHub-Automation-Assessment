import { APIRequestContext, APIResponse } from '@playwright/test';

export interface CreateBookingRequest {
  eventId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quantity: number;
}

export class BookingsClient {
  constructor(private readonly request: APIRequestContext) {}

  async createBooking(data: CreateBookingRequest): Promise<APIResponse> {
    return this.request.post('bookings', { data });
  }

  async getBookings(): Promise<APIResponse> {
    return this.request.get('bookings');
  }

  async getBookingById(bookingId: number): Promise<APIResponse> {
    return this.request.get(`bookings/${bookingId}`);
  }

  async getBookingByReference(reference: string): Promise<APIResponse> {
    return this.request.get(`bookings/ref/${encodeURIComponent(reference)}`);
  }

  async cancelBooking(bookingId: number): Promise<APIResponse> {
    return this.request.delete(`bookings/${bookingId}`);
  }
}
