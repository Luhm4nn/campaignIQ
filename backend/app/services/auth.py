import base64
import hashlib
import hmac
import json
import math
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.users import RefreshToken, User, utcnow_naive
from app.schemas.auth import AuthResponse, AuthUserRead, LoginRequest, RegisterRequest

JWT_SECRET = os.getenv("JWT_SECRET", "campaigniq-dev-jwt-secret-key-2026")
ACCESS_TOKEN_TTL_SECONDS = int(os.getenv("ACCESS_TOKEN_TTL_SECONDS", str(12 * 3600)))
REFRESH_TOKEN_TTL_DAYS = int(os.getenv("REFRESH_TOKEN_TTL_DAYS", "30"))
LOGIN_MAX_ATTEMPTS = int(os.getenv("LOGIN_MAX_ATTEMPTS", "5"))
LOGIN_LOCK_MINUTES = int(os.getenv("LOGIN_LOCK_MINUTES", "15"))

ACCESS_COOKIE_NAME = os.getenv("ACCESS_COOKIE_NAME", "ciq_session")
REFRESH_COOKIE_NAME = os.getenv("REFRESH_COOKIE_NAME", "ciq_refresh_token")

PBKDF2_ITERATIONS = 260_000


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(raw: str) -> bytes:
    padding = "=" * (-len(raw) % 4)
    return base64.urlsafe_b64decode((raw + padding).encode("ascii"))


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("ascii"),
        PBKDF2_ITERATIONS,
    )
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt}${derived.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    if not stored_hash or "$" not in stored_hash:
        return False
    parts = stored_hash.split("$")
    if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
        return False
    try:
        iterations = int(parts[1])
        salt = parts[2]
        expected_hex = parts[3]
    except ValueError:
        return False

    derived = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("ascii"),
        iterations,
    )
    return hmac.compare_digest(derived.hex(), expected_hex)


def sign_access_token(user: User) -> str:
    now_ts = int(datetime.now(timezone.utc).timestamp())
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "userId": user.id,
        "email": user.email,
        "plan": user.plan or "pro",
        "iat": now_ts,
        "exp": now_ts + ACCESS_TOKEN_TTL_SECONDS,
    }
    header_b64 = _b64url_encode(
        json.dumps(header, separators=(",", ":")).encode("utf-8")
    )
    payload_b64 = _b64url_encode(
        json.dumps(payload, separators=(",", ":")).encode("utf-8")
    )
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    signature = hmac.new(
        JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256
    ).digest()
    return f"{header_b64}.{payload_b64}.{_b64url_encode(signature)}"


def verify_access_token(token: str) -> Dict[str, Any]:
    if not token or token.count(".") != 2:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )
    header_b64, payload_b64, sig_b64 = token.split(".")
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    expected_sig = hmac.new(
        JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256
    ).digest()

    try:
        actual_sig = _b64url_decode(sig_b64)
        if not hmac.compare_digest(actual_sig, expected_sig):
            raise ValueError("Invalid signature")
        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        ) from exc

    now_ts = int(datetime.now(timezone.utc).timestamp())
    if int(payload.get("exp", 0)) <= now_ts:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )
    return payload


def to_auth_user_read(user: User) -> AuthUserRead:
    return AuthUserRead(
        id=user.id,
        name=user.name,
        email=user.email,
        username=user.username,
        company=user.company or "",
        plan=user.plan or "pro",
        isActive=bool(user.is_active),
    )


def _issue_refresh_token(db: Session, user: User) -> str:
    raw_token = secrets.token_hex(48)
    expires_at = utcnow_naive() + timedelta(days=REFRESH_TOKEN_TTL_DAYS)
    db_token = RefreshToken(
        user_id=user.id,
        token=raw_token,
        expires_at=expires_at,
    )
    db.add(db_token)
    db.commit()
    return raw_token


def _resolve_user_by_identifier(db: Session, identifier: str) -> Optional[User]:
    clean = identifier.strip()
    if not clean:
        return None
    by_email = db.query(User).filter(User.email == clean.lower()).first()
    if by_email:
        return by_email
    handle = clean.lstrip("@").lower()
    return db.query(User).filter(User.username == handle).first()


