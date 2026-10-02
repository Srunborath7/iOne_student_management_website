// src/services/auth.service.ts
import { request } from "@/src/lib/api-client";
import type { Credentials, LoginResponse, User } from "@/src/types/auth";

export const authService = {
  async login(c: Credentials): Promise<User> {
    const res = await request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username: c.username.trim(), password: c.password }),
    });
    return res.user;
  },

  register(c: Credentials): Promise<User> {
    return request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username: c.username.trim(), password: c.password }),
    });
  },
};