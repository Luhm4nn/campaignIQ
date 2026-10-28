from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = ""
    username: Optional[str] = None
    plan: Optional[str] = "pro"


class UserCreate(UserBase):
    password: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    username: Optional[str] = None


class UserRead(UserBase):
    id: int
    model_config = {"from_attributes": True}
