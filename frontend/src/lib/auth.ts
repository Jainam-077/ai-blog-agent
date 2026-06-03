const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000").replace(/\/$/, "");
const API_PREFIX = "/api";
const TOKEN_KEY = "auth_token";

type AuthUser = { id: number; name: string; email: string; role: string };
type AuthResponse = { token: string; user: AuthUser };
type MyBlog = { id: number; title: string; content: string; keywords: unknown[]; created_at: string };

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${API_PREFIX}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.detail ? String(body.detail) : "";
    } catch {
      // ignore
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }

  return (await res.json()) as T;
}

export async function signUp(data: { name: string; email: string; password: string }) {
  const json = await api<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setStoredToken(json.token);
  return json;
}

export async function signIn(data: { email: string; password: string }) {
  const json = await api<AuthResponse>("/auth/signin", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setStoredToken(json.token);
  return json;
}

export async function fetchMe() {
  return api<{ user: AuthUser }>("/auth/me", {
    method: "GET",
  });
}

export async function signOut() {
  try {
    await api<{ message: string }>("/auth/signout", {
      method: "POST",
    });
  } finally {
    clearStoredToken();
  }
}

export async function fetchMyBlogs() {
  return api<MyBlog[]>(
    "/blog/me",
    { method: "GET" }
  );
}

export async function deleteMyBlog(blogId: number) {
  return api<{ message: string; deleted_blog_id: number }>(
    `/blog/${blogId}`,
    { method: "DELETE" }
  );
}

