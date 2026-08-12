from fastapi import FastAPI
from app.routers import users as users_router
from app.routers import export as export_router
from app.routers import export_db as export_db_router

app = FastAPI(title="Campaign IQ API")


@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(users_router.router)
app.include_router(export_router.router)
app.include_router(export_db_router.router)