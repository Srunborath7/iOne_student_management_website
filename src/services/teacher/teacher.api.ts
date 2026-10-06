import { httpClient } from "../http";
import type { Teacher, TeacherCreate, TeacherQueryParams, TeacherUpdate } from "./type";

export const teacherApi = {
  list: async (query?: string | TeacherQueryParams): Promise<Teacher[]> => {
    const q = typeof query === "string" ? query : query?.q;
    const path = q ? `/teachers?q=${encodeURIComponent(q)}` : "/teachers";
    return httpClient.get<Teacher[]>(path);
  },
  get: async (id: number): Promise<Teacher> => {
    return httpClient.get<Teacher>(`/teachers/${id}`);
  },
  create: async (data: TeacherCreate): Promise<Teacher> => {
    return httpClient.post<Teacher>("/teachers", data);
  },
  update: async (id: number, data: TeacherUpdate): Promise<Teacher> => {
    return httpClient.put<Teacher>(`/teachers/${id}`, data);
  },
  delete: async (id: number): Promise<{ message: string }> => {
    return httpClient.delete<{ message: string }>(`/teachers/${id}`);
  },
};

export const teacherService = teacherApi;

