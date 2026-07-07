from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.inventory import InventoryMovement
    from app.models.order import OrderItem


class Product(TimestampMixin, Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_products_price_nonnegative"),
        CheckConstraint("stock >= 0", name="ck_products_stock_nonnegative"),
        CheckConstraint(
            "reorder_level >= 0",
            name="ck_products_reorder_level_nonnegative",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    product_code: Mapped[str] = mapped_column(
        String(30), unique=True, index=True
    )
    sku: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160), index=True)
    category: Mapped[str] = mapped_column(String(100), default="General")
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    stock: Mapped[int] = mapped_column(Integer, default=0)
    reorder_level: Mapped[int] = mapped_column(Integer, default=15)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Midterm exam fields
    product_type: Mapped[str] = mapped_column(String(100), default="Accessory")
    unit_measure: Mapped[str] = mapped_column(String(40), default="Piece")
    cost_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"))


    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="product")
    inventory_movements: Mapped[list["InventoryMovement"]] = relationship(
        back_populates="product"
    )
