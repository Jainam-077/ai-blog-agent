/**
 * Lightweight Markdown → HTML parser for blog content.
 *
 * Supported:
 * - Headings: # -> h1, ## -> h2, ### -> h3 (adds `id` for anchors)
 * - Links: [text](url) and raw https://... URLs
 * - Inline: **bold**, *italic*
 * - Lists: - item / • item and 1. item (renders <ul>/<ol>)
 * - Paragraphs
 *
 * Note: This is intentionally minimal (not a full markdown spec implementation).
 */
export function parseMd(md: string): string {
  if (!md) return "";

  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const slugify = (s: string) =>
    escapeHtml(s)
      .toLowerCase()
      .trim()
      // remove HTML entities artifacts
      .replace(/&[a-z]+;?/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const parseInline = (raw: string) => {
    let s = escapeHtml(raw);

    // Markdown links: [text](url)
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, url: string) => {
      const safeUrl = url; // already escaped
      if (safeUrl.startsWith("#")) {
        return `<a href="${safeUrl}">${text}</a>`;
      }
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });

    // Raw URLs: https://...
    s = s.replace(/(https?:\/\/[^\s<]+)/g, (m: string) => {
      const safeUrl = m; // already escaped
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${m}</a>`;
    });

    // Bold and italic (do bold first so it doesn't get broken by italic parsing)
    s = s.replace(/\*\*(.+?)\*\*/g, (_m, text: string) => `<strong>${text}</strong>`);
    s = s.replace(/\*(.+?)\*/g, (_m, text: string) => `<em>${text}</em>`);

    return s;
  };

  const splitTableRow = (row: string) =>
    row
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map(cell => cell.trim());

  const isTableSeparator = (row: string) => {
    const cells = splitTableRow(row);
    return cells.length > 0 && cells.every(cell => /^:?-{3,}:?$/.test(cell));
  };

  const isTableRow = (row: string) => {
    const trimmed = row.trim();
    if (!trimmed.includes("|")) return false;
    const cells = splitTableRow(trimmed);
    return cells.length >= 2 && cells.some(cell => cell.length > 0);
  };

  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];

  const isHeading = (line: string) => /^#{1,3}\s+/.test(line.trimStart());

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    // skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // Headings: #, ##, ###
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      const id = slugify(title) || undefined;
      out.push(
        `<h${level}${id ? ` id="${id}"` : ""}>${parseInline(title)}</h${level}>`
      );
      i++;
      continue;
    }

    if (
      isTableRow(trimmed) &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1].trim())
    ) {
      const headerCells = splitTableRow(trimmed);
      const bodyRows: string[][] = [];
      i += 2;

      while (i < lines.length) {
        const current = lines[i].trim();
        if (!current || !isTableRow(current) || isTableSeparator(current)) break;
        bodyRows.push(splitTableRow(current));
        i++;
      }

      const thead = `<thead><tr>${headerCells
        .map(cell => `<th>${parseInline(cell)}</th>`)
        .join("")}</tr></thead>`;

      const tbody = bodyRows.length
        ? `<tbody>${bodyRows
            .map(
              row =>
                `<tr>${headerCells
                  .map((_, index) => `<td>${parseInline(row[index] ?? "")}</td>`)
                  .join("")}</tr>`
            )
            .join("")}</tbody>`
        : "";

      out.push(`<div class="blog-table-wrap"><table class="blog-table">${thead}${tbody}</table></div>`);
      continue;
    }

    // Lists (unordered): - item / • item
    const ulMatch = trimmed.match(/^[-•]\s+(.+)$/);
    // Lists (ordered): 1. item
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);

    if (ulMatch || olMatch) {
      const isOrdered = Boolean(olMatch);
      const tag = isOrdered ? "ol" : "ul";
      const items: string[] = [];

      while (i < lines.length) {
        const t = lines[i].trim();
        if (!t) break;
        const um = t.match(/^[-•]\s+(.+)$/);
        const om = t.match(/^\d+\.\s+(.+)$/);
        if (isOrdered && !om) break;
        if (!isOrdered && !um) break;

        const itemText = isOrdered ? (om as RegExpMatchArray)[1] : (um as RegExpMatchArray)[1];
        items.push(`<li>${parseInline(itemText.trim())}</li>`);
        i++;
      }

      out.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    // Paragraphs: consume lines until blank or next block
    const paragraphLines: string[] = [trimmed];
    i++;

    while (i < lines.length) {
      const t = lines[i].trimEnd();
      const current = t.trim();
      if (!current) break;
      if (isHeading(current)) break;
      if (/^[-•]\s+.+$/.test(current)) break;
      if (/^\d+\.\s+.+$/.test(current)) break;
      paragraphLines.push(current);
      i++;
    }

    out.push(`<p>${parseInline(paragraphLines.join(" "))}</p>`);
  }

  return out.join("");
}
