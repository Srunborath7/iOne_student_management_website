export type Gender = "male" | "female" | "other";

export interface Teacher {
  id: number;
  name: string;
  gender: Gender;
  phone: string;
  age: number;
  email: string;
  address: string;
  note: string | null;
  user_id?: number | null;
}

export interface TeacherCreate {
  name: string;
  gender: Gender;
  phone: string;
  age: number;
  email: string;
  address: string;
  note?: string | null;
  user_id?: number | null;
}

export interface TeacherUpdate {
  name?: string;
  gender?: Gender;
  phone?: string;
  age?: number;
  email?: string;
  address?: string;
  note?: string | null;
  user_id?: number | null;
}

export interface TeacherQueryParams {
  q?: string;
  gender?: Gender;
  minAge?: number;
  maxAge?: number;
  page?: number;
  limit?: number;
}
