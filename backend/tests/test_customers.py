def test_create_customer(client, admin_headers):
    response = client.post(
        "/api/customers",
        json={
            "name": "Jane Smith",
            "company": "Acme Corp",
            "email": "jane@example.com",
            "phone": "+123456789",
            "segment": "VIP",
        },
        headers=admin_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Jane Smith"
    assert data["email"] == "jane@example.com"
    assert data["company"] == "Acme Corp"

def test_get_customers(client, admin_headers):
    client.post(
        "/api/customers",
        json={
            "name": "Bob Jones",
            "company": "Beta Inc",
            "email": "bob@example.com",
            "phone": "+987654321",
            "segment": "Active",
        },
        headers=admin_headers,
    )
    response = client.get("/api/customers", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
