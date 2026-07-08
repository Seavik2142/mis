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
from app.models.employee import Employee
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


def seed_midterm_data() -> None:
    with SessionLocal() as db:
        # Check if already seeded (by checking if employee or customer exists)
        if db.scalar(select(Employee.id).limit(1)) or db.scalar(select(Customer.id).limit(1)):
            return

        # 1. Seed Employees
        employees = [
            Employee(id=1, name="Meas Dany", gender="F", birth_date="1993-03-02", job="Sale", address="#44, Street 125, PP", phone="015 666-999", salary=Decimal("580.00")),
            Employee(id=2, name="Chea Rithykun", gender="M", birth_date="1986-03-06", job="Admin", address="Daun Penh, Phnom Penh", phone="011 555-488", salary=Decimal("1200.00"), remarks="good"),
            Employee(id=3, name="Rin Dara", gender="M", birth_date="1999-02-23", job="Clerk", address="7 makara, Phnom Penh", phone="016 333-666", salary=Decimal("450.00"), remarks="good"),
            Employee(id=4, name="Keo sothea", gender="M", birth_date="1993-06-28", job="Sale", address="Chamkar Morn, Phnom Penh", phone="098 666-888", salary=Decimal("530.00"), remarks="good"),
            Employee(id=5, name="Meas Chenda", gender="F", birth_date="1991-03-29", job="Sale", address="#77, street 21, Takhmao Town, Kandal", phone="012 665-888", salary=Decimal("550.00")),
            Employee(id=6, name="CHAN ODAM", gender="M", birth_date="1992-08-21", job="Accounting", address="7 makara, Phnom Penh", phone="015 999-888", salary=Decimal("950.00"), remarks="good"),
            Employee(id=7, name="Keo Samneang", gender="M", birth_date="1989-06-26", job="Clerk", address="#28, street 210, Takhmao Town, Kandal", phone="096 666-5897", salary=Decimal("420.00"))
        ]
        db.add_all(employees)
        db.flush()

        # 2. Seed Clients (Customer table)
        clients = [
            Customer(id=1, customer_code="CUS-MID-1", name="General Customer", company="Normal", email="general@client.com", phone=None, segment="Normal", address=None, city=None, client_type="Normal", discount=0.0),
            Customer(id=2, customer_code="CUS-MID-2", name="Pich Samphors", company="Silver", email="pich.samphors@client.com", phone="012 456-897", segment="Silver", address="#88, Street 210", city="Phnom Penh", client_type="Silver", discount=0.05),
            Customer(id=3, customer_code="CUS-MID-3", name="Keo oudam", company="Gold", email="keo.oudam@client.com", phone="015 666-877", segment="Gold", address="#360, Street 330", city="Siem Reap", client_type="Gold", discount=0.1),
            Customer(id=4, customer_code="CUS-MID-4", name="Meas Rithy", company="Silver", email="meas.rithy@client.com", phone="016 666-555", segment="Silver", address="#54, Sreet 135", city="Sihanouk", client_type="Silver", discount=0.05),
            Customer(id=5, customer_code="CUS-MID-5", name="Pich Dara", company="Silver", email="pich.dara@client.com", phone="012 333-666", segment="Silver", address="#456, Sreet 131", city="Siem Reap", client_type="Silver", discount=0.05),
            Customer(id=6, customer_code="CUS-MID-6", name="Pen Socheat", company="Gold", email="pen.socheat@client.com", phone="011 564-888", segment="Gold", address="#122, Street 235", city="Phnom Penh", client_type="Gold", discount=0.1),
            Customer(id=7, customer_code="CUS-MID-7", name="RITHY", company="Silver", email="rithy@client.com", phone="015 655-777", segment="Silver", address="#254, Street 121", city="Kandal", client_type="Silver", discount=0.05),
            Customer(id=8, customer_code="CUS-MID-8", name="Lucky Shop", company="Silver", email="lucky.shop@client.com", phone="098 666-547", segment="Silver", address="#24, Street 210", city="Kandal", client_type="Silver", discount=0.05),
            Customer(id=9, customer_code="CUS-MID-9", name="Amrong Tuy", company="Gold", email="amrong.tuy@client.com", phone="017 999-733", segment="Gold", address="#212, Street 45", city="Phnom Penh", client_type="Gold", discount=0.1)
        ]
        db.add_all(clients)
        db.flush()

        # 3. Seed Products
        products = [
            Product(id=1, product_code="P001", sku="P001", name="USB 32GB", category="Accessory", price=Decimal("12.00"), stock=120, reorder_level=20, product_type="Accessory", unit_measure="Piece", cost_price=Decimal("8.00")),
            Product(id=2, product_code="P002", sku="P002", name="Dell Monitors", category="Monitor", price=Decimal("90.00"), stock=35, reorder_level=3, product_type="Monitor", unit_measure="Piece", cost_price=Decimal("85.00")),
            Product(id=3, product_code="P003", sku="P003", name="Rapoo Mouse", category="Accessory", price=Decimal("20.00"), stock=55, reorder_level=5, product_type="Accessory", unit_measure="Piece", cost_price=Decimal("15.00")),
            Product(id=4, product_code="P004", sku="P004", name="USB 64GB", category="Accessory", price=Decimal("18.00"), stock=105, reorder_level=20, product_type="Accessory", unit_measure="Piece", cost_price=Decimal("16.00")),
            Product(id=5, product_code="P005", sku="P005", name="Dell Keyboard", category="Accessory", price=Decimal("6.00"), stock=77, reorder_level=3, product_type="Accessory", unit_measure="Piece", cost_price=Decimal("4.00")),
            Product(id=6, product_code="P006", sku="P006", name="HP Monitor", category="Monitor", price=Decimal("15.00"), stock=15, reorder_level=3, product_type="Monitor", unit_measure="Piece", cost_price=Decimal("12.00")),
            Product(id=7, product_code="P007", sku="P007", name="HDD 1TB", category="Accessory", price=Decimal("100.00"), stock=22, reorder_level=3, product_type="Accessory", unit_measure="Piece", cost_price=Decimal("95.00")),
            Product(id=8, product_code="P008", sku="P008", name="CPU", category="Accessory", price=Decimal("280.00"), stock=10, reorder_level=3, product_type="Accessory", unit_measure="Piece", cost_price=Decimal("253.50")),
            Product(id=9, product_code="P009", sku="P009", name="RAM", category="Accessory", price=Decimal("0.00"), stock=25, reorder_level=3, product_type="Accessory", unit_measure="Piece", cost_price=Decimal("30.00")),
            Product(id=10, product_code="P010", sku="P010", name="HDD 2TB", category="Accessory", price=Decimal("70.00"), stock=30, reorder_level=5, product_type="Accessory", unit_measure="Piece", cost_price=Decimal("60.00"))
        ]
        db.add_all(products)
        db.flush()

        # 4. Seed Orders and Order Details
        orders_spec = [
            (1, "2022-01-05", 6, 1, "F", "2022-01-08", "Fulfilled", [("P001", 20, 12.0), ("P002", 10, 95.0), ("P007", 5, 65.0)]),
            (2, "2022-05-05", 1, 2, "P", "2022-07-06", "Cancelled", [("P001", 15, 12.0), ("P003", 30, 18.0), ("P004", 50, 18.0), ("P005", 45, 9.0)]),
            (3, "2023-01-05", 6, 1, "F", "2012-07-08", "Fulfilled", [("P002", 2, 95.0), ("P003", 5, 18.0), ("P004", 10, 18.0), ("P010", 3, 75.0)]),
            (4, "2023-01-06", 5, 4, "F", "2012-05-10", "In Process", [("P001", 15, 12.0), ("P003", 8, 18.0), ("P004", 30, 18.0)]),
            (5, "2023-06-06", 1, 3, "F", "2012-06-07", "Fulfilled", [("P002", 5, 95.0), ("P005", 10, 9.0), ("P007", 5, 65.0)]),
            (6, "2024-06-06", 6, 2, "P", "2012-06-09", "Cancelled", [("P002", 2, 95.0), ("P005", 2, 9.0)]),
            (7, "2024-01-06", 2, 1, "P", "2012-06-09", "Cancelled", [("P007", 1, 65.0), ("P010", 1, 75.0)]),
            (8, "2024-06-10", 6, 1, "F", "2012-06-13", "Fulfilled", [("P003", 10, 15.0), ("P005", 10, 9.0)]),
            (9, "2025-06-10", 2, 4, "F", "2012-07-13", "Fulfilled", [("P001", 10, 12.0), ("P004", 15, 18.0), ("P005", 10, 9.0)])
        ]

        product_map = {p.product_code: p for p in products}

        for order_no, order_date_str, client_no, employee_id, del_type, del_date, status, items in orders_spec:
            order_date = datetime.strptime(order_date_str, "%Y-%m-%d")
            order = Order(
                id=order_no,
                order_number=f"ORD-MID-{order_no:04d}",
                customer_id=client_no,
                employee_id=employee_id,
                delivery_type=del_type,
                delivery_date=del_date,
                status=status,
                ordered_at=order_date,
                channel="Retail Desk" if del_type == "P" else "Online Store",
                total=Decimal("0.00")
            )
            db.add(order)
            db.flush()

            total_amount = Decimal("0.00")
            for prod_code, qty, price in items:
                p = product_map[prod_code]
                line_total = Decimal(qty) * Decimal(price)
                total_amount += line_total
                
                db.add(OrderItem(
                    order_id=order.id,
                    product_id=p.id,
                    quantity=qty,
                    unit_price=Decimal(price),
                    line_total=line_total
                ))
            order.total = total_amount
        db.commit()


