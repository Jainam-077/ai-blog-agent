import json
from ai.config.llm_config import get_llm
from ai.prompts.keyword_prompt import KEYWORD_PROMPT
from ai.utils.pipeline_log import log_status, log_warn


def parse_json(text):
    text = text.strip()
    if "```" in text:
        text = text.split("```")[1].lstrip("json").strip()
    start = text.find("{")
    end   = text.rfind("}") + 1
    return json.loads(text[start:end])


def keyword_agent(state):
    log_status("keywords...")
    topic    = state["topic"]
    blog_type = state.get("plan", {}).get("blog_type", "informational")

    llm    = get_llm(fast=True)
    prompt = KEYWORD_PROMPT.format(topic=topic, blog_type=blog_type)
    raw    = llm.invoke(prompt).content

    try:
        keywords = parse_json(raw)
    except Exception as e:
        log_warn(f"keyword parse failed ({e}), using defaults")
        keywords = {
            "primary_keywords":   [topic],
            "secondary_keywords": [],
            "long_tail_keywords": [f"best {topic}"],
            "lsi_keywords":       []
        }

    log_status("keywords done")
    return {"keywords": keywords}
