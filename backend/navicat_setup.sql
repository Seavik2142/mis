-- Run the role block while connected to the default "postgres" database
-- as a PostgreSQL administrator.
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'salesmis') THEN
        CREATE ROLE salesmis LOGIN PASSWORD 'salesmis';
    END IF;
END
$$;

-- Navicat does not run CREATE DATABASE inside a transaction. Run this
-- statement separately if the "salesmis" database does not exist yet.
CREATE DATABASE salesmis OWNER salesmis ENCODING 'UTF8';

-- FastAPI creates the application tables on its first startup when
-- CREATE_DB_TABLES=true. Refresh the database tree in Navicat afterward.
