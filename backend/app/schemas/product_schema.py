from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    sku: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=160)
    category: str = Field(default="General", min_length=1, max_length=100)
    price: float = Field(ge=0)
    stock: int = Field(default=0, ge=0)
    reorder_level: int = Field(default=15, ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    sku: str | None = Field(default=None, min_length=1, max_length=80)
    name: str | None = Field(default=None, min_length=1, max_length=160)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    price: float | None = Field(default=None, ge=0)
    reorder_level: int | None = Field(default=None, ge=0)
    is_active: bool | None = None


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_code: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @property
    def status(self) -> str:
        if self.stock <= self.reorder_level:
            return "Low stock"
        if self.stock <= self.reorder_level * 2:
            return "Watch"
        return "Healthy"
