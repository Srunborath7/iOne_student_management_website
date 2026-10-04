// src/lib/env.ts
import { z } from "zod";

export const env = z
  .object({
    NEXT_PUBLIC_API_URL: z.string().url().default("http://127.0.0.1:8000/api/v1"),
    NEXT_PUBLIC_APP_NAME: z.string().default("iOne Student Management"),
  })
  .parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1",
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "iOne Student Management",
  });