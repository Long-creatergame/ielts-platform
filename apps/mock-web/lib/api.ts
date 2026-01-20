export type ApiConfig = {
  baseUrl: string;
};

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = { auth: true }
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");

  if (init.auth !== false) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...init, headers });
  if (res.status === 401) {
    clearToken();
    throw new Error("Unauthorized");
  }
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = body?.message || body?.error || "Request failed";
    throw new Error(msg);
  }
  return body as T;
}

