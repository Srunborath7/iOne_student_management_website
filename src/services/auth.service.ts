// src/services/auth.service.ts
import { request } from "@/src/lib/api-client";
import type { Credentials, LoginResponse, User } from "@/src/types/auth";

export const authService = {
  /**
   * Log in user, returning LoginResponse containing access_token and user info
   */
  async login(c: Credentials): Promise<LoginResponse> {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: c.username.trim(),
        password: c.password,
      }),
    });
  },

  /**
   * Register a new user
   */
  async register(c: Credentials): Promise<User> {
    return request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: c.username.trim(),
        password: c.password,
      }),
    });
  },

  /**
   * Get current authenticated user profile using token
   */
  async getCurrentUser(): Promise<User> {
    return request<User>("/auth/me", {
      method: "GET",
    });
  },
};