// src/lib/api-client.ts
// Re-export from canonical http service client for seamless compatibility
export {
  ApiError,
  getStoredToken,
  toQueryString,
  request,
  httpClient,
  type RequestOptions,
  type Envelope,
} from "@/src/services/http";