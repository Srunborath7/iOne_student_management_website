// src/types/auth.ts
// Re-export common types from the modular service layer for backward compatibility
export type { User, Credentials, LoginResponse, RegisterResponse } from "@/src/services/auth";
export type { Student, StudentCreate, StudentUpdate, StudentQueryParams } from "@/src/services/student";
export type { Course, CourseCreate, CourseUpdate, CourseQueryParams } from "@/src/services/course";
export type {
  Enrollment,
  EnrollmentCreate,
  EnrollmentUpdate,
  EnrollmentStatus,
  EnrollmentQueryParams,
} from "@/src/services/enrollment";