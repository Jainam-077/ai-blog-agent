// ─── Blog Generation Types ────────────────────────────────────────────────────

export interface BlogResult {
  id: number | null;
  title: string;
  content: string;
  keywords?: string[] | string;
  meta_title?: string;
  meta_description?: string;
  table_of_contents?: string[];
}

export type BlogHistoryStatus = "idle" | "generating" | "completed" | "failed";

export interface BlogHistoryItem {
  id: number;
  title: string;
  content: BlogResult | null;
  createdAt: Date;
  status: BlogHistoryStatus;
  error?: string;
}

export interface GenerateBlogRequest {
  topic: string;
}

export interface GenerateBlogResponse {
  success: boolean;
  data?: BlogResult;
  error?: string;
  /** True when the user cancelled the in-flight request */
  aborted?: boolean;
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  status?: number;
}

// ─── Export Types ─────────────────────────────────────────────────────────────

export type ExportFormat = 'txt' | 'markdown' | 'html';
