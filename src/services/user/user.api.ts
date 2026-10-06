import { httpClient } from "@/src/services/http";
import type { UserAccount, UserCreate, UserQueryParams, UserUpdate } from "./types";

export const userApi = {
  list: (query?: string | UserQueryParams): Promise<UserAccount[]> => {
    const q = typeof query === "string" ? query : query?.q;
    const path = q ? `/auth/users?q=${encodeURIComponent(q)}` : "/auth/users";
    return httpClient.get<UserAccount[]>(path);
  },
  get: (id: number): Promise<UserAccount> => httpClient.get<UserAccount>(`/auth/users/${id}`),
  create: (data: UserCreate): Promise<UserAccount> => httpClient.post<UserAccount>("/auth/register", data),
  update: (id: number, data: UserUpdate): Promise<UserAccount> => httpClient.put<UserAccount>(`/auth/${id}`, data),
  delete: (id: number): Promise<{ message: string }> => httpClient.delete<{ message: string }>(`/auth/${id}`),
};
