from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class InventoryAdjustment(BaseModel):
    quantity: int
    note: str | None = Field(default=None, max_length=255)


class InventoryMovementRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str
    sku: str
    movement_type: str
    quantity: int
    note: str | None
    created_by: int | None
    created_at: datetime
