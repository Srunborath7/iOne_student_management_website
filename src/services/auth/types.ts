// src/services/auth/types.ts
export interface User {
  id: number;
  username: string;
  role: string;
  is_active: boolean;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}
