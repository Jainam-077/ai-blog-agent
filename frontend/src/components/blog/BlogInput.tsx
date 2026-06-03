"use client";

import { useEffect, useRef } from "react";
import { Icons } from "@/components/ui/Icons";

const TOPIC_MIN_H = 48;
const TOPIC_MAX_H = 132;

interface BlogInputProps {
  topic:     string;
  loading:   boolean;
  onChange:  (val: string) => void;
  onGenerate: () => void;
  onStopGenerating?: () => void;
}

function syncTopicHeight(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "0px";
  const h = Math.min(Math.max(el.scrollHeight, TOPIC_MIN_H), TOPIC_MAX_H);
  el.style.height = `${h}px`;
}

export default function BlogInput({ topic, loading, onChange, onGenerate, onStopGenerating }: BlogInputProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const isActiveGenerating = loading && Boolean(onStopGenerating);

  useEffect(() => {
    syncTopicHeight(taRef.current);
  }, [topic]);

  return (
    <div
      className="fu fu2 blog-input-card"
      style={{
        borderRadius: 16,
        boxShadow: "var(--sh-md)",
        border: "1px solid var(--border)",
        background: "var(--card-bg)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "16px 18px 0" }}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
          marginBottom: 8,
        }}>
          Blog topic
        </div>

        <div className="focus-ring blog-input-field-wrap" style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: 14,
              color: "var(--text-tertiary)",
              display: "flex",
              pointerEvents: "none",
            }}
          >
            {Icons.search}
          </span>

          <textarea
            ref={taRef}
            value={topic}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => {
              if (e.key !== "Enter") return;
              if (e.shiftKey) return;
              e.preventDefault();
              if (!loading && topic.trim()) onGenerate();
            }}
            placeholder="Enter your blog topic and target keywords..."
            rows={1}
            style={{
              width: "100%",
              resize: "none",
              minHeight: TOPIC_MIN_H,
              maxHeight: TOPIC_MAX_H,
              overflowY: "auto",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 15,
              color: "var(--text-primary)",
              lineHeight: 1.5,
              background: "var(--card-bg)",
              fontWeight: 400,
              padding: "11px 14px 11px 38px",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <div
        style={{
          padding: "12px 18px 16px",
          borderTop: "1px solid var(--border-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 170,
            height: 40,
          }}
        >
          <button
            type="button"
            className="btn-primary"
            onClick={onGenerate}
            disabled={loading || !topic.trim()}
            style={{
              position: "absolute",
              inset: 0,
              background: isActiveGenerating
                ? "linear-gradient(135deg,#111827,#1F2937)"
                : "linear-gradient(135deg,#6366F1,#8B5CF6)",
              borderRadius: 999,
              fontWeight: 600,
              padding: "10px 20px",
              minWidth: 132,
              fontSize: 13,
              border: "none",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: isActiveGenerating
                ? "0 4px 14px rgba(17,24,39,0.22)"
                : "0 8px 22px rgba(88,80,236,0.32)",
              transform: isActiveGenerating ? "translateY(-4px) scale(0.98)" : "translateY(0) scale(1)",
              transition: "all 220ms ease",
              opacity: isActiveGenerating ? 0 : 1,
              pointerEvents: isActiveGenerating ? "none" : "auto",
              cursor: loading || !topic.trim() ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              if (loading || !topic.trim()) return;
              e.currentTarget.style.transform = "translateY(-1px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 12px 28px rgba(88,80,236,0.42)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 22px rgba(88,80,236,0.32)";
            }}
          >
            ✨ Generate Blog
            <span style={{ display: "flex" }}>{Icons.arrow}</span>
          </button>

          <button
            type="button"
            className="btn-ghost"
            onClick={onStopGenerating}
            disabled={!isActiveGenerating}
            style={{
              position: "absolute",
              inset: 0,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              background: "var(--card-bg)",
              borderRadius: 999,
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              transition: "all 220ms ease",
              opacity: isActiveGenerating ? 1 : 0,
              transform: isActiveGenerating ? "translateY(0) scale(1)" : "translateY(4px) scale(0.98)",
              pointerEvents: isActiveGenerating ? "auto" : "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={e => {
              if (!isActiveGenerating) return;
              e.currentTarget.style.background = "#F9FAFB";
              e.currentTarget.style.borderColor = "var(--border-light)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--card-bg)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            Stop generating
          </button>
        </div>
      </div>
    </div>
  );
}
