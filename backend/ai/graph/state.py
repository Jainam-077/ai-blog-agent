from typing import TypedDict, List, Dict, Any


class BlogState(TypedDict):
    topic:      str
    plan:       Dict[str, Any]
    keywords:   Dict[str, Any]
    research:   List[Dict[str, Any]]
    outline:    Dict[str, Any]
    final_blog: str
    seo:        Dict[str, Any]
