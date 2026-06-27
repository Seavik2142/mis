from datetime import UTC, date, datetime

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product


def _month_start(months_ago: int) -> datetime:
    now = datetime.now(UTC)
    month_index = now.year * 12 + now.month - 1 - months_ago
    year, zero_based_month = divmod(month_index, 12)
    return datetime(year, zero_based_month + 1, 1, tzinfo=UTC)


def dashboard_summary(db: Session) -> dict:
    revenue = db.scalar(
        select(func.coalesce(func.sum(Order.total), 0)).where(
            Order.status != "Cancelled"
        )
    )
    order_count = db.scalar(
        select(func.count(Order.id)).where(Order.status != "Cancelled")
    )
    customer_count = db.scalar(select(func.count(Customer.id)))
    inventory_value = db.scalar(
        select(
            func.coalesce(func.sum(Product.price * Product.stock), 0)
        ).where(Product.is_active.is_(True))
    )
    low_stock_count = db.scalar(
        select(func.count(Product.id)).where(
            Product.is_active.is_(True),
            Product.stock <= Product.reorder_level,
        )
    )
    return {
        "revenue": float(revenue or 0),
        "orders": int(order_count or 0),
        "customers": int(customer_count or 0),
        "inventory_value": float(inventory_value or 0),
        "low_stock_products": int(low_stock_count or 0),
    }


def monthly_sales(db: Session, months: int = 6) -> list[dict]:
    start = _month_start(months - 1)
    rows = db.execute(
        select(Order.ordered_at, Order.total).where(
            Order.ordered_at >= start,
            Order.status != "Cancelled",
        )
    )
    values: dict[date, dict[str, float | int]] = {}
    for ordered_at, total in rows:
        month = datetime(ordered_at.year, ordered_at.month, 1).date()
        metrics = values.setdefault(month, {"revenue": 0.0, "orders": 0})
        metrics["revenue"] = float(metrics["revenue"]) + float(total)
        metrics["orders"] = int(metrics["orders"]) + 1

    result = []
    for offset in reversed(range(months)):
        month = _month_start(offset)
        metrics = values.get(
            month.date(),
            {"revenue": 0.0, "orders": 0},
        )
        result.append(
            {
                "month": month.strftime("%Y-%m"),
                "label": month.strftime("%b"),
                **metrics,
            }
        )
    return result


def top_products(db: Session, limit: int = 5) -> list[dict]:
    rows = db.execute(
        select(
            Product.id,
            Product.name,
            Product.sku,
            func.sum(OrderItem.quantity).label("units_sold"),
            func.sum(OrderItem.line_total).label("revenue"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.status != "Cancelled")
        .group_by(Product.id)
        .order_by(desc("units_sold"))
        .limit(limit)
    )
    return [
        {
            "product_id": row.id,
            "name": row.name,
            "sku": row.sku,
            "units_sold": int(row.units_sold),
            "revenue": float(row.revenue),
        }
        for row in rows
    ]
