interface RenderBlogHtmlOptions {
  stripLeadingTitle?: string;
}

function looksLikeTitleLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^#{1,3}\s+/.test(trimmed)) return true;
  if (trimmed.length > 140) return false;
  if (/[.?!:]$/.test(trimmed)) return false;
  return /^[A-Z0-9][A-Za-z0-9"'():,&/\-\s]{8,}$/.test(trimmed);
}

function normalizeComparable(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function stripLeadingTitleBlock(md: string, expectedTitle?: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const expected = expectedTitle ? normalizeComparable(expectedTitle) : "";
  const result: string[] = [];
  let i = 0;
  let removedAny = false;

  while (i < lines.length) {
    const current = lines[i].trim();
    if (!current) {
      if (removedAny) {
        i++;
        continue;
      }
      break;
    }

    const comparable = normalizeComparable(current.replace(/^#{1,3}\s+/, ""));
    const sameAsExpected = expected && comparable === expected;
    const closeToExpected = expected && comparable && (comparable.includes(expected) || expected.includes(comparable));

    if (sameAsExpected || closeToExpected || (looksLikeTitleLine(current) && !removedAny)) {
      removedAny = true;
      i++;
      continue;
    }
    break;
  }

  for (; i < lines.length; i++) {
    result.push(lines[i]);
  }

  return result.join("\n").trim();
}

function normalizeSectionBreaks(md: string): string {
  let text = md.replace(/\r\n/g, "\n");

  const sectionTitles = [
    "Frequently Asked Questions",
    "FAQ",
    "FAQs",
    "Conclusion",
    "Final Thoughts",
    "Key Takeaways",
    "Summary",
  ];

  for (const title of sectionTitles) {
    const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const standalone = new RegExp(`(^|\\n)${escaped}:?\\s*`, "gi");
    text = text.replace(standalone, (_match, prefix: string) => `${prefix}## ${title}\n`);

    const inline = new RegExp(`([^#\\n])\\s+(${escaped}):?\\s+`, "gi");
    text = text.replace(inline, (_match, prefix: string, heading: string) => `${prefix}\n\n## ${heading}\n\n`);
  }

  text = text.replace(/(^|\n)(#{4,6})\s+/g, (_match, prefix: string) => `${prefix}### `);
  text = text.replace(/(^|\n)(Q\d*[:.)-]\s+)/gi, "$1### $2");
  return text;
}

function normalizeInlineTables(md: string): string {
  const lines = md.split("\n");
  const normalized: string[] = [];

  const isSeparatorToken = (value: string) => /^:?-{3,}:?$/.test(value.trim());

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.includes("|")) {
      normalized.push(line);
      continue;
    }

    const tokens = trimmed.split("|").map(token => token.trim()).filter(Boolean);
    const separatorIndex = tokens.findIndex(isSeparatorToken);

    if (separatorIndex < 2) {
      normalized.push(line.replace(/\|\s+\|/g, "|\n|"));
      continue;
    }

    const columnCount = separatorIndex;
    const separatorTokens = tokens.slice(separatorIndex, separatorIndex + columnCount);
    if (separatorTokens.length !== columnCount || !separatorTokens.every(isSeparatorToken)) {
      normalized.push(line.replace(/\|\s+\|/g, "|\n|"));
      continue;
    }

    const header = tokens.slice(0, columnCount);
    const remaining = tokens.slice(separatorIndex + columnCount);
    const rowCount = Math.floor(remaining.length / columnCount);

    if (rowCount < 1) {
      normalized.push(line.replace(/\|\s+\|/g, "|\n|"));
      continue;
    }

    const rows = Array.from({ length: rowCount }, (_value, index) =>
      remaining.slice(index * columnCount, (index + 1) * columnCount)
    );
    const remainder = remaining.slice(rowCount * columnCount).join(" ").trim();

    normalized.push(
      [
        `| ${header.join(" | ")} |`,
        `| ${separatorTokens.join(" | ")} |`,
        ...rows.map(row => `| ${row.join(" | ")} |`),
      ].join("\n")
    );

    if (remainder) normalized.push(remainder);
  }

  return normalized.join("\n");
}

function normalizeMarkdown(md: string, options?: RenderBlogHtmlOptions): string {
  let text = md.replace(/\r\n/g, "\n");
  text = stripLeadingTitleBlock(text, options?.stripLeadingTitle);

  if (options?.stripLeadingTitle) {
    const escapedTitle = options.stripLeadingTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(`^\\s*#\\s+${escapedTitle}\\s*\\n+`, "i"), "");
    text = text.replace(new RegExp(`^\\s*${escapedTitle}\\s*\\n[=-]{3,}\\s*\\n+`, "i"), "");
    text = text.replace(new RegExp(`^\\s*${escapedTitle}\\s*\\n+`, "i"), "");
  }

  text = text.replace(/^(.+)\n(=+|-+)\s*$/gm, (_match, title: string, underline: string) => {
    const level = underline.startsWith("=") ? "#" : "##";
    return `${level} ${title.trim()}`;
  });

  text = normalizeInlineTables(text);
  text = normalizeSectionBreaks(text);
  text = text.replace(/\n{2,}(#{1,3}\s+FAQ)\n+(#{1,3}\s+)/gi, "\n\n$1\n\n$2");
  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

export function renderBlogHtml(md: string, options?: RenderBlogHtmlOptions): string {
  if (!md) return "";

  const normalizedMd = normalizeMarkdown(md, options);

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
      .replace(/&[a-z]+;?/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const parseInline = (raw: string) => {
    let s = escapeHtml(raw);

    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, url: string) => {
      const safeUrl = url;
      if (safeUrl.startsWith("#")) {
        return `<a href="${safeUrl}">${text}</a>`;
      }
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });

    s = s.replace(/(https?:\/\/[^\s<]+)/g, (match: string) => {
      const safeUrl = match;
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    });

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

  const lines = normalizedMd.split("\n");
  const out: string[] = [];
  const isHeading = (line: string) => /^#{1,3}\s+/.test(line.trimStart());

  let i = 0;
  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      i++;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = Math.min(3, headingMatch[1].length);
      const title = headingMatch[2].trim();
      const id = slugify(title) || undefined;
      out.push(`<h${level}${id ? ` id="${id}"` : ""}>${parseInline(title)}</h${level}>`);
      i++;
      continue;
    }

    if (isTableRow(trimmed) && i + 1 < lines.length && isTableSeparator(lines[i + 1].trim())) {
      const headerCells = splitTableRow(trimmed);
      const bodyRows: string[][] = [];
      i += 2;

      while (i < lines.length) {
        const current = lines[i].trim();
        if (!current || !isTableRow(current) || isTableSeparator(current)) break;
        bodyRows.push(splitTableRow(current));
        i++;
      }

      const thead = `<thead><tr>${headerCells.map(cell => `<th>${parseInline(cell)}</th>`).join("")}</tr></thead>`;
      const tbody = bodyRows.length
        ? `<tbody>${bodyRows
            .map(row => `<tr>${headerCells.map((_, index) => `<td>${parseInline(row[index] ?? "")}</td>`).join("")}</tr>`)
            .join("")}</tbody>`
        : "";

      out.push(`<div class="blog-table-wrap"><table class="blog-table">${thead}${tbody}</table></div>`);
      continue;
    }

    const ulMatch = trimmed.match(/^[-•]\s+(.+)$/);
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);

    if (ulMatch || olMatch) {
      const isOrdered = Boolean(olMatch);
      const tag = isOrdered ? "ol" : "ul";
      const items: string[] = [];

      while (i < lines.length) {
        const current = lines[i].trim();
        if (!current) break;
        const unordered = current.match(/^[-•]\s+(.+)$/);
        const ordered = current.match(/^\d+\.\s+(.+)$/);
        if (isOrdered && !ordered) break;
        if (!isOrdered && !unordered) break;

        const itemText = isOrdered ? (ordered as RegExpMatchArray)[1] : (unordered as RegExpMatchArray)[1];
        items.push(`<li>${parseInline(itemText.trim())}</li>`);
        i++;
      }

      out.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    const paragraphLines: string[] = [trimmed];
    i++;

    while (i < lines.length) {
      const current = lines[i].trim();
      if (!current) break;
      if (isHeading(current)) break;
      if (/^[-•]\s+.+$/.test(current)) break;
      if (/^\d+\.\s+.+$/.test(current)) break;
      if (isTableRow(current) && i + 1 < lines.length && isTableSeparator(lines[i + 1].trim())) break;
      paragraphLines.push(current);
      i++;
    }

    out.push(`<p>${parseInline(paragraphLines.join(" "))}</p>`);
  }

  return out.join("");
}
