import secrets
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from models.session import Session as SessionModel


def create_session(db: Session, *, user_id: int, ttl_days: int = 30) -> SessionModel:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(days=ttl_days)

    session = SessionModel(
        session_token=token,
        user_id=user_id,
        expires_at=expires_at,
        last_access_at=datetime.utcnow(),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_session_by_token(db: Session, token: str):
    return db.query(SessionModel).filter(SessionModel.session_token == token).first()


def delete_session(db: Session, session: SessionModel):
    db.delete(session)
    db.commit()

