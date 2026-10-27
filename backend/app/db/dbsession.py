import os
from pathlib import Path
from typing import Generator
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session

_backend_env = Path(__file__).resolve().parents[2] / ".env"
_root_env = Path(__file__).resolve().parents[3] / ".env"

if _backend_env.exists():
    load_dotenv(_backend_env)
if _root_env.exists():
    load_dotenv(_root_env)


def validate_database_url(url: str | None) -> str:
    if not url or not url.strip():
        raise RuntimeError(
            "DATABASE_URL no está configurada. Debes definir una conexión PostgreSQL válida en el archivo .env "
            "(ejemplo: DATABASE_URL=postgresql://campaign_iq:campaign_iq@localhost:5432/campaign_iq)."
        )
    cleaned = url.strip()
    if cleaned.startswith("postgres://"):
        cleaned = "postgresql+psycopg2://" + cleaned[len("postgres://"):]
    elif cleaned.startswith("postgresql://"):
        cleaned = "postgresql+psycopg2://" + cleaned[len("postgresql://"):]

    if not cleaned.startswith("postgresql+psycopg2://"):
        raise RuntimeError(
            f"DATABASE_URL inválida ('{url.strip()}'). El sistema requiere exclusivamente PostgreSQL "
            "(debe comenzar con 'postgresql://' o 'postgresql+psycopg2://')."
        )
    return cleaned


DATABASE_URL = validate_database_url(os.getenv("DATABASE_URL"))

engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
