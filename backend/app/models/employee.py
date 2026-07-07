from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.db import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.order import Order


class Employee(TimestampMixin, Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
    birth_date: Mapped[str | None] = mapped_column(String(30), nullable=True)
    job: Mapped[str | None] = mapped_column(String(100), nullable=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    salary: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"))
    remarks: Mapped[str | None] = mapped_column(String(255), nullable=True)

    orders: Mapped[list["Order"]] = relationship(back_populates="employee")
