from sqlalchemy import inspect, text

from core.database import engine, Base
from models.blog import Blog
from models.user import User
from models.session import Session


def _ensure_blogs_schema():
    inspector = inspect(engine)
    if not inspector.has_table("blogs"):
        return

    columns = {column["name"] for column in inspector.get_columns("blogs")}

    with engine.begin() as connection:
        if "user_id" not in columns:
            connection.execute(
                text(
                    "ALTER TABLE blogs "
                    "ADD COLUMN user_id INTEGER REFERENCES users(id)"
                )
            )
            connection.execute(
                text("CREATE INDEX IF NOT EXISTS ix_blogs_user_id ON blogs (user_id)")
            )


def create_tables():
    print("Creating tables...")

    Base.metadata.create_all(bind=engine)
    _ensure_blogs_schema()

    print("Tables created successfully!")


if __name__ == "__main__":
    create_tables()
