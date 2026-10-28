from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    identifier: str = Field(..., min_length=1, description="Email o nombre de usuario")
    password: str = Field(..., min_length=1)


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)
    company: Optional[str] = ""
    username: Optional[str] = None


class RefreshRequest(BaseModel):
    refreshToken: Optional[str] = None


class AuthUserRead(BaseModel):
    id: int
    name: str
    email: str
    username: Optional[str] = None
    company: str = ""
    plan: str = "pro"
    isActive: bool = True


class AuthResponse(BaseModel):
    user: AuthUserRead
    accessToken: str
    refreshToken: str
    tokenType: str = "bearer"
