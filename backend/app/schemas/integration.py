from typing import Optional
from pydantic import BaseModel


class IntegrationCredentialsUpdate(BaseModel):
    clientId: Optional[str] = None
    clientSecret: Optional[str] = None
    accessToken: Optional[str] = None
    externalAccountId: Optional[str] = None
    externalAccountName: Optional[str] = None


class IntegrationRead(BaseModel):
    id: int
    provider: str
    displayName: str
    hasClientId: bool
    hasClientSecret: bool
    hasAccessToken: bool
    clientIdMasked: str
    clientSecretMasked: str
    accessTokenMasked: str
    clientIdHash: str
    externalAccountId: str
    externalAccountName: str
    status: str
    lastSyncAt: Optional[str] = None
    oauthCallbackUrl: str


class OAuthUrlResponse(BaseModel):
    provider: str
    authUrl: str
    mode: str
    state: str


class SyncRequest(BaseModel):
    campaignId: Optional[int] = None
    campaignName: Optional[str] = None
    platform: Optional[str] = "instagram"


class SyncResponse(BaseModel):
    provider: str
    campaignId: int
    campaignName: str
    importedPosts: int
    updatedPosts: int
    sourceMode: str
    message: str
