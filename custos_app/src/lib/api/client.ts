/**
 * Typed API client for Custos. Browser calls use same-origin `/api`.
 * Server-side calls use `NEXT_PUBLIC_API_URL`, then `NEXTAUTH_URL`, `VERCEL_URL`, or localhost.
 */

export const getBaseUrl = () => {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  if (typeof window !== "undefined") {
    return explicit ?? "";
  }
  if (explicit) return explicit;
  const nextAuth = process.env.NEXTAUTH_URL?.trim().replace(/\/$/, "");
  if (nextAuth) return nextAuth;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: "DELETE" });
}
