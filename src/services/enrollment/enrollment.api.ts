// src/services/enrollment/enrollment.api.ts
import { httpClient } from "@/src/services/http";
import type {
  Enrollment,
  EnrollmentCreate,
  EnrollmentUpdate,
  EnrollmentQueryParams,
} from "./types";

export const enrollmentApi = {
  /**
   * List all enrollments or filter by query string / params
   */
  list: async (query?: string | EnrollmentQueryParams): Promise<Enrollment[]> => {
    const q = typeof query === "string" ? query : query?.q;
    const path = q ? `/enrollments?q=${encodeURIComponent(q)}` : "/enrollments";
    return httpClient.get<Enrollment[]>(path);
  },

  /**
   * Get single enrollment by ID
   */
  get: async (id: number): Promise<Enrollment> => {
    return httpClient.get<Enrollment>(`/enrollments/${id}`);
  },

  /**
   * Create a new enrollment
   */
  create: async (data: EnrollmentCreate): Promise<Enrollment> => {
    return httpClient.post<Enrollment>("/enrollments", {
      status: "pending",
      ...data,
    });
  },

  /**
   * Update existing enrollment by ID (PATCH in backend)
   */
  update: async (id: number, data: EnrollmentUpdate): Promise<Enrollment> => {
    return httpClient.patch<Enrollment>(`/enrollments/${id}`, data);
  },

  /**
   * Delete enrollment by ID
   */
  delete: async (id: number): Promise<void> => {
    return httpClient.delete<void>(`/enrollments/${id}`);
  },
};

export const enrollmentService = enrollmentApi;
