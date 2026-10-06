// src/services/course/course.api.ts
import { httpClient } from "@/src/services/http";
import type {
  Course,
  CourseCreate,
  CourseUpdate,
  CourseQueryParams,
} from "./types";

export const courseApi = {
  /**
   * List all courses or filter by query string / params
   */
  list: async (query?: string | CourseQueryParams): Promise<Course[]> => {
    const q = typeof query === "string" ? query : query?.q;
    const path = q ? `/courses?q=${encodeURIComponent(q)}` : "/courses";
    return httpClient.get<Course[]>(path);
  },

  /**
   * Get single course by ID
   */
  get: async (id: number): Promise<Course> => {
    return httpClient.get<Course>(`/courses/${id}`);
  },

  /**
   * Create a new course
   */
  create: async (data: CourseCreate): Promise<Course> => {
    return httpClient.post<Course>("/courses", {
      status: "active",
      ...data,
    });
  },

  /**
   * Update existing course by ID
   */
  update: async (id: number, data: CourseUpdate): Promise<Course> => {
    return httpClient.put<Course>(`/courses/${id}`, data);
  },

  /**
   * Delete course by ID
   */
  delete: async (id: number): Promise<{ message: string }> => {
    return httpClient.delete<{ message: string }>(`/courses/${id}`);
  },
};

export const courseService = courseApi;
