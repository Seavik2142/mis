from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.customer_schema import CustomerSummary


class OrderItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    customer_id: int = Field(gt=0)
    channel: str = Field(default="Online Store", min_length=1, max_length=60)
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderStatusUpdate(BaseModel):
    status: str = Field(min_length=1, max_length=30)


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: float
    line_total: float
    product_name: str
    sku: str


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    customer_id: int
    customer: CustomerSummary
    channel: str
    status: str
    ordered_at: datetime
    total: float
    items: list[OrderItemRead]
    created_at: datetime
    updated_at: datetime
