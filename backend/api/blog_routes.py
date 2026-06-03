import json

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from core.auth import get_current_user, get_current_user_optional
from core.database import SessionLocal
from crud.blog import create_blog, get_blog, get_blogs, get_my_blog, get_my_blogs as fetch_my_blogs
from schemas.blog_schema import BlogRequest
from services.blog_service import GenerationCancelledError, generate_blog_service_cancellable

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/generate")
async def generate_blog_api(
    http_request: Request,
    request: BlogRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional),
):
    try:
        result = await generate_blog_service_cancellable(http_request, request.topic)
        if not isinstance(result, dict):
            raise ValueError(f"Invalid result type: {type(result)}")

        content = result.get("content", {})
        seo = result.get("seo", {}) or {}

        outline = result.get("outline", {}) or {}
        generated_title = outline.get("title") if isinstance(outline, dict) else None

        if isinstance(content, dict):
            title = seo.get("title") or content.get("title") or generated_title or "Untitled"
            body = content.get("body") or content.get("content") or ""
        else:
            title = seo.get("title") or generated_title or request.topic
            body = content

        keywords = seo.get("keywords", [])
        blog_payload = {
            "id": None,
            "title": title,
            "content": body,
            "keywords": keywords,
            "created_at": None,
        }
        message = "Blog generated successfully"

        if current_user and current_user.id is not None:
            saved_blog = create_blog(
                db,
                user_id=current_user.id,
                title=title,
                content=body,
                keywords=json.dumps(keywords),
            )
            blog_payload = {
                "id": saved_blog.id,
                "title": saved_blog.title,
                "content": saved_blog.content,
                "keywords": keywords,
                "created_at": saved_blog.created_at,
            }
            message = "Blog generated and saved successfully"

        return {
            "message": message,
            "blog": blog_payload,
            "meta": {
                "plan": result.get("plan"),
                "seo": seo,
            },
        }

    except GenerationCancelledError:
        raise HTTPException(status_code=499, detail="Generation cancelled by client")
    except Exception as e:
        import traceback

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def get_all_blogs(db: Session = Depends(get_db)):
    blogs = get_blogs(db)

    return [
        {
            "id": blog.id,
            "title": blog.title,
            "content": blog.content,
            "keywords": json.loads(blog.keywords) if blog.keywords else [],
            "created_at": blog.created_at,
        }
        for blog in blogs
    ]


@router.get("/me")
def get_my_blogs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    blogs = fetch_my_blogs(db, user_id=current_user.id)

    return [
        {
            "id": blog.id,
            "title": blog.title,
            "content": blog.content,
            "keywords": json.loads(blog.keywords) if blog.keywords else [],
            "created_at": blog.created_at,
        }
        for blog in blogs
    ]


@router.get("/{blog_id}")
def get_single_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = get_blog(db, blog_id)

    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")

    return {
        "id": blog.id,
        "title": blog.title,
        "content": blog.content,
        "keywords": json.loads(blog.keywords) if blog.keywords else [],
        "created_at": blog.created_at,
    }


@router.put("/{blog_id}")
async def update_blog(
    blog_id: int,
    http_request: Request,
    request: BlogRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        blog = get_my_blog(db, user_id=current_user.id, blog_id=blog_id)
        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")

        result = await generate_blog_service_cancellable(http_request, request.topic)
        content = result.get("content", {})
        seo = result.get("seo", {}) or {}

        outline = result.get("outline", {}) or {}
        generated_title = outline.get("title") if isinstance(outline, dict) else None

        if isinstance(content, dict):
            blog.title = seo.get("title") or content.get("title") or generated_title or request.topic
            blog.content = content.get("body") or content.get("content") or ""
        else:
            blog.title = seo.get("title") or generated_title or request.topic
            blog.content = content

        blog.keywords = json.dumps(seo.get("keywords", []))

        db.commit()
        db.refresh(blog)

        return {
            "message": "Blog updated successfully",
            "blog": {
                "id": blog.id,
                "title": blog.title,
                "content": blog.content,
                "keywords": json.loads(blog.keywords) if blog.keywords else [],
                "created_at": blog.created_at,
            },
        }

    except GenerationCancelledError:
        db.rollback()
        raise HTTPException(status_code=499, detail="Generation cancelled by client")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{blog_id}")
def delete_blog(
    blog_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    try:
        blog = get_my_blog(db, user_id=current_user.id, blog_id=blog_id)
        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")

        db.delete(blog)
        db.commit()

        return {
            "message": "Blog deleted successfully",
            "deleted_blog_id": blog_id,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
