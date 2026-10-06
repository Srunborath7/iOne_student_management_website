import { httpClient } from "@/src/services/http";
import type { ScoreReport, ScoreReportCreate, ScoreReportQuery, ScoreReportUpdate } from "./types";

const endpoint = "/score-reports";

export const scoreReportApi = {
  list: (query?: ScoreReportQuery): Promise<ScoreReport[]> =>
    httpClient.get<ScoreReport[]>(endpoint, { params: query }),
  get: (id: number): Promise<ScoreReport> =>
    httpClient.get<ScoreReport>(`${endpoint}/${id}`),
  create: (data: ScoreReportCreate): Promise<ScoreReport> =>
    httpClient.post<ScoreReport>(endpoint, data),
  update: (id: number, data: ScoreReportUpdate): Promise<ScoreReport> =>
    httpClient.put<ScoreReport>(`${endpoint}/${id}`, data),
  delete: (id: number): Promise<{ message: string }> =>
    httpClient.delete<{ message: string }>(`${endpoint}/${id}`),
};
