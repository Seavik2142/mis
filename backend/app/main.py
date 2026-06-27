from contextlib import asynccontextmanager
from datetime import UTC, datetime, timedelta
from decimal import Decimal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text

from app.api import (
    analytics,
    auth,
    customers,
    inventory,
    order,
    products,
    reports,
)
from app.core.config import settings
from app.core.security import hash_password
from app.database.db import SessionLocal, init_db
from app.models.customer import Customer
from app.models.inventory import InventoryMovement
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User


def seed_initial_admin() -> None:
    if not settings.initial_admin_email or not settings.initial_admin_password:
        return
    with SessionLocal() as db:
        existing_user = db.scalar(
            select(User).where(
                User.email == str(settings.initial_admin_email).lower()
            )
        )
        if existing_user is not None:
            return
        db.add(
            User(
                email=str(settings.initial_admin_email).lower(),
                full_name=settings.initial_admin_name,
                hashed_password=hash_password(
                    settings.initial_admin_password
                ),
                is_admin=True,
            )
        )
        db.commit()


def seed_demo_data() -> None:
    if not settings.seed_demo_data:
        return

    with SessionLocal() as db:
        has_data = db.scalar(select(Product.id).limit(1)) or db.scalar(
            select(Customer.id).limit(1)
        )
        if has_data:
            return

        admin = db.scalar(
            select(User).where(
                User.email == str(settings.initial_admin_email).lower()
            )
        )
        admin_id = admin.id if admin else None

        products = [
            Product(
                product_code="PRD-DEMO-LT14",
                sku="LT-14-PRO",
                name="Laptop Pro 14",
                category="Computers",
                price=Decimal("1299.00"),
                stock=72,
                reorder_level=18,
            ),
            Product(
                product_code="PRD-DEMO-PHX9",
                sku="PH-X9",
                name="Phone X9",
                category="Mobile",
                price=Decimal("899.00"),
                stock=42,
                reorder_level=20,
            ),
            Product(
                product_code="PRD-DEMO-KBMECH",
                sku="KB-MECH",
                name="Mechanical Keyboard",
                category="Accessories",
                price=Decimal("149.00"),
                stock=28,
                reorder_level=16,
            ),
            Product(
                product_code="PRD-DEMO-MSWL",
                sku="MS-WL",
                name="Wireless Mouse",
                category="Accessories",
                price=Decimal("59.00"),
                stock=66,
                reorder_level=24,
            ),
            Product(
                product_code="PRD-DEMO-DK4K",
                sku="DK-4K",
                name="4K Docking Station",
                category="Accessories",
                price=Decimal("229.00"),
                stock=18,
                reorder_level=14,
            ),
        ]
        db.add_all(products)
        db.flush()

        for product in products:
            db.add(
                InventoryMovement(
                    product_id=product.id,
                    movement_type="INITIAL",
                    quantity=product.stock,
                    note="Seeded opening stock",
                    created_by=admin_id,
                )
            )

        customers = [
            Customer(
                customer_code="CUS-DEMO-MAYA",
                name="Maya Chen",
                company="Northline Retail",
                email="maya.chen@example.com",
                phone="+1 415 555 0141",
                segment="VIP",
            ),
            Customer(
                customer_code="CUS-DEMO-RONAN",
                name="Ronan Hale",
                company="Hale Studio",
                email="ronan.hale@example.com",
                phone="+1 212 555 0188",
                segment="Active",
            ),
            Customer(
                customer_code="CUS-DEMO-SARA",
                name="Sara Kim",
                company="Kim Supply",
                email="sara.kim@example.com",
                phone="+1 206 555 0133",
                segment="Wholesale",
            ),
            Customer(
                customer_code="CUS-DEMO-DEV",
                name="Dev Patel",
                company="Patel Goods",
                email="dev.patel@example.com",
                phone="+1 312 555 0164",
                segment="Active",
            ),
        ]
        db.add_all(customers)
        db.flush()

        product_by_sku = {product.sku: product for product in products}
        customer_by_email = {customer.email: customer for customer in customers}
        now = datetime.now(UTC)
        order_specs = [
            (
                "ORD-DEMO-1001",
                "maya.chen@example.com",
                "Online Store",
                "Shipped",
                8,
                [("LT-14-PRO", 2), ("MS-WL", 5)],
            ),
            (
                "ORD-DEMO-1002",
                "sara.kim@example.com",
                "Wholesale",
                "Packed",
                18,
                [("PH-X9", 6), ("DK-4K", 4), ("KB-MECH", 8)],
            ),
            (
                "ORD-DEMO-1003",
                "ronan.hale@example.com",
                "Retail Desk",
                "Pending",
                32,
                [("KB-MECH", 3), ("MS-WL", 4)],
            ),
            (
                "ORD-DEMO-1004",
                "dev.patel@example.com",
                "Online Store",
                "Delayed",
                45,
                [("PH-X9", 2), ("MS-WL", 2)],
            ),
            (
                "ORD-DEMO-1005",
                "maya.chen@example.com",
                "Online Store",
                "Completed",
                78,
                [("LT-14-PRO", 3), ("DK-4K", 2)],
            ),
            (
                "ORD-DEMO-1006",
                "sara.kim@example.com",
                "Wholesale",
                "Completed",
                126,
                [("PH-X9", 4), ("KB-MECH", 10), ("MS-WL", 10)],
            ),
        ]

        for order_number, email, channel, status, days_ago, items in order_specs:
            order = Order(
                order_number=order_number,
                customer_id=customer_by_email[email].id,
                channel=channel,
                status=status,
                ordered_at=now - timedelta(days=days_ago),
                total=Decimal("0.00"),
            )
            db.add(order)
            db.flush()

            total = Decimal("0.00")
            for sku, quantity in items:
                product = product_by_sku[sku]
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
                        note=f"Seeded sale for {order.order_number}",
                        created_by=admin_id,
                    )
                )
            order.total = total

        db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.create_db_tables:
        init_db()
        seed_initial_admin()
        seed_demo_data()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.app_debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (
    auth.router,
    products.router,
    customers.router,
    order.router,
    inventory.router,
    analytics.router,
    reports.router,
):
    app.include_router(router, prefix=settings.api_prefix)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": settings.app_name,
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health() -> dict[str, str]:
    with SessionLocal() as db:
        db.execute(text("SELECT 1"))
    return {"status": "healthy", "database": "connected"}
