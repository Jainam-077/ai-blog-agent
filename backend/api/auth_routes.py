import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from datetime import datetime

from core.auth import get_db, get_current_user, _parse_bearer_token
from crud.session import create_session, delete_session, get_session_by_token
from crud.user import create_user, get_user_by_email, verify_password
from schemas.auth_schema import AuthResponse, MeResponse, SigninRequest, SignupRequest, UserPublic

from models.session import Session as SessionModel

router = APIRouter(prefix="/auth", tags=["auth"])


def _to_user_public(user) -> UserPublic:
    return UserPublic(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
    )


@router.post("/signup", response_model=AuthResponse)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, request.email)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = create_user(db, name=request.name, email=request.email, password=request.password)
    session = create_session(db, user_id=user.id, ttl_days=30)

    return AuthResponse(token=session.session_token, user=_to_user_public(user))


@router.post("/signin", response_model=AuthResponse)
def signin(request: SigninRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=401, detail="User is inactive")

    if not verify_password(user, request.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user.last_login_at = datetime.utcnow()
    db.commit()

    session = create_session(db, user_id=user.id, ttl_days=30)
    return AuthResponse(token=session.session_token, user=_to_user_public(user))


@router.get("/me", response_model=MeResponse)
def me(current_user=Depends(get_current_user)):
    return MeResponse(user=_to_user_public(current_user))


@router.post("/signout")
def signout(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
):
    token = _parse_bearer_token(authorization)
    session = get_session_by_token(db, token)
    if session:
        delete_session(db, session)
    # Always return 200 to keep frontend simple
    return {"message": "Signed out"}

