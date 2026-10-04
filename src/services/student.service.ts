// src/services/student.service.ts
import { request } from "@/src/lib/api-client";
import type { Student } from "@/src/types/auth";

export const studentService = {
  async list(query?: string): Promise<Student[]> {
    const url = query ? `/students?q=${encodeURIComponent(query)}` : "/students";
    return request<Student[]>(url);
  },

  async get(id: number): Promise<Student> {
    return request<Student>(`/students/${id}`);
  },

  async create(data: Omit<Student, "id">): Promise<Student> {
    return request<Student>("/students", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<Student>): Promise<Student> {
    return request<Student>(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<void> {
    await request(`/students/${id}`, {
      method: "DELETE",
    });
  },
};
