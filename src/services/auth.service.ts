// src/services/auth.service.ts
// Re-export from the new modular auth service for backwards compatibility
export { authApi, authService } from "./auth";
export type { Credentials, LoginResponse, User, RegisterResponse } from "./auth";