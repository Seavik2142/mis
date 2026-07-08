-- PostgreSQL Table Schema Setup Script
-- Run this script on your "sales_mis" PostgreSQL database in Navicat to create tables matching the application models.

-- WARNING: Running this will DROP the existing tables and clear any data in them.
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- -------------------------------------------------------------
-- 1. users
-- -------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 2. products
-- -------------------------------------------------------------
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    product_code VARCHAR(30) NOT NULL UNIQUE,
    sku VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    price NUMERIC(12, 2) NOT NULL,
    stock INTEGER DEFAULT 0 NOT NULL,
    reorder_level INTEGER DEFAULT 15 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    product_type VARCHAR(100) DEFAULT 'Accessory',
    unit_measure VARCHAR(40) DEFAULT 'Piece',
    cost_price NUMERIC(12, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 3. customers
-- -------------------------------------------------------------
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    customer_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    company VARCHAR(160),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(40),
    segment VARCHAR(40) DEFAULT 'Active',
    address VARCHAR(255),
    city VARCHAR(100),
    client_type VARCHAR(40) DEFAULT 'Normal',
    discount NUMERIC(5, 2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 4. employees
-- -------------------------------------------------------------
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    gender VARCHAR(10),
    birth_date VARCHAR(30),
    job VARCHAR(100),
    address VARCHAR(255),
    phone VARCHAR(40),
    salary NUMERIC(12, 2) DEFAULT 0.0,
    remarks VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 5. orders
-- -------------------------------------------------------------
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(40) NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    channel VARCHAR(60) DEFAULT 'Online Store',
    status VARCHAR(30) DEFAULT 'Pending',
    ordered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    total NUMERIC(14, 2) DEFAULT 0,
    employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    delivery_type VARCHAR(20) DEFAULT 'F',
    delivery_date VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- 6. order_items
-- -------------------------------------------------------------
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    line_total NUMERIC(14, 2) NOT NULL
);

-- -------------------------------------------------------------
-- 7. inventory_movements
-- -------------------------------------------------------------
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(30) NOT NULL,
    quantity INTEGER NOT NULL,
    note VARCHAR(255),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
