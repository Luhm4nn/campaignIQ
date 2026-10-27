import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError

import app.main as main_module
from app.db.dbsession import validate_database_url
from app.services.analytics import (
    analyze_text_sentiment,
    calculate_post_metrics,
    compute_percentile_tiers,
)


def test_postgresql_database_url_enforcement():
    with pytest.raises(RuntimeError):
        validate_database_url(None)

    with pytest.raises(RuntimeError):
        validate_database_url("")

    with pytest.raises(RuntimeError):
        validate_database_url("sqlite:///./campaign_iq.db")

    with pytest.raises(RuntimeError):
        validate_database_url("mysql://user:pass@localhost:3306/db")

    valid_url = validate_database_url(
        "postgresql://campaign_iq:campaign_iq@localhost:5432/campaign_iq"
    )
    assert (
        valid_url
        == "postgresql+psycopg2://campaign_iq:campaign_iq@localhost:5432/campaign_iq"
    )

    normalized_url = validate_database_url(
        "postgres://campaign_iq:campaign_iq@localhost:5432/campaign_iq"
    )
    assert (
        normalized_url
        == "postgresql+psycopg2://campaign_iq:campaign_iq@localhost:5432/campaign_iq"
    )


def test_analytics_engine_vader_and_metrics():
    pos_compound, pos_label = analyze_text_sentiment(
        "Excelente lanzamiento con increible crecimiento y calidad"
    )
    assert pos_label == "positivo"
    assert pos_compound >= 0.05

    neg_compound, neg_label = analyze_text_sentiment(
        "Terrible error, mal servicio y caída constante del sistema"
    )
    assert neg_label == "negativo"
    assert neg_compound <= -0.05

    neu_compound, neu_label = analyze_text_sentiment("")
    assert neu_label == "neutro"
    assert neu_compound == 0.0

    metrics = calculate_post_metrics(
        content="Excelente campaña de innovación",
        likes=500,
        comments=50,
        shares=50,
        reach=6000,
        impressions=9000,
    )
    assert metrics["engagement_rate"] == 10.0
    assert metrics["sentiment_label"] == "positivo"
    assert int(metrics["engagement_score"]) > 50


def test_health_and_empty_dashboard(client: TestClient):
    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert health_res.json() == {"status": "ok", "database": "postgresql"}

    dash_res = client.get("/dashboard")
    assert dash_res.status_code == 200
    body = dash_res.json()
    assert body["stats"]["totalCampaigns"] == 0
    assert body["stats"]["totalPosts"] == 0
    assert body["campaigns"] == []
    assert body["posts"] == []
    assert len(body["hourlyInteractions"]) == 24


