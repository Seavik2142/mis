import psycopg
import sys

def inspect():
    print("--- PostgreSQL Database Inspector ---")
    db_name = "sales_mis"
    user = "postgres"
    
    # Prompt for password
    password = input(f"Enter password for PostgreSQL user '{user}' (press Enter if none): ")
    
    try:
        conn = psycopg.connect(
            host="localhost",
            port=5432,
            dbname=db_name,
            user=user,
            password=password
        )
        print("\n[+] Successfully connected to the database!")
    except Exception as e:
        print(f"\n[-] Failed to connect: {e}")
        sys.exit(1)
        
    try:
        cur = conn.cursor()
        
        # Check if table customers exists
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'customers'
            );
        """)
        exists = cur.fetchone()[0]
        
        if not exists:
            print("[-] Table 'customers' does not exist in the database.")
            print("    Please run postgres_schema.sql first to create the tables.")
            conn.close()
            return
            
        print("\n[+] Table 'customers' exists. Columns:")
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'customers'
            ORDER BY ordinal_position;
        """)
        columns = cur.fetchall()
        for col, dtype in columns:
            print(f"    - {col} ({dtype})")
            
        has_name = any(col[0] == 'name' for col in columns)
        if not has_name:
            print("\n[-] Column 'name' is indeed missing from table 'customers'!")
            print("    Would you like to automatically rename/add the column? (y/n)")
            choice = input().strip().lower()
            if choice == 'y':
                # Check for common names like 'customer_name'
                cname_col = next((col[0] for col in columns if 'name' in col[0]), None)
                if cname_col:
                    print(f"    Renaming existing column '{cname_col}' to 'name'...")
                    cur.execute(f"ALTER TABLE customers RENAME COLUMN {cname_col} TO name;")
                    conn.commit()
                    print("    [+] Column renamed successfully!")
                else:
                    print("    Adding new column 'name'...")
                    cur.execute("ALTER TABLE customers ADD COLUMN name VARCHAR(120);")
                    conn.commit()
                    print("    [+] Column 'name' added successfully!")
                    
    except Exception as e:
        print(f"[-] Error during inspection: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    inspect()
