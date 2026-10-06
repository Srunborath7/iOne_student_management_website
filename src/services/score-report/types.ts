export interface ScoreReport {
  id: number;
  student_id: number;
  course_id: number;
  assignment_score: number;
  midterm_score: number;
  final_score: number;
  total_score: number;
  grade: string;
  remark: string | null;
}

export interface ScoreReportCreate {
  student_id: number;
  course_id: number;
  assignment_score: number;
  midterm_score: number;
  final_score: number;
  total_score: number;
  grade: string;
  remark?: string | null;
}

export type ScoreReportUpdate = Partial<ScoreReportCreate>;

export interface ScoreReportQuery {
  student_id?: number;
  course_id?: number;
}
