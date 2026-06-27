from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.db import get_db
from app.models.user import User
from app.services.analytics_service import monthly_sales, top_products
from app.services.sales_service import sales_summary

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/sales")
def get_sales_report(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    days: int = Query(default=30, ge=1, le=366),
) -> dict:
    return {
        "summary": sales_summary(db, days),
        "monthly_sales": monthly_sales(db, 6),
        "top_products": top_products(db, 10),
    }
