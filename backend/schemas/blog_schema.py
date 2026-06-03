from pydantic import BaseModel
from datetime import datetime

# 🔹 Request Schema (no change)
class BlogRequest(BaseModel):
    topic: str


# 🔹 AI Response Schema (your current use)
class BlogResponse(BaseModel):
    title: str
    content: str
    seo_score: int


# 🔹 Database Response Schema (NEW - IMPORTANT)
class BlogDBResponse(BaseModel):
    id: int
    title: str
    content: str
    keywords: str
    created_at: datetime

    class Config:
        from_attributes = True