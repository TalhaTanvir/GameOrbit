import axios from "axios";

function normalizePrefix(value: string) {
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.replace(/\/$/, "");
}

const API_HOST = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
const API_PREFIX = normalizePrefix(process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/v1");

export const apiClient = axios.create({
  baseURL: `${API_HOST}${API_PREFIX}`,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { message?: string } | undefined;
    return payload?.message ?? fallback;
  }

  return fallback;
}