def create_views() -> None:
    with SessionLocal() as db:
        is_sqlite = db.bind.dialect.name == "sqlite"
        if is_sqlite:
            views = [
                """
                CREATE VIEW IF NOT EXISTS NumberClientOrdered AS
                SELECT c.id as Client_no, c.name as ClientName, c.phone, COUNT(o.id) as NumberOrder
                FROM customers c
                JOIN orders o ON c.id = o.customer_id
                GROUP BY c.id, c.name, c.phone;
                """,
                """
                CREATE VIEW IF NOT EXISTS TotalSaleAmount AS
                SELECT o.id as Order_No, o.ordered_at as Order_date, o.customer_id as Client_No, c.name as ClientName, p.product_code as Product_no, p.name as ProductName, od.quantity as Qty, od.unit_price as Price, od.line_total as Amount
                FROM orders o
                JOIN customers c ON o.customer_id = c.id
                JOIN order_items od ON o.id = od.order_id
                JOIN products p ON od.product_id = p.id;
                """,
                """
                CREATE VIEW IF NOT EXISTS TotalAmountByOrderNo AS
                SELECT o.id as Order_No, o.ordered_at as Order_date, o.customer_id as Client_No, c.name as ClientName, SUM(od.quantity * od.unit_price) as Amount, COUNT(od.product_id) as [Item#]
                FROM orders o
                JOIN customers c ON o.customer_id = c.id
                JOIN order_items od ON o.id = od.order_id
                GROUP BY o.id, o.ordered_at, o.customer_id, c.name;
                """
            ]
        else:
            views = [
                """
                CREATE OR REPLACE VIEW NumberClientOrdered AS
                SELECT c.id as Client_no, c.name as ClientName, c.phone, COUNT(o.id) as NumberOrder
                FROM customers c
                JOIN orders o ON c.id = o.customer_id
                GROUP BY c.id, c.name, c.phone;
                """,
                """
                CREATE OR REPLACE VIEW TotalSaleAmount AS
                SELECT o.id as Order_No, o.ordered_at as Order_date, o.customer_id as Client_No, c.name as ClientName, p.product_code as Product_no, p.name as ProductName, od.quantity as Qty, od.unit_price as Price, od.line_total as Amount
                FROM orders o
                JOIN customers c ON o.customer_id = c.id
                JOIN order_items od ON o.id = od.order_id
                JOIN products p ON od.product_id = p.id;
                """,
                """
                CREATE OR REPLACE VIEW TotalAmountByOrderNo AS
                SELECT o.id as Order_No, o.ordered_at as Order_date, o.customer_id as Client_No, c.name as ClientName, SUM(od.quantity * od.unit_price) as Amount, COUNT(od.product_id) as "Item#"
                FROM orders o
                JOIN customers c ON o.customer_id = c.id
                JOIN order_items od ON o.id = od.order_id
                GROUP BY o.id, o.ordered_at, o.customer_id, c.name;
                """
            ]
        for view_sql in views:
            try:
                db.execute(text(view_sql))
            except Exception as e:
                print(f"Error creating view: {e}")
        db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    if settings.create_db_tables:
        init_db()
        seed_initial_admin()
        seed_demo_data()
        seed_midterm_data()
        create_views()
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
