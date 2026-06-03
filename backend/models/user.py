from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)

    # Password handling (salt + hash)
    password_salt = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)

    role = Column(String(32), default="user", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    last_login_at = Column(DateTime, nullable=True)

    # Relationships
    sessions = relationship(
        "Session",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    blogs = relationship(
        "Blog",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # # 🔥 Optional: helper method (useful later)
    # def is_admin(self):
    #     return self.role == "admin"