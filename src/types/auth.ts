// src/types/auth.ts
export interface User { id: number; username: string; role: string }
export interface Credentials { username: string; password: string }
export interface LoginResponse { message: string; user: User }