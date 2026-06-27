from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Product


def inventory_summary(db: Session) -> dict:
    row = db.execute(
        select(
            func.coalesce(func.sum(Product.stock), 0),
            func.coalesce(func.sum(Product.stock * Product.price), 0),
            func.count(Product.id),
        ).where(Product.is_active.is_(True))
    ).one()
    return {
        "units_in_stock": int(row[0]),
        "inventory_value": float(row[1]),
        "active_products": int(row[2]),
    }
