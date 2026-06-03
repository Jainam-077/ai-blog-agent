"use client";

import { useEffect, useState } from "react";
import { BlogResult } from "@/types/blog";
import { renderBlogHtml } from "@/lib/renderBlogHtml";
import { Icons } from "@/components/ui/Icons";
import { useTypewriter } from "@/hooks/useTypewriter";

interface BlogOutputProps {
  result: BlogResult;
  onRegen: () => void;
  enableLiveWriting?: boolean;
}

export default function BlogOutput({ result, onRegen, enableLiveWriting = true }: BlogOutputProps) {
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(result.content);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { out: liveOut, done: liveDone } = useTypewriter(result.content, 12);
  const shouldAnimate = enableLiveWriting && !editing;

  useEffect(() => {
    setEditedContent(result.content);
    setEditing(false);
    setDownloadOpen(false);
  }, [result.id, result.title, result.content]);

  async function handleCopyBlog() {
    const html = renderBlogHtml(editedContent, { stripLeadingTitle: result.title });
    const parserNode = document.createElement("div");
    parserNode.innerHTML = html;
    const plainContent = (parserNode.textContent || parserNode.innerText || "").trim();
    const finalText = `${result.title}\n\n${plainContent}`;

    try {
      await navigator.clipboard.writeText(finalText);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = finalText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1300);
  }

  function handleDownloadWord() {
    const html = `
      <html>
        <head><meta charset="utf-8" /><title>${result.title}</title></head>
        <body>
          <h1>${result.title}</h1>
          ${renderBlogHtml(editedContent, { stripLeadingTitle: result.title })}
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.title.replace(/[^\w\s-]/g, "").trim() || "blog"}.doc`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setDownloadOpen(false);
  }

  function handleDownloadPdf() {
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${result.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 28px; line-height: 1.7; color: #111827; }
            h1 { font-size: 28px; margin-bottom: 16px; }
            h2 { margin-top: 20px; font-size: 22px; }
            h3 { margin-top: 16px; font-size: 18px; }
            p, li { font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>${result.title}</h1>
          ${renderBlogHtml(editedContent, { stripLeadingTitle: result.title })}
        </body>
      </html>
    `;
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setDownloadOpen(false);
  }

  return (
    <div
      style={{
        marginTop: 30,
        padding: "32px",
        background: "var(--card-bg)",
        borderRadius: "16px",
        border: "1px solid var(--border)",
        boxShadow: "0 10px 25px rgba(0,0,0,0.04)"
      }}
    >
      {/* Title */}

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: "20px" }}>
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "32px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {result.title}
        </h1>

        <button
          type="button"
          onClick={handleCopyBlog}
          title="Copy full blog"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 999,
            border: "1px solid var(--border)",
            background: copied ? "rgba(34,197,94,0.12)" : "transparent",
            color: copied ? "#16a34a" : "var(--text-secondary)",
            padding: "7px 11px",
            fontSize: 12.5,
            cursor: "pointer",
            transition: "all 0.18s ease",
            flexShrink: 0,
          }}
        >
          <span style={{ display: "flex" }}>{copied ? Icons.check : Icons.copy}</span>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Blog Content */}

      {editing ? (
        <textarea
          value={editedContent}
          onChange={e => setEditedContent(e.target.value)}
          style={{
            width: "100%",
            minHeight: 420,
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "14px 16px",
            fontSize: 15,
            lineHeight: 1.75,
            color: "var(--text-primary)",
            background: "transparent",
            fontFamily: "var(--sans)",
            resize: "vertical",
          }}
        />
      ) : (
        <>
          <div
            className="blog-body"
            dangerouslySetInnerHTML={{
              __html: renderBlogHtml(
                shouldAnimate ? (liveDone ? editedContent : liveOut) : editedContent,
                { stripLeadingTitle: result.title }
              )
            }}
            style={{
              fontSize: "16px",
              lineHeight: 1.8,
              color: "var(--text-secondary)"
            }}
          />
          {shouldAnimate && !liveDone && <span className="cursor" />}
        </>
      )}

      {/* Regenerate */}

      {(!shouldAnimate || liveDone) && (
        <div style={{ marginTop: 30, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="blog-action-btn blog-action-primary"
            onClick={onRegen}
          >
            Regenerate Blog
          </button>

          <button
            className="blog-action-btn blog-action-download"
            onClick={() => setEditing(v => !v)}
          >
            {editing ? "Save Edit" : "Edit Blog"}
          </button>

          <div style={{ position: "relative" }}>
            <button
              className="blog-action-btn blog-action-download"
              onClick={() => setDownloadOpen(v => !v)}
            >
              Download Blog ▾
            </button>

            {downloadOpen && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  left: 0,
                  minWidth: 180,
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--card-bg)",
                  boxShadow: "0 14px 28px rgba(0,0,0,0.12)",
                  padding: 6,
                  zIndex: 25,
                }}
              >
                <button
                  className="blog-download-item"
                  onClick={handleDownloadWord}
                >
                  Download as Word
                </button>
                <button
                  className="blog-download-item"
                  onClick={handleDownloadPdf}
                >
                  Download as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
