import { APIRequestContext, APIResponse } from '@playwright/test';

export class AuthClient {
  constructor(private readonly request: APIRequestContext) {}

  async login(email: string, password: string): Promise<APIResponse> {
    return this.request.post('auth/login', {
      data: {
        email,
        password
      }
    });
  }
}