def test_campaigns_posts_insights_and_export_lifecycle(client: TestClient):
    camp_res = client.post(
        "/campaigns",
        json={
            "name": "Campaña Primavera",
            "description": "Lanzamiento de producto",
            "platform": "instagram",
            "campaignType": "Conversion",
            "status": "active",
            "startDate": "2026-04-01",
            "budget": 2000.0,
            "followersStart": 1000,
            "followersEnd": 1200,
        },
    )
    assert camp_res.status_code == 201
    campaign = camp_res.json()
    campaign_id = campaign["id"]
    assert campaign["name"] == "Campaña Primavera"
    assert campaign["postsCount"] == 0
    assert campaign["growth"] == 20.0

    post_res = client.post(
        "/posts",
        json={
            "campaignId": campaign_id,
            "content": "Excelente lanzamiento con increible recepcion y exito",
            "mediaType": "video",
            "publishedAt": "2026-04-02T19:00:00",
            "likes": 500,
            "comments": 50,
            "shares": 50,
            "reach": 6000,
            "impressions": 9000,
        },
    )
    assert post_res.status_code == 201
    post = post_res.json()
    post_id = post["id"]
    assert post["campaignId"] == campaign_id
    assert post["engagementRate"] == 10.0
    assert post["sentimentLabel"] == "positivo"

    detail_res = client.get(f"/campaigns/{campaign_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["campaign"]["postsCount"] == 1
    assert detail["campaign"]["likes"] == 500
    assert detail["campaign"]["engagementRate"] == 10.0
    assert len(detail["insights"]) >= 1
    hour_19 = next(h for h in detail["hourlyInteractions"] if h["hour"] == 19)
    assert hour_19["interactions"] == 600

    patch_post_res = client.patch(
        f"/posts/{post_id}",
        json={"likes": 1100},
    )
    assert patch_post_res.status_code == 200
    assert patch_post_res.json()["engagementRate"] == 20.0

    patch_camp_res = client.patch(
        f"/campaigns/{campaign_id}",
        json={"status": "completed"},
    )
    assert patch_camp_res.status_code == 200
    assert patch_camp_res.json()["status"] == "completed"

    csv_res = client.get(f"/export/campaign/{campaign_id}/csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Campaña Primavera" in csv_res.text

    del_res = client.delete(f"/campaigns/{campaign_id}")
    assert del_res.status_code == 200
    assert del_res.json() == {"ok": True}

    not_found_res = client.get(f"/campaigns/{campaign_id}")
    assert not_found_res.status_code == 404
    posts_after_delete = client.get("/posts").json()
    assert posts_after_delete == []


def test_users_endpoints(client: TestClient):
    user_res = client.post(
        "/users",
        json={
            "name": "Emiliano Luhmann",
            "email": "emiliano@campaigniq.com",
            "company": "CampaignIQ",
        },
    )
    assert user_res.status_code == 200
    user = user_res.json()
    assert user["email"] == "emiliano@campaigniq.com"

    list_res = client.get("/users")
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1


def test_verify_postgresql_connection_fails_when_server_unreachable(
    monkeypatch: pytest.MonkeyPatch,
):
    from sqlalchemy import create_engine

    unreachable_engine = create_engine(
        "postgresql+psycopg2://campaign_iq:campaign_iq@127.0.0.1:59999/campaign_iq",
        connect_args={"connect_timeout": 1},
    )
    monkeypatch.setattr(main_module, "engine", unreachable_engine)
    with pytest.raises(OperationalError):
        main_module.verify_postgresql_connection()


def test_integrations_vault_oauth_and_external_id_sync(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
):
    list_res = client.get("/integrations")
    assert list_res.status_code == 200
    items = list_res.json()
    assert any(i["provider"] == "meta_graph" for i in items)

    # Without an Access Token, sync must fail explicitly (no simulated data fallback)
    no_token_sync = client.post("/integrations/meta_graph/sync", json={})
    assert no_token_sync.status_code == 400

    class MockMetaResponse:
        def __init__(self, status_code: int, payload: dict):
            self.status_code = status_code
            self._payload = payload
            self.text = str(payload)

        def json(self):
            return self._payload

    def fake_requests_get(url: str, params: dict = None, timeout: int = 10):
        if "/oauth/access_token" in url:
            return MockMetaResponse(200, {"access_token": "EAALiveMetaToken998877"})
        if "/me/accounts" in url:
            return MockMetaResponse(
                200,
                {
                    "data": [
                        {
                            "id": "10203040",
                            "name": "CampaignIQ Page",
                            "instagram_business_account": {
                                "id": "17841400001",
                                "username": "campaigniq_latam",
                                "followers_count": 4850,
                            },
                        }
                    ]
                },
            )
        if "/17841400001/media" in url:
            return MockMetaResponse(
                200,
                {
                    "data": [
                        {
                            "id": "1800112233",
                            "caption": "Excelente lanzamiento real desde Meta Graph API",
                            "media_type": "VIDEO",
                            "permalink": "https://www.instagram.com/p/RealPost1/",
                            "timestamp": "2026-10-25T19:00:00+0000",
                            "like_count": 320,
                            "comments_count": 45,
                        },
                        {
                            "id": "1800112234",
                            "caption": "Nuevo carrusel de producto con gran crecimiento",
                            "media_type": "CAROUSEL_ALBUM",
                            "permalink": "https://www.instagram.com/p/RealPost2/",
                            "timestamp": "2026-10-26T20:00:00+0000",
                            "like_count": 210,
                            "comments_count": 18,
                        },
                    ]
                },
            )
        if "/insights" in url:
            return MockMetaResponse(
                200,
                {
                    "data": [
                        {"name": "reach", "values": [{"value": 4200}]},
                        {"name": "impressions", "values": [{"value": 5800}]},
                        {"name": "shares", "values": [{"value": 29}]},
                    ]
                },
            )
        return MockMetaResponse(404, {"error": {"message": "Not found"}})

    monkeypatch.setattr("app.services.integrations.requests.get", fake_requests_get)

    cred_res = client.put(
        "/integrations/meta_graph/credentials",
        json={
            "clientId": "123456789098765",
            "clientSecret": "super_secret_meta_key_9988",
        },
    )
    assert cred_res.status_code == 200
    saved = cred_res.json()
    assert saved["hasClientId"] is True
    assert saved["hasClientSecret"] is True
    assert saved["clientIdMasked"] == "••••••••8765"
    assert saved["clientSecretMasked"] == "••••••••9988"
    assert "super_secret_meta_key_9988" not in str(saved)
    assert len(saved["clientIdHash"]) == 64

    auth_res = client.get("/integrations/meta_graph/oauth/authorize")
    assert auth_res.status_code == 200
    auth_body = auth_res.json()
    assert auth_body["provider"] == "meta_graph"
    assert "facebook.com/v21.0/dialog/oauth" in auth_body["authUrl"]

    cb_res = client.get(
        f"/integrations/meta_graph/oauth/callback?code=live_meta_code&state={auth_body['state']}&format=json"
    )
    assert cb_res.status_code == 200
    cb_body = cb_res.json()
    assert cb_body["status"] == "connected"
    assert cb_body["hasAccessToken"] is True
    assert cb_body["externalAccountId"] == "17841400001"
    assert cb_body["externalAccountName"] == "@campaigniq_latam"

    sync1 = client.post("/integrations/meta_graph/sync", json={})
    assert sync1.status_code == 200
    s1_body = sync1.json()
    assert s1_body["sourceMode"] == "live_meta_graph_api"
    assert s1_body["importedPosts"] == 2
    assert s1_body["updatedPosts"] == 0

    # Second sync updates existing posts by external_id instead of duplicating
    sync2 = client.post(
        "/integrations/meta_graph/sync",
        json={"campaignId": s1_body["campaignId"]},
    )
    assert sync2.status_code == 200
    s2_body = sync2.json()
    assert s2_body["importedPosts"] == 0
    assert s2_body["updatedPosts"] == 2

    # Test RapidAPI / Deep Scraper for Instagram, TikTok, and Twitter
    def fake_scraper_get(url: str, headers: dict = None, params: dict = None, timeout: int = 10):
        if "instagram-scraper-api2" in url:
            return MockMetaResponse(
                200,
                {
                    "data": {
                        "follower_count": 95000,
                        "items": [
                            {
                                "id": "998811",
                                "code": "IGDeepCode1",
                                "caption": {"text": "Excelente campaña en Instagram con gran éxito"},
                                "like_count": 1400,
                                "comment_count": 95,
                                "reshare_count": 40,
                                "play_count": 18500,
                                "media_type": 2,
                                "taken_at": 1761500000,
                            }
                        ],
                    }
                },
            )
        if "tiktok-scraper7" in url or "tikwm.com" in url:
            return MockMetaResponse(
                200,
                {
                    "data": {
                        "videos": [
                            {
                                "video_id": "742991100",
                                "title": "Increíble lanzamiento viral en TikTok",
                                "digg_count": 8500,
                                "comment_count": 420,
                                "share_count": 610,
                                "collect_count": 290,
                                "play_count": 112000,
                                "create_time": 1761503600,
                            }
                        ]
                    }
                },
            )
        return MockMetaResponse(404, {})

    monkeypatch.setattr("app.services.integrations.requests.get", fake_scraper_get)

    ig_save = client.put(
        "/integrations/instagram/credentials",
        json={
            "accessToken": "rapidapi_secret_key_2026",
            "externalAccountName": "@nike",
        },
    )
    assert ig_save.status_code == 200
    assert ig_save.json()["externalAccountName"] == "@nike"

    ig_sync = client.post("/integrations/instagram/sync", json={})
    assert ig_sync.status_code == 200
    assert ig_sync.json()["importedPosts"] == 1

    tt_save = client.put(
        "/integrations/tiktok/credentials",
        json={"externalAccountName": "@tiktok"},
    )
    assert tt_save.status_code == 200
    tt_sync = client.post("/integrations/tiktok/sync", json={})
    assert tt_sync.status_code == 200
    assert tt_sync.json()["importedPosts"] == 1




