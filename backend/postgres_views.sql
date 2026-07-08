-- PostgreSQL View Setup Script
-- Run this script on your "sales_mis" PostgreSQL database in Navicat to create the views.

-- -------------------------------------------------------------
-- Clean Up Existing Views (Optional)
-- -------------------------------------------------------------
DROP VIEW IF EXISTS NumberClientOrdered CASCADE;
DROP VIEW IF EXISTS TotalSaleAmount CASCADE;
DROP VIEW IF EXISTS TotalAmountByOrderNo CASCADE;
DROP VIEW IF EXISTS v_low_stock_alerts CASCADE;
DROP VIEW IF EXISTS v_monthly_sales_summary CASCADE;
DROP VIEW IF EXISTS v_product_performance CASCADE;

-- -------------------------------------------------------------
-- 1. NumberClientOrdered
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW NumberClientOrdered AS
SELECT 
    c.id AS Client_no, 
    c.name AS ClientName, 
    c.phone, 
    COUNT(o.id) AS NumberOrder
FROM customers c
JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.name, c.phone;

-- -------------------------------------------------------------
-- 2. TotalSaleAmount
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW TotalSaleAmount AS
SELECT 
    o.id AS Order_No, 
    o.ordered_at AS Order_date, 
    o.customer_id AS Client_No, 
    c.name AS ClientName, 
    p.product_code AS Product_no, 
    p.name AS ProductName, 
    od.quantity AS Qty, 
    od.unit_price AS Price, 
    od.line_total AS Amount
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items od ON o.id = od.order_id
JOIN products p ON od.product_id = p.id;

-- -------------------------------------------------------------
-- 3. TotalAmountByOrderNo
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW TotalAmountByOrderNo AS
SELECT 
    o.id AS Order_No, 
    o.ordered_at AS Order_date, 
    o.customer_id AS Client_No, 
    c.name AS ClientName, 
    SUM(od.quantity * od.unit_price) AS Amount, 
    COUNT(od.product_id) AS "Item#"
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items od ON o.id = od.order_id
GROUP BY o.id, o.ordered_at, o.customer_id, c.name;

-- -------------------------------------------------------------
-- 4. v_low_stock_alerts
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW v_low_stock_alerts AS
SELECT 
    id, 
    product_code, 
    sku, 
    name, 
    stock, 
    reorder_level
FROM products
WHERE is_active = true AND stock <= reorder_level;

-- -------------------------------------------------------------
-- 5. v_monthly_sales_summary
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW v_monthly_sales_summary AS
SELECT 
    TO_CHAR(ordered_at, 'YYYY-MM') AS sales_month,
    COUNT(id) AS total_orders,
    SUM(total) AS total_revenue,
    AVG(total) AS average_order_value
FROM orders
WHERE status != 'Cancelled'
GROUP BY TO_CHAR(ordered_at, 'YYYY-MM');

-- -------------------------------------------------------------
-- 6. v_product_performance
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW v_product_performance AS
SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.sku,
    SUM(oi.quantity) AS units_sold,
    SUM(oi.line_total) AS total_revenue,
    DENSE_RANK() OVER (ORDER BY SUM(oi.quantity) DESC NULLS LAST) AS sales_rank
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.status != 'Cancelled'
GROUP BY p.id, p.name, p.sku;
