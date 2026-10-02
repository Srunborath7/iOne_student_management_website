// src/lib/api-client.ts
import { env } from "@/src/lib/env";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const d = data?.detail;
    const message =
      typeof d === "string" ? d
      : Array.isArray(d) ? d.map((x: { msg: string }) => x.msg).join(", ")
      : "Something went wrong";
    throw new ApiError(res.status, message);
  }
  return data as T;
}