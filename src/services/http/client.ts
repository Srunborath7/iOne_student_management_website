// src/services/http/client.ts
import { env } from "@/src/lib/env";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Standard Envelope structure matching backend API patterns when wrapped
 */
export interface Envelope<T> {
  code?: number;
  msg?: string;
  data: T;
}

/**
 * Options supported by the HTTP client
 */
export interface RequestOptions extends RequestInit {
  baseUrl?: string;
  params?: Record<string, string | number | boolean | null | undefined>;
}

/**
 * Retrieve saved JWT token from localStorage auth state
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

/**
 * Serialize a query parameter object into a URL query string
 */
export function toQueryString(
  params?: Record<string, string | number | boolean | null | undefined>
): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      sp.set(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Core request helper that automatically injects JWT token and handles errors
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const querySuffix = options.params ? toQueryString(options.params) : "";
  const finalPath = path + querySuffix;
  const cleanPath = finalPath.startsWith("/") ? finalPath : `/${finalPath}`;
  const baseUrl = options.baseUrl ?? env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${baseUrl}${cleanPath}`, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return null as T;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const d = data?.detail;
    const message =
      typeof d === "string"
        ? d
        : Array.isArray(d)
        ? d
            .map(
              (x: { msg?: string; message?: string }) =>
                x.msg || x.message || JSON.stringify(x)
            )
            .join(", ")
        : data?.message || `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, data);
  }

  return data as T;
}

/**
 * Method-specific HTTP client
 */
export const httpClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body:
        body !== undefined
          ? body instanceof FormData
            ? body
            : JSON.stringify(body)
          : undefined,
    }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body:
        body !== undefined
          ? body instanceof FormData
            ? body
            : JSON.stringify(body)
          : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body:
        body !== undefined
          ? body instanceof FormData
            ? body
            : JSON.stringify(body)
          : undefined,
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
