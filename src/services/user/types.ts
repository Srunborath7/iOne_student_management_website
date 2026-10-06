export type UserRole = "admin" | "manager" | "teacher";

export interface UserAccount {
  id: number;
  username: string;
  role: UserRole | string;
}

export interface UserCreate {
  username: string;
  password: string;
  role: UserRole;
}

export interface UserUpdate {
  username?: string;
  password?: string;
  role?: UserRole;
}

export interface UserQueryParams {
  q?: string;
}
