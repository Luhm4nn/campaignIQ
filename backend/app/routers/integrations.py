from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.db.dbsession import get_db
from app.schemas.integration import (
    IntegrationCredentialsUpdate,
    IntegrationRead,
    OAuthUrlResponse,
    SyncRequest,
    SyncResponse,
)
from app.services.integrations import (
    build_oauth_authorize_url,
    disconnect_integration,
    get_frontend_public_url,
    get_or_create_integration,
    handle_oauth_callback,
    list_integrations,
    save_integration_credentials,
    serialize_integration,
    sync_integration_posts,
    test_integration_connection,
    lookup_account_followers,
)

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.get("", response_model=List[IntegrationRead])
def get_integrations(db: Session = Depends(get_db)):
    return list_integrations(db)


@router.get("/{provider}", response_model=IntegrationRead)
def get_integration(provider: str, db: Session = Depends(get_db)):
    row = get_or_create_integration(db, provider)
    return serialize_integration(row)


@router.put("/{provider}/credentials", response_model=IntegrationRead)
def update_credentials(
    provider: str,
    payload: IntegrationCredentialsUpdate,
    db: Session = Depends(get_db),
):
    return save_integration_credentials(db, provider, payload)


@router.delete("/{provider}", response_model=IntegrationRead)
def remove_integration_connection(provider: str, db: Session = Depends(get_db)):
    return disconnect_integration(db, provider)


@router.get("/{provider}/oauth/authorize", response_model=OAuthUrlResponse)
def get_oauth_authorize(
    provider: str,
    db: Session = Depends(get_db),
):
    return build_oauth_authorize_url(db, provider)


@router.get("/{provider}/oauth/callback")
def oauth_callback(
    provider: str,
    code: str = Query(...),
    state: Optional[str] = Query(default=None),
    format: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    result = handle_oauth_callback(
        db,
        provider=provider,
        code=code,
        state=state,
    )
    if format == "json":
        return result
    redirect_target = (
        f"{get_frontend_public_url()}/settings?oauth={provider}&status=connected"
    )
    return RedirectResponse(url=redirect_target, status_code=302)


@router.post("/{provider}/test")
def test_connection(provider: str, db: Session = Depends(get_db)):
    return test_integration_connection(db, provider)


@router.post("/{provider}/sync", response_model=SyncResponse)
def sync_provider_posts(
    provider: str,
    payload: SyncRequest,
    db: Session = Depends(get_db),
):
    return sync_integration_posts(db, provider, payload)


@router.get('/{provider}/lookup-followers')
def lookup_followers(
    provider: str,
    username: str = Query(...),
    db: Session = Depends(get_db),
):
    return lookup_account_followers(db, provider, username)
