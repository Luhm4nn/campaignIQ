from fastapi import FastAPI
from app.routers import users as users_router

app = FastAPI(title="Campaign IQ API")

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(users_router.router)