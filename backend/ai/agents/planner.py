import json
from ai.config.llm_config import get_llm
from ai.prompts.planner_prompt import PLANNER_PROMPT
from ai.utils.pipeline_log import log_status, log_warn


def parse_json(text):
    text = text.strip()
    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    start = text.find("{")
    end   = text.rfind("}") + 1
    return json.loads(text[start:end])


def planner_agent(state):
    log_status("planning...")
    llm = get_llm(fast=True)
    prompt = PLANNER_PROMPT.format(
        topic=state["topic"],
        user_blog_type=state.get("blog_type", ""),
        user_tone=state.get("tone", ""),
        user_target_audience=state.get("target_audience", ""),
        user_goal=state.get("goal", ""),
        user_content_angle=state.get("content_angle", ""),
        user_estimated_word_count=state.get("estimated_word_count", ""),
        user_reading_level=state.get("reading_level", ""),
        user_section_count=state.get("section_count", ""),
    )
    raw = llm.invoke(prompt).content

    try:
        plan = parse_json(raw)
    except Exception as e:
        log_warn(f"planner parse failed ({e}), using defaults")
        plan = {
            "blog_type": "informational", "tone": "professional",
            "target_audience": "general readers", "goal": "educate",
            "content_angle": f"Guide to {state['topic']}",
            "estimated_word_count": "1200-1600", "reading_level": "intermediate",
            "section_count": 7
        }

    log_status("planning done")
    return {"plan": plan}
