// src/services/enrollment/types.ts
export type EnrollmentStatus = "pending" | "active" | "completed" | "dropped";

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  start_date: string;
  end_date: string | null;
  status: EnrollmentStatus;
}

export interface EnrollmentCreate {
  student_id: number;
  course_id: number;
  start_date: string;
  end_date?: string | null;
  status?: EnrollmentStatus;
}

export interface EnrollmentUpdate {
  start_date?: string;
  end_date?: string | null;
  status?: EnrollmentStatus;
}

export interface EnrollmentQueryParams {
  q?: string;
}
