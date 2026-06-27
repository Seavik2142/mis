from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.order import Order


def sales_summary(db: Session, days: int = 30) -> dict:
    since = datetime.now(UTC) - timedelta(days=days)
    revenue, orders, average_order = db.execute(
        select(
            func.coalesce(func.sum(Order.total), 0),
            func.count(Order.id),
            func.coalesce(func.avg(Order.total), 0),
        ).where(
            Order.ordered_at >= since,
            Order.status != "Cancelled",
        )
    ).one()
    return {
        "period_days": days,
        "revenue": float(revenue),
        "orders": int(orders),
        "average_order_value": float(average_order),
        "generated_at": datetime.now(UTC),
    }
