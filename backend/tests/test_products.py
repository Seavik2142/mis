def test_create_product(client, admin_headers):
    response = client.post(
        "/api/products",
        json={
            "sku": "PROD-101",
            "name": "Test Laptop",
            "category": "Computers",
            "price": 999.99,
            "stock": 10,
            "reorder_level": 2,
        },
        headers=admin_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["sku"] == "PROD-101"
    assert data["name"] == "Test Laptop"
    assert data["stock"] == 10

def test_get_products(client, admin_headers):
    client.post(
        "/api/products",
        json={
            "sku": "PROD-102",
            "name": "Test Phone",
            "category": "Mobile",
            "price": 499.99,
            "stock": 5,
            "reorder_level": 1,
        },
        headers=admin_headers,
    )
    response = client.get("/api/products", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
