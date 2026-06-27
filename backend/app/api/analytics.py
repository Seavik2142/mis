from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.services.analytics_service import (
    dashboard_summary,
    monthly_sales,
    top_products,
)
from app.services.inventory_service import inventory_summary

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
def get_dashboard(
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    return {
        **dashboard_summary(db),
        **inventory_summary(db),
    }


@router.get("/monthly-sales")
def get_monthly_sales(
    db: Annotated[Session, Depends(get_db)],
    months: int = Query(default=6, ge=1, le=24),
) -> list[dict]:
    return monthly_sales(db, months)


@router.get("/top-products")
def get_top_products(
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=5, ge=1, le=25),
) -> list[dict]:
    return top_products(db, limit)
