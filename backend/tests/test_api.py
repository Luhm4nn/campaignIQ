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

