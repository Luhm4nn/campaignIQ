from fastapi import FastAPI

app = FastAPI(title="Campaign IQ API")

@app.get("/health")
def health():
    return {"status": "ok"}