def register_user(db: Session, payload: RegisterRequest) -> AuthResponse:
    email_clean = payload.email.strip().lower()
    existing_email = db.query(User).filter(User.email == email_clean).first()
    if existing_email:
        # Si existía un perfil creado desde Settings sin contraseña asignada, lo activamos con credenciales
        if not existing_email.password_hash:
            existing_email.name = payload.name.strip()
            existing_email.company = (payload.company or "").strip()
            existing_email.password_hash = hash_password(payload.password)
            existing_email.plan = "pro"
            existing_email.is_active = True
            existing_email.failed_attempts = 0
            existing_email.locked_until = None
            if payload.username and payload.username.strip():
                existing_email.username = payload.username.strip().lstrip("@").lower()
            db.commit()
            db.refresh(existing_email)
            access_token = sign_access_token(existing_email)
            refresh_token = _issue_refresh_token(db, existing_email)
            return AuthResponse(
                user=to_auth_user_read(existing_email),
                accessToken=access_token,
                refreshToken=refresh_token,
            )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists",
        )

    username_clean: Optional[str] = None
    if payload.username and payload.username.strip():
        username_clean = payload.username.strip().lstrip("@").lower()
        existing_username = (
            db.query(User).filter(User.username == username_clean).first()
        )
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This username is already taken",
            )

    new_user = User(
        name=payload.name.strip(),
        email=email_clean,
        username=username_clean,
        password_hash=hash_password(payload.password),
        company=(payload.company or "").strip(),
        plan="pro",
        is_active=True,
        failed_attempts=0,
        locked_until=None,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = sign_access_token(new_user)
    refresh_token = _issue_refresh_token(db, new_user)
    return AuthResponse(
        user=to_auth_user_read(new_user),
        accessToken=access_token,
        refreshToken=refresh_token,
    )


def login_user(db: Session, payload: LoginRequest) -> AuthResponse:
    user = _resolve_user_by_identifier(db, payload.identifier)
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password",
        )

    now = utcnow_naive()
    if user.locked_until and user.locked_until > now:
        remaining_seconds = (user.locked_until - now).total_seconds()
        minutes = max(1, math.ceil(remaining_seconds / 60))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Account temporarily locked. Please try again in {minutes} minute(s)",
        )

    if not verify_password(payload.password, user.password_hash):
        user.failed_attempts = (user.failed_attempts or 0) + 1
        if user.failed_attempts >= LOGIN_MAX_ATTEMPTS:
            user.locked_until = now + timedelta(minutes=LOGIN_LOCK_MINUTES)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Account locked due to multiple failed attempts. Try again in {LOGIN_LOCK_MINUTES} minute(s)",
            )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password",
        )

    if (user.failed_attempts or 0) > 0 or user.locked_until is not None:
        user.failed_attempts = 0
        user.locked_until = None
        db.commit()

    access_token = sign_access_token(user)
    refresh_token = _issue_refresh_token(db, user)
    return AuthResponse(
        user=to_auth_user_read(user),
        accessToken=access_token,
        refreshToken=refresh_token,
    )


def refresh_session(db: Session, raw_refresh_token: Optional[str]) -> AuthResponse:
    if not raw_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token es requerido",
        )

    stored = (
        db.query(RefreshToken)
        .filter(RefreshToken.token == raw_refresh_token)
        .first()
    )
    now = utcnow_naive()
    if not stored or stored.revoked_at is not None or stored.expires_at <= now:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido o expirado",
        )

    # Rotación de token: revocamos el token usado inmediatamente
    stored.revoked_at = now
    db.commit()

    user = db.query(User).filter(User.id == stored.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión inválida",
        )

    access_token = sign_access_token(user)
    new_refresh_token = _issue_refresh_token(db, user)
    return AuthResponse(
        user=to_auth_user_read(user),
        accessToken=access_token,
        refreshToken=new_refresh_token,
    )


def logout_session(db: Session, raw_refresh_token: Optional[str]) -> None:
    if not raw_refresh_token:
        return
    stored = (
        db.query(RefreshToken)
        .filter(RefreshToken.token == raw_refresh_token)
        .first()
    )
    if stored and stored.revoked_at is None:
        stored.revoked_at = utcnow_naive()
        db.commit()
