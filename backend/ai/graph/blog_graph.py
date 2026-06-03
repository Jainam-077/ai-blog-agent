from langgraph.graph import StateGraph, END
from ai.graph.state import BlogState
from ai.agents.planner  import planner_agent
from ai.agents.research import research_agent
from ai.agents.keyword  import keyword_agent
from ai.agents.outline  import outline_agent
from ai.agents.writer   import writer_agent
from ai.agents.seo      import seo_agent


def build_graph():
    g = StateGraph(BlogState)
    g.add_node("planner",  planner_agent)
    g.add_node("research", research_agent)
    g.add_node("keyword",  keyword_agent)
    g.add_node("outline",  outline_agent)
    g.add_node("writer",   writer_agent)
    g.add_node("seo",      seo_agent)

    g.set_entry_point("planner")
    g.add_edge("planner",  "research")
    g.add_edge("planner",  "keyword")
    g.add_edge("research", "outline")
    g.add_edge("keyword",  "outline")
    g.add_edge("outline",  "writer")
    g.add_edge("writer",   "seo")
    g.add_edge("seo",      END)

    return g.compile()


blog_graph = build_graph()
