import json
import re
from ai.config.llm_config import get_llm
from ai.agents.writer import post_process_blog
from ai.prompts.seo_prompt import SEO_PROMPT
from ai.utils.pipeline_log import log_status, log_warn


def parse_json(text):
    text = text.strip()
    if "```" in text:
        text = text.replace("```json", "").replace("```", "").strip()
    start = text.find("{")
    end = text.rfind("}") + 1
    return json.loads(text[start:end])


def build_outline_sections_text(outline):
    sections = outline.get("sections", [])
    lines = []
    for section in sections:
        heading = section.get("heading", "")
        subsections = section.get("subsections", [])
        lines.append(f"- {heading}")
        for sub in subsections:
            lines.append(f"  - {sub}")
    return "\n".join(lines)


def count_faq_questions(content):
    lines = content.splitlines()
    faq_start = None

    for index, line in enumerate(lines):
        trimmed = line.strip().lower()
        if trimmed in ("## faq", "## frequently asked questions"):
            faq_start = index + 1
            break

    if faq_start is None:
        return 0

    count = 0
    for line in lines[faq_start:]:
        stripped = line.strip()
        if stripped.startswith("## "):
            break
        if stripped.startswith("### "):
            count += 1
    return count


def fallback_seo_payload(state):
    outline = state.get("outline", {})
    title = outline.get("title", state["topic"])
    draft = state.get("final_blog", "")
    improved = draft
    faq_count_ok = 5 <= count_faq_questions(improved) <= 8
    meta_title = title[:60]
    meta_description = (
        f"{title} - practical guidance, comparisons, FAQs, and decision support for {state['topic']}."
    )[:155]
    keywords = state.get("keywords", {}).get("primary_keywords", [])[:2] + state.get("keywords", {}).get("secondary_keywords", [])[:3]

    improved = post_process_blog(improved, title)

    return {
        "title": title,
        "content_markdown": improved,
        "meta_title": meta_title,
        "meta_description": meta_description,
        "keywords": keywords,
        "seo_checklist": {
            "single_h1": improved.strip().startswith("# "),
            "keyword_placement": True,
            "links_quality_ok": True,
            "faq_count_ok": faq_count_ok,
            "readability_ok": True,
        },
    }


def seo_agent(state):
    log_status("seo...")
    plan = state.get("plan", {})
    keywords = state.get("keywords", {})
    outline = state.get("outline", {})
    draft_blog = state.get("final_blog", "")

    if len(draft_blog) > 12000:
        log_warn("draft too long for SEO LLM, using lightweight pass")
        state["seo"] = fallback_seo_payload(state)
        log_status("seo done")
        return state

    llm = get_llm(fast=True, temperature=0.2, max_tokens=2048)
    prompt = SEO_PROMPT.format(
        topic=state["topic"],
        blog_type=plan.get("blog_type", "informational"),
        tone=plan.get("tone", "professional"),
        target_audience=plan.get("target_audience", "general readers"),
        goal=plan.get("goal", "help the reader make a confident decision"),
        content_angle=plan.get("content_angle", "practical and specific"),
        primary_keywords=json.dumps(keywords.get("primary_keywords", [])[:3]),
        secondary_keywords=json.dumps(keywords.get("secondary_keywords", [])[:5]),
        lsi_keywords=json.dumps(keywords.get("lsi_keywords", [])[:5]),
        outline_title=outline.get("title", state["topic"]),
        outline_sections=build_outline_sections_text(outline),
        draft_blog=draft_blog,
    )

    try:
        raw = llm.invoke(prompt).content
        seo = parse_json(raw)
    except Exception as e:
        log_warn(f"seo parse failed ({e}), using fallback")
        seo = fallback_seo_payload(state)

    if not seo.get("title"):
        seo["title"] = outline.get("title", state["topic"])
    if not seo.get("meta_title"):
        seo["meta_title"] = str(seo["title"])[:60]
    if not seo.get("meta_description"):
        seo["meta_description"] = (
            f"{seo['title']} - practical insights and answers about {state['topic']}."
        )[:155]
    if not isinstance(seo.get("keywords"), list):
        seo["keywords"] = keywords.get("primary_keywords", [])[:2] + keywords.get("secondary_keywords", [])[:3]
    if not isinstance(seo.get("seo_checklist"), dict):
        seo["seo_checklist"] = {}
    seo["seo_checklist"].setdefault("links_quality_ok", True)

    content = seo.get("content_markdown", draft_blog)
    state["final_blog"] = post_process_blog(content, seo.get("title", outline.get("title", state["topic"])))
    state["seo"] = seo
    log_status("seo done")
    return state
