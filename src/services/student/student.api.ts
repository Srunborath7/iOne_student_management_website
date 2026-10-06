// src/services/student/student.api.ts
import { httpClient } from "@/src/services/http";
import type {
  Student,
  StudentCreate,
  StudentUpdate,
  StudentQueryParams,
} from "./types";

export const studentApi = {
  /**
   * List all students or filter by query string / params
   */
  list: async (query?: string | StudentQueryParams): Promise<Student[]> => {
    const q = typeof query === "string" ? query : query?.q;
    const path = q ? `/students?q=${encodeURIComponent(q)}` : "/students";
    return httpClient.get<Student[]>(path);
  },

  /**
   * Get single student by ID
   */
  get: async (id: number): Promise<Student> => {
    return httpClient.get<Student>(`/students/${id}`);
  },

  /**
   * Create a new student
   */
  create: async (data: StudentCreate): Promise<Student> => {
    return httpClient.post<Student>("/students", data);
  },

  /**
   * Update existing student by ID
   */
  update: async (id: number, data: StudentUpdate): Promise<Student> => {
    return httpClient.put<Student>(`/students/${id}`, data);
  },

  /**
   * Delete student by ID
   */
  delete: async (id: number): Promise<{ message: string }> => {
    return httpClient.delete<{ message: string }>(`/students/${id}`);
  },
};

export const studentService = studentApi;
