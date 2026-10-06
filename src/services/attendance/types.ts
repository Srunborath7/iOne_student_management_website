export interface Attendance {
  id: number;
  student_id: number;
  course_id: number;
  date: string;
  status: string;
  note: string | null;
}

export interface AttendanceCreate {
  student_id: number;
  course_id: number;
  date: string;
  status: string;
  note?: string | null;
}

export type AttendanceUpdate = Partial<AttendanceCreate>;

export interface AttendanceQuery {
  student_id?: number;
  course_id?: number;
  date?: string;
}
