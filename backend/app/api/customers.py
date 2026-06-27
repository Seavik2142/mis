from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.database.db import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.user import User
from app.schemas.customer_schema import (
    CustomerCreate,
    CustomerRead,
    CustomerUpdate,
)

router = APIRouter(prefix="/customers", tags=["Customers"])


def _customer_payload(
    customer: Customer,
    order_count: int,
    spend: float,
) -> dict:
    return {
        "id": customer.id,
        "customer_code": customer.customer_code,
        "name": customer.name,
        "company": customer.company,
        "email": customer.email,
        "phone": customer.phone,
        "segment": customer.segment,
        "orders": order_count,
        "spend": spend,
        "created_at": customer.created_at,
        "updated_at": customer.updated_at,
    }


@router.get("", response_model=list[CustomerRead])
def list_customers(
    db: Annotated[Session, Depends(get_db)],
    search: str | None = Query(default=None, max_length=100),
) -> list[dict]:
    query = (
        select(
            Customer,
            func.count(Order.id).label("order_count"),
            func.coalesce(func.sum(Order.total), 0).label("spend"),
        )
        .outerjoin(Order, Order.customer_id == Customer.id)
        .group_by(Customer.id)
        .order_by(Customer.name)
    )
    if search:
        term = f"%{search.strip()}%"
        query = query.where(
            or_(
                Customer.name.ilike(term),
                Customer.company.ilike(term),
                Customer.email.ilike(term),
                Customer.customer_code.ilike(term),
            )
        )

    return [
        _customer_payload(customer, order_count, float(spend))
        for customer, order_count, spend in db.execute(query)
    ]


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(
    customer_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    row = db.execute(
        select(
            Customer,
            func.count(Order.id),
            func.coalesce(func.sum(Order.total), 0),
        )
        .outerjoin(Order, Order.customer_id == Customer.id)
        .where(Customer.id == customer_id)
        .group_by(Customer.id)
    ).one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return _customer_payload(row[0], row[1], float(row[2]))


@router.post(
    "",
    response_model=CustomerRead,
    status_code=status.HTTP_201_CREATED,
)
def create_customer(
    payload: CustomerCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
) -> dict:
    customer = Customer(
        customer_code=f"CUS-{uuid4().hex[:10].upper()}",
        **payload.model_dump(),
    )
    db.add(customer)
    try:
        db.flush()
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A customer with this email already exists",
        ) from None
    db.refresh(customer)
    return _customer_payload(customer, 0, 0)


@router.put("/{customer_id}", response_model=CustomerRead)
def update_customer(
    customer_id: int,
    payload: CustomerUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
) -> dict:
    customer = db.get(Customer, customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A customer with this email already exists",
        ) from None
    db.refresh(customer)
    order_count, spend = db.execute(
        select(
            func.count(Order.id),
            func.coalesce(func.sum(Order.total), 0),
        ).where(Order.customer_id == customer_id)
    ).one()
    return _customer_payload(customer, order_count, float(spend))
