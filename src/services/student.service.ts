// src/services/student.service.ts
// Re-export from the new modular student service for backwards compatibility
export { studentApi, studentService } from "./student";
export type { Student, StudentCreate, StudentUpdate, StudentQueryParams } from "./student";
