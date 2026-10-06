// src/services/student/types.ts
export interface Student {
  id: number;
  name: string;
  email: string;
  age: number;
  phone: string;
  major?: string | null;
}

export interface StudentCreate {
  name: string;
  email: string;
  age: number;
  phone: string;
  major?: string | null;
}

export interface StudentUpdate {
  name?: string;
  email?: string;
  age?: number;
  phone?: string;
  major?: string | null;
}

export interface StudentQueryParams {
  q?: string;
}
