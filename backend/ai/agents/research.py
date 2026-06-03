import os
import json
from tavily import TavilyClient
from ai.config.llm_config import get_llm
from ai.prompts.research_prompt import RESEARCH_PROMPT
from ai.utils.pipeline_log import log_status, log_warn

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


# =========================
# SEARCH
# =========================
def get_research_data(topic: str):
    queries = [
        f"{topic} tools",
        f"{topic} comparison",
        f"{topic} features use cases"
    ]

    all_results = []

    for q in queries:
        res = tavily.search(
            query=q,
            search_depth="basic",
            max_results=2
        )

        for r in res.get("results", []):
            all_results.append({
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "content": (r.get("content") or "")[:280],
            })

    # Deduplicate
    seen = set()
    unique = []
    for item in all_results:
        if item["url"] and item["url"] not in seen:
            seen.add(item["url"])
            unique.append(item)

    return unique


# =========================
# FORMAT
# =========================
def format_research_data(data):
    if not data:
        return ""

    formatted = ""
    for i, item in enumerate(data, 1):
        formatted += f"""
[{i}]
Title: {item['title']}
URL: {item['url']}
Content: {item['content']}
"""
    return formatted.strip()


# =========================
# MAIN FUNCTION (IMPORTANT NAME)
# =========================
def research_agent(state: dict):
    try:
        topic = state.get("topic")
        log_status("research...")

        raw_data = get_research_data(topic)

        if not raw_data:
            research = [
                {
                    "title": "No data available",
                    "summary": "No relevant research data was found for this topic.",
                    "key_points": [],
                    "source": ""
                }
            ]
            log_warn("no web results found")
            log_status("research done (empty)")
            return {"research": research}

        formatted_data = format_research_data(raw_data)

        prompt = RESEARCH_PROMPT.format(
            topic=topic,
            research_data=formatted_data
        )

        llm = get_llm(fast=True, temperature=0.2, max_tokens=1536)

        response = llm.invoke(prompt)
        content = response.content.strip()

        # Clean JSON
        if "```" in content:
            content = content.replace("```json", "").replace("```", "").strip()

        research = json.loads(content)
        log_status(f"research done ({len(research)} entries)")
        return {"research": research}

    except Exception as e:
        log_warn(f"research failed ({e})")
        research = [
            {
                "title": "Error",
                "summary": str(e),
                "key_points": [],
                "source": ""
            }
        ]
        return {"research": research}
