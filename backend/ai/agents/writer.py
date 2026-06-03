import ast
import json
import os
import re
import time
from ai.config.llm_config import get_llm
from ai.prompts.writer_prompt import SECTION_WRITER_PROMPT
from ai.utils.pipeline_log import log_status, log_warn

MAX_RESEARCH_ENTITIES = 4
MAX_FACTS_PER_ENTITY = 3
MAX_SUBSECTION_LEN = 160
MAX_CANONICAL_FACTS = 10
SECTION_DELAY_SEC = float(os.getenv("WRITER_SECTION_DELAY", "2"))
# Sequential only: each section needs the "already used facts" list from prior sections.
PARALLEL_SECTIONS = 1

_STAT_PATTERNS = (
    r"\$[\d,.]+(?:\s*(?:million|billion|m|b))?",
    r"\b\d+\s+titles?\b",
    r"\b\d{4}\b",
    r"\b\d+\s*(?:titles?|wins?|championships?)\b",
)


def _is_rate_or_size_error(exc):
    msg = str(exc).lower()
    return any(
        token in msg
        for token in ("429", "413", "rate_limit", "too large", "tokens per minute", "tpm")
    )


def call_llm(llm, prompt, retries=4, wait=15):
    for attempt in range(1, retries + 1):
        try:
            return llm.invoke(prompt).content.strip()
        except Exception as e:
            if _is_rate_or_size_error(e) and attempt < retries:
                delay = wait * attempt
                log_warn(f"rate limit — waiting {delay}s ({attempt}/{retries})")
                time.sleep(delay)
            else:
                raise


def normalize_subsection_item(item):
    if isinstance(item, dict):
        for key in ("heading", "text", "point", "title", "question"):
            val = item.get(key)
            if val:
                return str(val).strip()[:MAX_SUBSECTION_LEN]
        return ""

    text = str(item).strip()
    if not text:
        return ""

    if text[0] in "{[":
        for parser in (json.loads, ast.literal_eval):
            try:
                parsed = parser(text)
                if isinstance(parsed, dict):
                    return normalize_subsection_item(parsed)
            except (json.JSONDecodeError, SyntaxError, ValueError):
                continue

    return re.sub(r"\s+", " ", text)[:MAX_SUBSECTION_LEN]


def normalize_subsections(subsections):
    cleaned = []
    for item in subsections or []:
        line = normalize_subsection_item(item)
        if line and line not in cleaned:
            cleaned.append(line)
    return cleaned[:4]


def _research_entries(research):
    entries = []
    for item in research or []:
        if not isinstance(item, dict):
            continue
        title = str(item.get("title", "")).strip()
        if not title or title.lower() in ("no data available", "error"):
            continue
        points = []
        for p in item.get("key_points", [])[:MAX_FACTS_PER_ENTITY]:
            if isinstance(p, dict):
                val = p.get("point", "")
                if val:
                    points.append(str(val).strip()[:140])
            elif p:
                points.append(str(p).strip()[:140])
        entries.append({
            "title": title[:80],
            "summary": str(item.get("summary", "")).strip()[:200],
            "key_points": points,
        })
    return entries


def build_canonical_facts(research):
    """Numbered fact list shared across all sections — single source of truth."""
    facts = []
    seen = set()

    for entry in _research_entries(research):
        for candidate in [entry["summary"], *entry["key_points"]]:
            line = re.sub(r"\s+", " ", str(candidate).strip())
            if len(line) < 12:
                continue
            key = line.lower()
            if key in seen:
                continue
            seen.add(key)
            facts.append(line)
            if len(facts) >= MAX_CANONICAL_FACTS:
                return facts

    return facts or ["No verified facts — write cautiously; do not invent statistics or title counts."]


def build_canonical_facts_text(facts):
    return "\n".join(f"{i}. {fact}" for i, fact in enumerate(facts, 1))


