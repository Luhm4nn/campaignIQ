from fastapi.testclient import TestClient


def test_register_login_me_refresh_and_logout_lifecycle(client: TestClient):
    # 1. Registro de usuario Pro
    reg_res = client.post(
        "/auth/register",
        json={
            "name": "Diego Lezcano",
            "email": "diego@campaigniq.io",
            "username": "diegolezcano",
            "password": "Password123!",
            "company": "CampaignIQ Labs",
        },
    )
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert reg_data["user"]["email"] == "diego@campaigniq.io"
    assert reg_data["user"]["username"] == "diegolezcano"
    assert reg_data["user"]["plan"] == "pro"
    assert reg_data["accessToken"]
    assert reg_data["refreshToken"]

    first_refresh_token = reg_data["refreshToken"]

    # 2. Endpoint /auth/me autenticado
    me_res = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {reg_data['accessToken']}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "diego@campaigniq.io"
    assert me_res.json()["plan"] == "pro"

    # 3. Rotación de Refresh Token (KinesioCenter pattern)
    ref_res = client.post(
        "/auth/refresh",
        json={"refreshToken": first_refresh_token},
    )
    assert ref_res.status_code == 200
    ref_data = ref_res.json()
    second_refresh_token = ref_data["refreshToken"]
    assert second_refresh_token != first_refresh_token

    # El refresh token anterior queda revocado y no puede reutilizarse
    reuse_res = client.post(
        "/auth/refresh",
        json={"refreshToken": first_refresh_token},
    )
    assert reuse_res.status_code == 401

    # 4. Login por username y por email
    login_user_res = client.post(
        "/auth/login",
        json={"identifier": "diegolezcano", "password": "Password123!"},
    )
    assert login_user_res.status_code == 200
    assert login_user_res.json()["user"]["email"] == "diego@campaigniq.io"

    # 5. Logout revoca el refresh token actual
    logout_res = client.post(
        "/auth/logout",
        json={"refreshToken": second_refresh_token},
    )
    assert logout_res.status_code == 200
    assert client.post("/auth/refresh", json={"refreshToken": second_refresh_token}).status_code == 401


def test_account_lockout_after_failed_attempts(client: TestClient):
    client.post(
        "/auth/register",
        json={
            "name": "Test Lock",
            "email": "lock@campaigniq.io",
            "password": "CorrectPassword123",
            "company": "Test",
        },
    )

    # 5 intentos fallidos bloquean la cuenta (como en KinesioCenter)
    for attempt in range(5):
        res = client.post(
            "/auth/login",
            json={"identifier": "lock@campaigniq.io", "password": "WrongPassword"},
        )
        assert res.status_code == 401
        if attempt == 4:
            assert "locked" in res.json()["detail"].lower()

    # Incluso con la contraseña correcta sigue bloqueada durante la ventana de seguridad
    locked_res = client.post(
        "/auth/login",
        json={"identifier": "lock@campaigniq.io", "password": "CorrectPassword123"},
    )
    assert locked_res.status_code == 401
    assert "locked" in locked_res.json()["detail"].lower()
