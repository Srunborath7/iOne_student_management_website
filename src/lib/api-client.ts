// src/lib/api-client.ts
import { env } from "@/src/lib/env";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Retrieve saved token from localStorage auth state
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ione_auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${cleanPath}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const d = data?.detail;
    const message =
      typeof d === "string"
        ? d
        : Array.isArray(d)
        ? d.map((x: { msg?: string; message?: string }) => x.msg || x.message || JSON.stringify(x)).join(", ")
        : data?.message || `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}