def extract_fact_snippets(text, max_items=8):
    """Pull stat-like phrases from written content to block repetition."""
    snippets = []
    seen = set()

    for line in text.splitlines():
        line = line.strip()
        if len(line) < 20:
            continue
        for pattern in _STAT_PATTERNS:
            for match in re.finditer(pattern, line, re.IGNORECASE):
                snippet = match.group(0).strip()
                key = snippet.lower()
                if key not in seen:
                    seen.add(key)
                    snippets.append(snippet)

        if "$" in line or "titles" in line.lower() or "valuation" in line.lower():
            short = line[:120]
            key = short.lower()
            if key not in seen:
                seen.add(key)
                snippets.append(short)

        if len(snippets) >= max_items:
            break

    return snippets[:max_items]


def _section_relevance_score(entry, heading, subsections):
    blob = f"{heading} {' '.join(subsections)}".lower()
    title = entry["title"].lower()
    score = sum(1 for word in title.split() if len(word) > 3 and word in blob)
    for point in entry["key_points"]:
        score += sum(0.5 for word in point.lower().split() if len(word) > 4 and word in blob)
    return score


def build_section_research_text(research, heading="", subsections=None):
    entries = _research_entries(research)
    if not entries:
        return "No research facts available."

    ranked = sorted(
        entries,
        key=lambda e: _section_relevance_score(e, heading, subsections or []),
        reverse=True,
    )
    lines = []
    for entry in ranked[:3]:
        parts = [entry["title"]]
        if entry["key_points"]:
            parts.append("; ".join(entry["key_points"][:2]))
        lines.append(" — ".join(parts))
    return "\n".join(lines)


