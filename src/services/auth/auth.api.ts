// src/services/auth/auth.api.ts
import { httpClient } from "@/src/services/http";
import type { Credentials, LoginResponse, User } from "./types";

export const authApi = {
  /**
   * Log in user, returning LoginResponse containing access_token and user info
   */
  login: async (credentials: Credentials): Promise<LoginResponse> => {
    return httpClient.post<LoginResponse>("/auth/login", {
      username: credentials.username.trim(),
      password: credentials.password,
    });
  },

  /**
   * Register a new user
   */
  register: async (credentials: Credentials): Promise<User> => {
    return httpClient.post<User>("/auth/register", {
      username: credentials.username.trim(),
      password: credentials.password,
    });
  },

  /**
   * Get current authenticated user profile using token
   */
  getCurrentUser: async (): Promise<User> => {
    return httpClient.get<User>("/auth/me");
  },

  /**
   * Look up a user by ID
   */
  getUserById: async (userId: number): Promise<User> => {
    return httpClient.get<User>(`/auth/${userId}`);
  },
};

export const authService = authApi;
