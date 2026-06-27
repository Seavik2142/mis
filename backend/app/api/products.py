from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import require_admin
from app.database.db import get_db
from app.models.inventory import InventoryMovement
from app.models.product import Product
from app.models.user import User
from app.schemas.product_schema import (
    ProductCreate,
    ProductRead,
    ProductUpdate,
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=list[ProductRead])
def list_products(
    db: Annotated[Session, Depends(get_db)],
    search: str | None = Query(default=None, max_length=100),
    category: str | None = Query(default=None, max_length=100),
    low_stock: bool = False,
    include_inactive: bool = False,
) -> list[Product]:
    query = select(Product).order_by(Product.name)
    if not include_inactive:
        query = query.where(Product.is_active.is_(True))
    if search:
        term = f"%{search.strip()}%"
        query = query.where(
            or_(
                Product.name.ilike(term),
                Product.sku.ilike(term),
                Product.product_code.ilike(term),
            )
        )
    if category:
        query = query.where(Product.category == category)
    if low_stock:
        query = query.where(Product.stock <= Product.reorder_level)
    return list(db.scalars(query))


@router.get("/{product_id}", response_model=ProductRead)
def get_product(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post(
    "",
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    payload: ProductCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_admin)],
) -> Product:
    product = Product(
        product_code=f"PRD-{uuid4().hex[:10].upper()}",
        **payload.model_dump(),
    )
    db.add(product)
    try:
        db.flush()
        if product.stock:
            db.add(
                InventoryMovement(
                    product_id=product.id,
                    movement_type="INITIAL",
                    quantity=product.stock,
                    note="Initial product stock",
                    created_by=current_user.id,
                )
            )
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A product with this SKU already exists",
        ) from None
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A product with this SKU already exists",
        ) from None
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
) -> dict[str, str]:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()
    return {"message": "Product archived"}
