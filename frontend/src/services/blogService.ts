import { getStoredToken } from "@/lib/auth";
import { GenerateBlogResponse } from "@/types/blog";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000").replace(/\/$/, "");
const API_URL = `${API_BASE}/api/blog/generate`;

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === "AbortError") ||
    (err instanceof Error && err.name === "AbortError")
  );
}

async function requestBlog(
  url: string,
  method: "POST" | "PUT",
  data: { topic: string },
  signal?: AbortSignal,
): Promise<GenerateBlogResponse> {
  const token = getStoredToken();

  const response = await fetch(url, {
    method,
    signal,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      topic: data.topic
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Backend error:", text);
    let detail = "";
    try {
      const body = JSON.parse(text);
      detail = body?.detail ? String(body.detail) : "";
    } catch {
      // ignore
    }
    throw new Error(detail || "Request failed");
  }

  const result = await response.json();
  return {
    success: true,
    data: result.blog
  };
}

export async function generateBlog(
  data: { topic: string },
  signal?: AbortSignal,
): Promise<GenerateBlogResponse> {
  try {
    return await requestBlog(API_URL, "POST", data, signal);
  } catch (err) {
    if (isAbortError(err)) {
      return { success: false, aborted: true };
    }
    console.error("API error:", err);

    return {
      success: false,
      error: err instanceof Error ? err.message : "Server error"
    };
  }
}

export async function regenerateBlog(
  blogId: number,
  data: { topic: string },
  signal?: AbortSignal,
): Promise<GenerateBlogResponse> {
  try {
    return await requestBlog(`${API_BASE}/api/blog/${blogId}`, "PUT", data, signal);
  } catch (err) {
    if (isAbortError(err)) {
      return { success: false, aborted: true };
    }
    console.error("API error:", err);

    return {
      success: false,
      error: err instanceof Error ? err.message : "Server error"
    };
  }
}
