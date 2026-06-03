from datetime import datetime

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from .database import SessionLocal
from crud.session import get_session_by_token
from models.user import User

from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/signin")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _parse_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid Authorization header")
    return parts[1]

def get_current_user_optional(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User | None:
    
    # 👉 No token → guest user
    if not authorization:
        return None

    try:
        token = _parse_bearer_token(authorization)
    except:
        return None

    session = get_session_by_token(db, token)
    if not session:
        return None

    if session.expires_at < datetime.utcnow():
        return None

    session.last_access_at = datetime.utcnow()
    db.commit()

    user = db.query(User).filter(User.id == session.user_id).first()

    if not user or not user.is_active:
        return None

    return user

def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    token = _parse_bearer_token(authorization)
    session = get_session_by_token(db, token)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    if session.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    # Basic "last access" update (best-effort; no need to block request).
    session.last_access_at = datetime.utcnow()
    db.commit()

    user = db.query(User).filter(User.id == session.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User is inactive")

    return user

