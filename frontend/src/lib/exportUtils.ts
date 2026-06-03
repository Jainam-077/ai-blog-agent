import { BlogResult, ExportFormat } from "@/types/blog";

function buildMarkdown(blog: BlogResult): string {
  const keywords = Array.isArray(blog.keywords)
    ? blog.keywords
    : typeof blog.keywords === "string"
    ? blog.keywords.split(",").map(k => k.trim()).filter(Boolean)
    : [];
  const tableOfContents = blog.table_of_contents ?? [];

  return [
    `# ${blog.title}`,
    ``,
    `**Meta Title:** ${blog.meta_title ?? ""}`,
    `**Meta Description:** ${blog.meta_description ?? ""}`,
    `**Keywords:** ${keywords.join(", ")}`,
    ``,
    `## Table of Contents`,
    ...tableOfContents.map((t, i) => `${i + 1}. ${t}`),
    ``,
    `---`,
    ``,
    blog.content,
  ].join("\n");
}

function buildHTML(blog: BlogResult): string {
  const keywords = Array.isArray(blog.keywords)
    ? blog.keywords
    : typeof blog.keywords === "string"
    ? blog.keywords.split(",").map(k => k.trim()).filter(Boolean)
    : [];
  const tableOfContents = blog.table_of_contents ?? [];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${blog.meta_title ?? blog.title}</title>
  <meta name="description" content="${blog.meta_description ?? ""}" />
  <meta name="keywords" content="${keywords.join(", ")}" />
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.8; color: #1a1a1a; }
    h1   { font-size: 2.2rem; margin-bottom: 0.5rem; }
    h2   { font-size: 1.5rem; margin: 2rem 0 0.75rem; }
    h3   { font-size: 1.2rem; margin: 1.5rem 0 0.5rem; }
    p    { margin: 0 0 1rem; }
    ul   { padding-left: 1.5rem; margin: 0 0 1rem; }
    li   { margin-bottom: 0.4rem; }
    .meta { background: #f5f5f3; border-radius: 8px; padding: 16px 20px; margin: 24px 0; font-size: 0.9rem; }
    .toc  { background: #fafaf8; border-left: 3px solid #0a0a0a; padding: 16px 20px; margin: 24px 0; }
    .toc ol { padding-left: 1.2rem; }
  </style>
</head>
<body>
  <h1>${blog.title}</h1>
  <div class="meta">
    <strong>Meta Title:</strong> ${blog.meta_title ?? ""}<br/>
    <strong>Meta Description:</strong> ${blog.meta_description ?? ""}<br/>
    <strong>Keywords:</strong> ${keywords.join(", ")}
  </div>
  <div class="toc">
    <strong>Table of Contents</strong>
    <ol>${tableOfContents.map(t => `<li>${t}</li>`).join("")}</ol>
  </div>
  ${blog.content
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .split(/\n\n+/)
    .map(p => p.startsWith('<') ? p : `<p>${p}</p>`)
    .join('\n')}
</body>
</html>`;
}

export function exportBlog(blog: BlogResult, format: ExportFormat): void {
  let content = "";
  let filename = blog.title.slice(0, 50).replace(/[^a-z0-9]/gi, "-").toLowerCase();
  let mimeType = "text/plain";

  switch (format) {
    case "markdown":
      content  = buildMarkdown(blog);
      filename += ".md";
      mimeType  = "text/markdown";
      break;
    case "html":
      content  = buildHTML(blog);
      filename += ".html";
      mimeType  = "text/html";
      break;
    default: // txt
      content  = buildMarkdown(blog);
      filename += ".txt";
      mimeType  = "text/plain";
  }

  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const a   = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
