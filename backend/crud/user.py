import bcrypt
from sqlalchemy.orm import Session

from models.user import User


def create_user(db: Session, *, name: str, email: str, password: str) -> User:
    salt = bcrypt.gensalt()
    pwd_hash = bcrypt.hashpw(password.encode("utf-8"), salt)

    user = User(
        name=name,
        email=email,
        password_salt=salt.decode("utf-8"),
        password_hash=pwd_hash.decode("utf-8"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def verify_password(user: User, password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), user.password_hash.encode("utf-8"))

