// src/services/course/types.ts
export interface Course {
  id: number;
  name: string;
  status: boolean;
  description: string | null;
}

export interface CourseCreate {
  name: string;
  status?: boolean;
  description?: string | null;
}

export interface CourseUpdate {
  name?: string;
  status?: boolean;
  description?: string | null;
}

export interface CourseQueryParams {
  q?: string;
}
