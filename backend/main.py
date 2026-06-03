from fastapi import FastAPI
from api.blog_routes import router as blog_router
from api.auth_routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
import os

from create_db import create_tables

app = FastAPI(
    title="AI SEO Blog Agent API",
    description="Backend for AI Powered SEO Blog Agent",
    version="1.0"
)

# ✅ Routers with prefix
app.include_router(blog_router, prefix="/api/blog")
app.include_router(auth_router, prefix="/api")


# ✅ Auto DB create (safe)
if os.getenv("AUTO_CREATE_TABLES", "true").lower() in ("1", "true", "yes", "y", "on"):
    create_tables()


# ✅ Health check
@app.get("/")
def health_check():
    return {"message": "Backend server is running"}


# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
