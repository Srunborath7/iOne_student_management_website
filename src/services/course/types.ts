// src/services/course/types.ts
export type CourseStatus = "active" | "inactive";

export interface Course {
  id: number;
  name: string;
  status: CourseStatus;
  teacher_id: number;
  start_date: string;
  end_date: string | null;
  description: string | null;
  classroom: string;
}

export interface CourseCreate {
  name: string;
  status?: CourseStatus;
  teacher_id: number;
  start_date: string;
  end_date?: string | null;
  description?: string | null;
  classroom: string;
}

export interface CourseUpdate {
  name?: string;
  status?: CourseStatus;
  teacher_id?: number;
  start_date?: string;
  end_date?: string | null;
  description?: string | null;
  classroom?: string;
}

export interface CourseQueryParams {
  q?: string;
}
