from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, constr


class SignupRequest(BaseModel):
    name: constr(min_length=2, max_length=100)
    email: EmailStr
    password: constr(min_length=8, max_length=128)


class SigninRequest(BaseModel):
    email: EmailStr
    password: constr(min_length=1, max_length=128)


class UserPublic(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


class MeResponse(BaseModel):
    user: UserPublic


class SessionOut(BaseModel):
    session_token: str
    expires_at: datetime

