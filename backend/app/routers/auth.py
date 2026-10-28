import os
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.db.dbsession import get_db
from app.models.users import User
from app.schemas.auth import (
    AuthResponse,
    AuthUserRead,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
)
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

IS_PROD = os.getenv("ENV", "development").lower() == "production"


def _set_auth_cookies(response: Response, auth_result: AuthResponse) -> None:
    response.set_cookie(
        key=auth_service.ACCESS_COOKIE_NAME,
        value=auth_result.accessToken,
        httponly=True,
        secure=IS_PROD,
        samesite="lax",
        max_age=auth_service.ACCESS_TOKEN_TTL_SECONDS,
        path="/",
    )
    response.set_cookie(
        key=auth_service.REFRESH_COOKIE_NAME,
        value=auth_result.refreshToken,
        httponly=True,
        secure=IS_PROD,
        samesite="lax",
        max_age=auth_service.REFRESH_TOKEN_TTL_DAYS * 86400,
        path="/",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(key=auth_service.ACCESS_COOKIE_NAME, path="/")
    response.delete_cookie(key=auth_service.REFRESH_COOKIE_NAME, path="/")


def _extract_access_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        return auth_header.split(" ", 1)[1].strip()
    return request.cookies.get(auth_service.ACCESS_COOKIE_NAME)


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    token = _extract_access_token(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado",
        )
    payload = auth_service.verify_access_token(token)
    user_id = payload.get("userId")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión inválida",
        )
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión inválida",
        )
    return user


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_endpoint(
    payload: RegisterRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    result = auth_service.register_user(db, payload)
    _set_auth_cookies(response, result)
    return result


@router.post("/login", response_model=AuthResponse)
def login_endpoint(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    result = auth_service.login_user(db, payload)
    _set_auth_cookies(response, result)
    return result


@router.post("/refresh", response_model=AuthResponse)
def refresh_endpoint(
    request: Request,
    response: Response,
    payload: Optional[RefreshRequest] = None,
    db: Session = Depends(get_db),
):
    raw_refresh = (
        (payload.refreshToken if payload and payload.refreshToken else None)
        or request.cookies.get(auth_service.REFRESH_COOKIE_NAME)
    )
    result = auth_service.refresh_session(db, raw_refresh)
    _set_auth_cookies(response, result)
    return result


@router.post("/logout")
def logout_endpoint(
    request: Request,
    response: Response,
    payload: Optional[RefreshRequest] = None,
    db: Session = Depends(get_db),
):
    raw_refresh = (
        (payload.refreshToken if payload and payload.refreshToken else None)
        or request.cookies.get(auth_service.REFRESH_COOKIE_NAME)
    )
    auth_service.logout_session(db, raw_refresh)
    _clear_auth_cookies(response)
    return {"message": "Sesión cerrada"}


@router.get("/me", response_model=AuthUserRead)
def me_endpoint(current_user: User = Depends(get_current_user)):
    return auth_service.to_auth_user_read(current_user)
