from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CustomerBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    company: str | None = Field(default=None, max_length=160)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=40)
    segment: str = Field(default="Active", min_length=1, max_length=40)


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    company: str | None = Field(default=None, max_length=160)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=40)
    segment: str | None = Field(default=None, min_length=1, max_length=40)


class CustomerRead(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_code: str
    orders: int = 0
    spend: float = 0
    created_at: datetime
    updated_at: datetime


class CustomerSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_code: str
    name: str
    company: str | None
    email: EmailStr