def _section_word_target(plan, total_sections):
    raw = str(plan.get("estimated_word_count", "1400"))
    nums = [int(n) for n in raw.replace(",", "").split() if n.isdigit()]
    total = sum(nums) // len(nums) if nums else 1400
    per = max(80, total // max(total_sections, 1))
    return str(min(per, 180))


def _section_role(pos, total_sections, is_faq):
    if is_faq:
        return "FAQ only: ### Question? then 1-2 sentence answer. No repeated stats from earlier sections."
    if pos == 1:
        return "Intro: state the main thesis once; mention at most ONE key stat from canonical facts."
    if pos == total_sections and not is_faq:
        return "Closing: decision guidance only; no new statistics."
    return "Body: one new angle per H3; prose comparison only (no tables)."


def _build_section_prompt(
    state, plan, keywords, section, pos, total_sections, research, canonical_facts, already_used
):
    heading = section.get("heading", "")
    subsections = normalize_subsections(section.get("subsections", []))
    is_faq = heading.strip().lower() in {"faq", "frequently asked questions"} or (
        pos == total_sections and "faq" in heading.lower()
    )

    used_text = "\n".join(f"- {u}" for u in already_used[:12]) if already_used else "(none yet)"

    return SECTION_WRITER_PROMPT.format(
        topic=state["topic"],
        blog_type=plan.get("blog_type", "informational"),
        tone=plan.get("tone", "professional"),
        target_audience=plan.get("target_audience", "general readers"),
        heading=heading,
        subsections="\n".join(f"- {s}" for s in subsections) or "- Cover this section topic",
        section_index=pos,
        total_sections=total_sections,
        section_role=_section_role(pos, total_sections, is_faq),
        section_word_target=_section_word_target(plan, total_sections),
        primary_keywords=", ".join(keywords.get("primary_keywords", [])[:2]),
        secondary_keywords=", ".join(keywords.get("secondary_keywords", [])[:3]),
        canonical_facts=build_canonical_facts_text(canonical_facts),
        already_used=used_text,
        research=build_section_research_text(research, heading, subsections),
    )


def clean_section_content(text, heading):
    for fmt in (f"## {heading}", f"# {heading}", f"**{heading}**"):
        text = text.replace(fmt, "")

    text = re.sub(r"```\w*\n?", "", text)
    text = re.sub(r"(?m)^\|.*\|.*$", "", text)
    text = re.sub(r"(?m)^Note:.*$", "", text, flags=re.IGNORECASE)
    text = re.sub(r"(?<!^)(?<!#)(### )", r"\n\n\1", text)
    text = re.sub(r"([.!?])\s*([A-Z][a-z])", r"\1\n\n\2", text)

    lines = []
    seen = set()
    for line in text.splitlines():
        stripped = line.strip()
        if stripped in ("#", "##", "###", "Rank", "Franchise"):
            continue
        if stripped.startswith("|") or stripped.startswith("---"):
            continue
        norm = re.sub(r"\s+", " ", stripped.lower())
        if norm and norm in seen and len(norm) > 40:
            continue
        if norm:
            seen.add(norm)
        lines.append(line)

    return "\n".join(lines).strip()


def _normalize_paragraph(para):
    return re.sub(r"\s+", " ", para.strip().lower())


def dedupe_blog_paragraphs(content):
    """Remove duplicate paragraphs across the full article."""
    blocks = re.split(r"\n{2,}", content)
    seen = set()
    kept = []

    for block in blocks:
        stripped = block.strip()
        if not stripped:
            continue
        if stripped.startswith("#"):
            kept.append(stripped)
            continue
        key = _normalize_paragraph(stripped)
        if len(key) < 50:
            kept.append(stripped)
            continue
        if key in seen:
            continue
        seen.add(key)
        kept.append(stripped)

    return "\n\n".join(kept)


def post_process_blog(content, title):
    content = dedupe_blog_paragraphs(content)
    content = re.sub(r"\n{3,}", "\n\n", content).strip()

    if not content.startswith("# "):
        content = f"# {title}\n\n{content}"

    return content


def _write_one_section(
    llm, state, plan, keywords, section, pos, total_sections,
    research, canonical_facts, already_used,
):
    heading = section.get("heading", "")
    prompt = _build_section_prompt(
        state, plan, keywords, section, pos, total_sections,
        research, canonical_facts, already_used,
    )
    content = clean_section_content(call_llm(llm, prompt), heading)
    return pos, heading, content


def write_by_section(llm, state, plan, keywords, outline, research):
    sections = outline.get("sections", [])
    title = outline.get("title", state["topic"])
    total_sections = len(sections)
    canonical_facts = build_canonical_facts(research)
    already_used = []

    if not sections:
        return f"# {title}\n\n"

    indexed = [(i + 1, s) for i, s in enumerate(sections) if s.get("heading")]
    results = {}

    def process_section(pos, section):
        nonlocal already_used
        p, heading, content = _write_one_section(
            llm, state, plan, keywords, section, pos, total_sections,
            research, canonical_facts, already_used,
        )
        already_used.extend(extract_fact_snippets(content))
        already_used = list(dict.fromkeys(already_used))[:20]
        return p, heading, content

    for pos, section in indexed:
        p, heading, content = process_section(pos, section)
        results[pos] = (heading, content)
        log_status(f"writing: section {pos}/{total_sections} done")
        if pos < len(indexed):
            time.sleep(SECTION_DELAY_SEC)

    parts = [f"# {title}\n"]
    for pos in sorted(results):
        heading, content = results[pos]
        parts.append(f"## {heading}\n\n{content}\n")

    return post_process_blog("\n".join(parts).strip(), title)


def writer_agent(state):
    llm = get_llm(fast=False, temperature=0.25, max_tokens=900)
    plan = state.get("plan", {})
    keywords = state.get("keywords", {})
    outline = state.get("outline", {})
    research = state.get("research", [])

    sections = outline.get("sections", [])
    log_status(f"writing... ({len(sections)} sections)")

    state["final_blog"] = write_by_section(llm, state, plan, keywords, outline, research)
    log_status("writing done")
    return state
