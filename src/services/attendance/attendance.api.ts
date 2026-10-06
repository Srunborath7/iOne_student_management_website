import { httpClient } from "@/src/services/http";
import type { Attendance, AttendanceCreate, AttendanceQuery, AttendanceUpdate } from "./types";

const endpoint = "/attendance";

export const attendanceApi = {
  list: (query?: AttendanceQuery): Promise<Attendance[]> =>
    httpClient.get<Attendance[]>(endpoint, { params: query }),
  get: (id: number): Promise<Attendance> =>
    httpClient.get<Attendance>(`${endpoint}/${id}`),
  create: (data: AttendanceCreate): Promise<Attendance> =>
    httpClient.post<Attendance>(endpoint, data),
  update: (id: number, data: AttendanceUpdate): Promise<Attendance> =>
    httpClient.put<Attendance>(`${endpoint}/${id}`, data),
  delete: (id: number): Promise<{ message: string }> =>
    httpClient.delete<{ message: string }>(`${endpoint}/${id}`),
};
