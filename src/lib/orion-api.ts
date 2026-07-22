// Client-side API helper for the ORION FastAPI backend.
// The base URL is configurable at runtime via localStorage("orion.baseUrl").

const DEFAULT_BASE = "http://localhost:8000";
const BASE_KEY = "orion.baseUrl";
const TOKEN_KEY = "orion.token";

export function getBaseUrl(): string {
  if (typeof window === "undefined") return DEFAULT_BASE;
  return window.localStorage.getItem(BASE_KEY) || DEFAULT_BASE;
}
export function setBaseUrl(url: string) {
  window.localStorage.setItem(BASE_KEY, url.replace(/\/+$/, ""));
}
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  window.localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers || {});
  const token = getToken();
  if (token && !headers.has("Authorization"))
    headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");

  const res = await fetch(`${getBaseUrl()}${path}`, { ...init, headers });
  const text = await res.text();
  let data: unknown = text;
  try { data = text ? JSON.parse(text) : null; } catch { /* keep text */ }
  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : res.statusText) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  get: <T = unknown>(p: string) => request<T>(p),
  post: <T = unknown>(p: string, body?: unknown) =>
    request<T>(p, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  postForm: <T = unknown>(p: string, form: FormData) =>
    request<T>(p, { method: "POST", body: form }),
};

export async function login(username: string, password: string) {
  const form = new URLSearchParams();
  form.set("username", username);
  form.set("password", password);
  const res = await fetch(`${getBaseUrl()}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  const data = (await res.json()) as { access_token: string };
  setToken(data.access_token);
  return data;
}
