import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.dbsession import Base, engine, get_db
import app.models.users
import app.models.campaigns
import app.models.integrations
from app.routers import users as users_router
from app.routers import campaigns as campaigns_router
from app.routers import posts as posts_router
from app.routers import insights as insights_router
from app.routers import dashboard as dashboard_router
from app.routers import export as export_router
from app.routers import integrations as integrations_router


def verify_postgresql_connection() -> None:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        connection.execute(
            text("ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS external_id VARCHAR")
        )
        connection.execute(
            text("ALTER TABLE posts ADD COLUMN IF NOT EXISTS external_id VARCHAR")
        )
        connection.execute(
            text("ALTER TABLE posts ADD COLUMN IF NOT EXISTS permalink VARCHAR")
        )



@asynccontextmanager
async def lifespan(app: FastAPI):
    verify_postgresql_connection()
    yield


app = FastAPI(title="CampaignIQ API", lifespan=lifespan)

raw_origins = os.getenv("CORS_ORIGINS", "*")
allowed_origins = (
    [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
    if raw_origins != "*"
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "postgresql"}


app.include_router(dashboard_router.router)
app.include_router(campaigns_router.router)
app.include_router(posts_router.router)
app.include_router(insights_router.router)
app.include_router(users_router.router)
app.include_router(export_router.router)
app.include_router(integrations_router.router)

