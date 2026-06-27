# Sales MIS Backend

FastAPI backend backed by PostgreSQL. Navicat is supported as a database
management client; the application itself connects directly through SQLAlchemy
and psycopg.

## Quick start with Docker

From the project root:

```bash
docker compose up --build
```

Open:

- API documentation: <http://localhost:8000/docs>
- Health check: <http://localhost:8000/health>
- Frontend API base URL: `http://localhost:8000/api`

The first startup creates the tables and this administrator:

```text
Email: admin@salesmis.com
Password: change-this-password
```

Change the password and `JWT_SECRET_KEY` before deploying.

## Run locally

Start PostgreSQL first, then:

```bash
cd backend
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Navicat connection

Create a new **PostgreSQL** connection:

| Setting | Value |
| --- | --- |
| Host | `localhost` |
| Port | `5433` |
| Database | `salesmis` |
| User name | `salesmis` |
| Password | `salesmis` |

When Docker Compose is used, the database and user are created automatically.
The container uses PostgreSQL port `5432` internally and exposes it as `5433`
on the Mac to avoid conflicts with an existing local PostgreSQL installation.
For an existing local PostgreSQL server, run `navicat_setup.sql` from Navicat
as an administrator, then start FastAPI to create the tables.

## Main endpoints

- `POST /api/auth/login`
- `GET|POST /api/products`
- `GET|POST /api/customers`
- `GET|POST /api/orders`
- `POST /api/inventory/{product_id}/adjust`
- `GET /api/analytics/dashboard`
- `GET /api/reports/sales`

Write endpoints require an `Authorization: Bearer <token>` header. Obtain the
token from `/api/auth/login`. Product stock is changed through order creation,
order cancellation, or the inventory adjustment endpoint so every change has
an audit record in `inventory_movements`.
