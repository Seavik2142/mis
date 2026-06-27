from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.security import require_admin
from app.database.db import get_db
from app.models.inventory import InventoryMovement
from app.models.product import Product
from app.models.user import User
from app.schemas.inventory_schema import (
    InventoryAdjustment,
    InventoryMovementRead,
)
from app.schemas.product_schema import ProductRead

router = APIRouter(prefix="/inventory", tags=["Inventory"])


def _movement_payload(movement: InventoryMovement) -> dict:
    return {
        "id": movement.id,
        "product_id": movement.product_id,
        "product_name": movement.product.name,
        "sku": movement.product.sku,
        "movement_type": movement.movement_type,
        "quantity": movement.quantity,
        "note": movement.note,
        "created_by": movement.created_by,
        "created_at": movement.created_at,
    }


@router.get("/low-stock", response_model=list[ProductRead])
def low_stock_products(
    db: Annotated[Session, Depends(get_db)],
) -> list[Product]:
    return list(
        db.scalars(
            select(Product)
            .where(
                Product.is_active.is_(True),
                Product.stock <= Product.reorder_level,
            )
            .order_by(Product.stock)
        )
    )


@router.get("/movements", response_model=list[InventoryMovementRead])
def list_movements(
    db: Annotated[Session, Depends(get_db)],
    product_id: int | None = None,
    limit: int = Query(default=100, ge=1, le=500),
) -> list[dict]:
    query = (
        select(InventoryMovement)
        .options(joinedload(InventoryMovement.product))
        .order_by(InventoryMovement.created_at.desc())
        .limit(limit)
    )
    if product_id:
        query = query.where(InventoryMovement.product_id == product_id)
    return [
        _movement_payload(movement)
        for movement in db.scalars(query)
    ]


@router.post("/{product_id}/adjust", response_model=ProductRead)
def adjust_inventory(
    product_id: int,
    payload: InventoryAdjustment,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
) -> Product:
    if payload.quantity == 0:
        raise HTTPException(
            status_code=422,
            detail="Adjustment quantity cannot be zero",
        )

    product = db.scalar(
        select(Product)
        .where(Product.id == product_id)
        .with_for_update()
    )
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock + payload.quantity < 0:
        raise HTTPException(
            status_code=409,
            detail="Adjustment would make stock negative",
        )

    product.stock += payload.quantity
    db.add(
        InventoryMovement(
            product_id=product.id,
            movement_type="ADJUSTMENT",
            quantity=payload.quantity,
            note=payload.note,
            created_by=current_user.id,
        )
    )
    db.commit()
    db.refresh(product)
    return product
