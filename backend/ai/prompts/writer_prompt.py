SECTION_WRITER_PROMPT = """Write ONE blog section. Markdown body only (no H2 line).

Topic: {topic} | Type: {blog_type} | Tone: {tone}
Audience: {target_audience}
Section {section_index}/{total_sections}: {heading}

### Subsections (write one ### H3 per line, in order):
{subsections}

Keywords (each max once in this section): {primary_keywords} | {secondary_keywords}

CANONICAL FACTS (only numbers, teams, dates, and claims you may use):
{canonical_facts}

ALREADY USED IN EARLIER SECTIONS (do NOT repeat these facts or stats):
{already_used}

Rules:
- {section_role}
- Use ONLY facts from CANONICAL FACTS. If a rival team's titles, valuation, or record is NOT listed → do not state it.
- Do NOT invent table rows, rankings, or statistics. No markdown tables.
- Do NOT repeat anything in ALREADY USED. Each paragraph must add new information.
- Under each H3: 1 short paragraph (3-5 sentences max). No duplicate sentences within the section.
- Never restate the same dollar amount, title count, or year twice in this section.
- ~{section_word_target} words total for this section.

Return markdown: ### headings + paragraphs only. No commentary.
"""
