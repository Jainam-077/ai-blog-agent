from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from models.blog import Blog


def create_blog(db: Session, *, user_id: int, title: str, content: str, keywords: str):
    try:
        blog = Blog(
            title=title,
            content=content,
            keywords=keywords,
            user_id=user_id
        )
        db.add(blog)
        db.commit()
        db.refresh(blog)
        return blog

    except SQLAlchemyError as e:
        db.rollback()
        raise e


def get_blogs(db: Session):
    return db.query(Blog).order_by(Blog.created_at.desc()).all()


def get_blog(db: Session, blog_id: int):
    return db.query(Blog).filter(Blog.id == blog_id).first()


def get_my_blogs(db: Session, *, user_id: int):
    return (
        db.query(Blog)
        .filter(Blog.user_id == user_id)
        .order_by(Blog.created_at.desc())
        .all()
    )


def get_my_blog(db: Session, *, user_id: int, blog_id: int):
    return (
        db.query(Blog)
        .filter(Blog.id == blog_id, Blog.user_id == user_id)
        .first()
    )


#  Update Blog
def update_blog(db: Session, *, user_id: int, blog_id: int, title: str, content: str, keywords: str):
    blog = db.query(Blog).filter(Blog.id == blog_id, Blog.user_id == user_id).first()

    if not blog:
        return None

    blog.title = title
    blog.content = content
    blog.keywords = keywords

    db.commit()
    db.refresh(blog)
    return blog


# Delete Blog
def delete_blog(db: Session, *, user_id: int, blog_id: int):
    blog = db.query(Blog).filter(Blog.id == blog_id, Blog.user_id == user_id).first()

    if not blog:
        return False

    db.delete(blog)
    db.commit()
    return True