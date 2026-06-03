import asyncio

from ai.graph.blog_graph import blog_graph
from ai.utils.pipeline_log import log_status, log_warn


async def generate_blog(topic: str):

    initial_state = {
        "topic": topic,
        "plan": {},
        "research": [],
        "outline": {},
        "keywords": {},
        "draft": "",
        "final_blog": "",
        "seo": {},
    }

    try:
        log_status("generation started")
        result = await blog_graph.ainvoke(initial_state)

        # =========================
        # CRITICAL SAFETY CHECK
        # =========================
        if not isinstance(result, dict):
            raise ValueError(f"Graph returned invalid type: {type(result)}")

        log_status("generation complete")

        return {
            "content": result.get("final_blog", ""),
            "plan": result.get("plan", {}),
            "research": result.get("research", []),
            "outline": result.get("outline", {}),
            "keywords": result.get("keywords", {}),
            "seo": result.get("seo", {}),
        }

    except asyncio.CancelledError:
        raise
    except Exception as e:
        log_warn(f"generation failed: {e}")

        return {
            "content": "",
            "plan": {},
            "research": [],
            "outline": {},
            "keywords": {},
            "seo": {},
            "error": str(e)
        }
