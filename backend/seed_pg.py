import sys
import os

# Add the current directory to python path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.core.config import settings
from app.database.db import init_db
from app.main import seed_initial_admin, seed_demo_data, seed_midterm_data

def run_seed():
    print(f"Connecting to database: {settings.database_url}")
    print("Initializing database tables...")
    init_db()
    print("Seeding initial admin account...")
    seed_initial_admin()
    print("Seeding demo data (products, customers, orders)...")
    seed_demo_data()
    print("Seeding midterm exam data (employees, clients, products, orders)...")
    seed_midterm_data()
    print("[+] Database tables and data successfully seeded!")

if __name__ == "__main__":
    run_seed()
