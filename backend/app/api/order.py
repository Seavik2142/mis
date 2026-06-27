from collections import Counter
from datetime import UTC, datetime
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.security import get_current_user
from app.database.db import get_db
from app.models.customer import Customer
from app.models.inventory import InventoryMovement
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order_schema import (
    OrderCreate,
    OrderRead,
    OrderStatusUpdate,
)

router = APIRouter(prefix="/orders", tags=["Orders"])

ALLOWED_STATUSES = {
    "Pending",
    "Packed",
    "Shipped",
    "Completed",
    "Delayed",
    "Cancelled",
}


def _load_order(db: Session, order_id: int) -> Order | None:
    return db.scalar(
        select(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .where(Order.id == order_id)
    )


def _order_payload(order: Order) -> dict:
    return {
        "id": order.id,
        "order_number": order.order_number,
        "customer_id": order.customer_id,
        "customer": order.customer,
        "channel": order.channel,
        "status": order.status,
        "ordered_at": order.ordered_at,
        "total": float(order.total),
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "line_total": float(item.line_total),
                "product_name": item.product.name,
                "sku": item.product.sku,
            }
            for item in order.items
        ],
        "created_at": order.created_at,
        "updated_at": order.updated_at,
    }


@router.get("", response_model=list[OrderRead])
def list_orders(
    db: Annotated[Session, Depends(get_db)],
    order_status: str | None = Query(default=None, alias="status"),
    customer_id: int | None = None,
) -> list[dict]:
    query = (
        select(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .order_by(Order.ordered_at.desc())
    )
    if order_status:
        query = query.where(Order.status == order_status)
    if customer_id:
        query = query.where(Order.customer_id == customer_id)
    orders = db.execute(query).unique().scalars()
    return [_order_payload(order) for order in orders]


@router.get("/{order_id}", response_model=OrderRead)
def get_order(
    order_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    order = _load_order(db, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return _order_payload(order)


@router.post(
    "",
    response_model=OrderRead,
    status_code=status.HTTP_201_CREATED,
)
def create_order(
    payload: OrderCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    customer = db.get(Customer, payload.customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    requested_quantities = Counter(
        {
            item.product_id: 0
            for item in payload.items
        }
    )
    for item in payload.items:
        requested_quantities[item.product_id] += item.quantity

    products = {
        product.id: product
        for product in db.scalars(
            select(Product)
            .where(Product.id.in_(requested_quantities))
            .with_for_update()
        )
    }
    missing_ids = sorted(set(requested_quantities) - products.keys())
    if missing_ids:
        raise HTTPException(
            status_code=404,
            detail=f"Products not found: {missing_ids}",
        )

    for product_id, quantity in requested_quantities.items():
        product = products[product_id]
        if not product.is_active:
            raise HTTPException(
                status_code=409,
                detail=f"Product {product.sku} is archived",
            )
        if product.stock < quantity:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Insufficient stock for {product.sku}: "
                    f"{product.stock} available"
                ),
            )

    order = Order(
        order_number=f"ORD-{datetime.now(UTC):%Y%m%d%H%M%S%f}",
        customer_id=customer.id,
        channel=payload.channel,
        status="Pending",
        total=Decimal("0"),
    )
    db.add(order)
    db.flush()

    total = Decimal("0")
    for product_id, quantity in requested_quantities.items():
        product = products[product_id]
        line_total = product.price * quantity
        total += line_total
        product.stock -= quantity
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=product.price,
                line_total=line_total,
            )
        )
        db.add(
            InventoryMovement(
                product_id=product.id,
                movement_type="SALE",
                quantity=-quantity,
                note=f"Allocated to {order.order_number}",
                created_by=current_user.id,
            )
        )

    order.total = total
    db.commit()
    loaded_order = _load_order(db, order.id)
    if loaded_order is None:
        raise HTTPException(status_code=500, detail="Could not reload order")
    return _order_payload(loaded_order)


@router.patch("/{order_id}/status", response_model=OrderRead)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    if payload.status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=422,
            detail=f"Status must be one of: {sorted(ALLOWED_STATUSES)}",
        )

    order = db.scalar(
        select(Order)
        .options(joinedload(Order.items))
        .where(Order.id == order_id)
        .with_for_update()
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == "Cancelled" and payload.status != "Cancelled":
        raise HTTPException(
            status_code=409,
            detail="A cancelled order cannot be reopened",
        )

    if payload.status == "Cancelled" and order.status != "Cancelled":
        product_ids = [item.product_id for item in order.items]
        products = {
            product.id: product
            for product in db.scalars(
                select(Product)
                .where(Product.id.in_(product_ids))
                .with_for_update()
            )
        }
        for item in order.items:
            products[item.product_id].stock += item.quantity
            db.add(
                InventoryMovement(
                    product_id=item.product_id,
                    movement_type="CANCELLATION",
                    quantity=item.quantity,
                    note=f"Restored from {order.order_number}",
                    created_by=current_user.id,
                )
            )

    order.status = payload.status
    db.commit()
    loaded_order = _load_order(db, order.id)
    if loaded_order is None:
        raise HTTPException(status_code=500, detail="Could not reload order")
    return _order_payload(loaded_order)
