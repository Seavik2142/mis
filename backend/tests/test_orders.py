def test_create_order(client, admin_headers):
    # 1. Create a product
    product_resp = client.post(
        "/api/products",
        json={
            "sku": "ORD-P-1",
            "name": "Order Test Product",
            "category": "Electronics",
            "price": 100.00,
            "stock": 50,
            "reorder_level": 5,
        },
        headers=admin_headers,
    )
    assert product_resp.status_code == 201
    product_id = product_resp.json()["id"]

    # 2. Create a customer
    customer_resp = client.post(
        "/api/customers",
        json={
            "name": "Alice Green",
            "company": "Green Retail",
            "email": "alice@example.com",
            "phone": "+12345",
            "segment": "VIP",
        },
        headers=admin_headers,
    )
    assert customer_resp.status_code == 201
    customer_id = customer_resp.json()["id"]

    # 3. Create the order
    order_resp = client.post(
        "/api/orders",
        json={
            "customer_id": customer_id,
            "channel": "Online Store",
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 2,
                }
            ],
        },
        headers=admin_headers,
    )
    assert order_resp.status_code == 201
    order_data = order_resp.json()
    assert order_data["status"] == "Pending"
    assert order_data["total"] == 200.00  # 2 * 100.00
    
    # 4. Check that product stock decreased from 50 to 48
    prod_get = client.get("/api/products", headers=admin_headers)
    assert prod_get.status_code == 200
    products_list = prod_get.json()
    test_prod = [p for p in products_list if p["id"] == product_id][0]
    assert test_prod["stock"] == 48
