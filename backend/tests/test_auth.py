def test_register_user(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpassword",
            "full_name": "Test User",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_login_user(client):
    # Register user
    client.post(
        "/api/auth/register",
        json={
            "email": "test2@example.com",
            "password": "testpassword",
            "full_name": "Test User 2",
        },
    )
    # Login user
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test2@example.com",
            "password": "testpassword",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test2@example.com"

def test_get_me(client):
    # Register user
    client.post(
        "/api/auth/register",
        json={
            "email": "test3@example.com",
            "password": "testpassword",
            "full_name": "Test User 3",
        },
    )
    # Login to get token
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "test3@example.com",
            "password": "testpassword",
        },
    )
    token = login_response.json()["access_token"]
    
    # Get user profile
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test3@example.com"
