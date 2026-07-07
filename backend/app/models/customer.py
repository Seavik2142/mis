from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.order import Order


class Customer(TimestampMixin, Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_code: Mapped[str] = mapped_column(
        String(30), unique=True, index=True
    )
    name: Mapped[str] = mapped_column(String(120), index=True)
    company: Mapped[str | None] = mapped_column(String(160), nullable=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    segment: Mapped[str] = mapped_column(String(40), default="Active")

    # Midterm exam fields
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    client_type: Mapped[str] = mapped_column(String(40), default="Normal")
    discount: Mapped[float] = mapped_column(default=0.0)

    orders: Mapped[list["Order"]] = relationship(back_populates="customer")

