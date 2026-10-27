from datetime import datetime, timezone
from functools import lru_cache
import socket
from typing import Any, List, Optional, Type
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

import app.main as main_module
from app.db.dbsession import Base, engine, get_db, SessionLocal
from app.models.users import User
from app.models.campaigns import Campaign, Post


class InMemoryQuery:
    def __init__(self, session: "InMemoryRelationalSession", model: Type[Any]):
        self.session = session
        self.model = model
        self.items = list(session.store.get(model, []))

    def filter(self, *criteria: Any) -> "InMemoryQuery":
        filtered = []
        for item in self.items:
            match = True
            for crit in criteria:
                left_name = getattr(getattr(crit, "left", None), "name", None)
                right_val = getattr(getattr(crit, "right", None), "value", None)
                op_str = str(getattr(crit, "operator", ""))
                if left_name is not None:
                    actual = getattr(item, left_name, None)
                    if "ilike" in op_str.lower() or "like" in op_str.lower():
                        pattern = str(right_val or "").strip("%").lower()
                        if pattern not in str(actual or "").lower():
                            match = False
                            break
                    else:
                        if actual != right_val:
                            match = False
                            break
            if match:
                filtered.append(item)
        clone = InMemoryQuery(self.session, self.model)
        clone.items = filtered
        return clone

    def order_by(self, *clauses: Any) -> "InMemoryQuery":
        clone = InMemoryQuery(self.session, self.model)
        clone.items = sorted(
            self.items,
            key=lambda x: (
                getattr(x, "published_at", None) or getattr(x, "created_at", None) or datetime.min,
                getattr(x, "id", 0) or 0,
            ),
            reverse=True,
        )
        return clone

    def offset(self, skip: int) -> "InMemoryQuery":
        clone = InMemoryQuery(self.session, self.model)
        clone.items = self.items[skip:]
        return clone

    def limit(self, limit_val: int) -> "InMemoryQuery":
        clone = InMemoryQuery(self.session, self.model)
        clone.items = self.items[:limit_val]
        return clone

    def all(self) -> List[Any]:
        return list(self.items)

    def first(self) -> Optional[Any]:
        return self.items[0] if self.items else None


class InMemoryRelationalSession:
    def __init__(self) -> None:
        self.store: dict[Type[Any], List[Any]] = {
            User: [],
            Campaign: [],
            Post: [],
        }
        self.counters: dict[Type[Any], int] = {
            User: 0,
            Campaign: 0,
            Post: 0,
        }

    def execute(self, statement: Any) -> Any:
        return 1

    def query(self, model: Type[Any]) -> InMemoryQuery:
        return InMemoryQuery(self, model)

    def add(self, obj: Any) -> None:
        model = type(obj)
        if obj not in self.store[model]:
            self.counters[model] += 1
            obj.id = self.counters[model]
            now_naive = datetime.now(timezone.utc).replace(tzinfo=None)
            if isinstance(obj, User) and not getattr(obj, "created_at", None):
                obj.created_at = now_naive
            if isinstance(obj, Campaign):
                if not getattr(obj, "created_at", None):
                    obj.created_at = now_naive
                if not getattr(obj, "start_date", None):
                    obj.start_date = now_naive
            if isinstance(obj, Post):
                if not getattr(obj, "published_at", None):
                    obj.published_at = now_naive
                parent = next(
                    (c for c in self.store[Campaign] if c.id == obj.campaign_id),
                    None,
                )
                if parent is not None:
                    obj.campaign = parent
                    if obj not in parent.posts:
                        parent.posts.append(obj)
            self.store[model].append(obj)

    def delete(self, obj: Any) -> None:
        model = type(obj)
        if obj in self.store[model]:
            self.store[model].remove(obj)
        if isinstance(obj, Campaign):
            self.store[Post] = [
                p for p in self.store[Post] if p.campaign_id != obj.id
            ]
        elif isinstance(obj, Post):
            parent = next(
                (c for c in self.store[Campaign] if c.id == obj.campaign_id),
                None,
            )
            if parent and obj in parent.posts:
                parent.posts.remove(obj)

    def commit(self) -> None:
        pass

    def refresh(self, obj: Any) -> None:
        pass

    def close(self) -> None:
        pass


@lru_cache(maxsize=1)
def _is_postgres_online() -> bool:
    host = engine.url.host or "localhost"
    port = engine.url.port or 5432
    try:
        with socket.create_connection((host, port), timeout=0.5):
            pass
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch):
    if _is_postgres_online():
        Base.metadata.create_all(bind=engine)
        connection = engine.connect()
        transaction = connection.begin()
        test_session = SessionLocal(bind=connection)

        def override_get_db():
            try:
                yield test_session
            finally:
                pass

        main_module.app.dependency_overrides[get_db] = override_get_db
        with TestClient(main_module.app) as test_client:
            yield test_client
        main_module.app.dependency_overrides.clear()
        test_session.close()
        transaction.rollback()
        connection.close()
    else:
        mem_session = InMemoryRelationalSession()
        monkeypatch.setattr(main_module, "verify_postgresql_connection", lambda: None)

        def override_get_db():
            yield mem_session

        main_module.app.dependency_overrides[get_db] = override_get_db
        with TestClient(main_module.app) as test_client:
            yield test_client
        main_module.app.dependency_overrides.clear()
