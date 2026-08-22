from datetime import datetime, timezone
import re
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app.dependencies import (
    get_authenticated_service_db,
    get_current_user_token,
    get_db_session_with_user,
    require_staff_user,
)
from app.main import app


class FakeQuery:
    """In-memory stand-in for the Supabase query methods the APIs use."""

    def __init__(self, database, table_name):
        self.database, self.table_name = database, table_name
        self.filters, self.sort, self.take, self.slice = [], None, None, None
        self.operation, self.payload = "select", None

    @property
    def rows(self):
        return self.database.tables.setdefault(self.table_name, [])

    def select(self, *_fields, **_kwargs): return self

    def eq(self, field, value):
        self.filters.append((field, value))
        return self

    def or_(self, expression):
        match = re.search(r"\.ilike\.%([^%]+)%", expression)
        term = match.group(1) if match else ""
        self.filters.append(("__search__", term.lower()))
        return self

    def order(self, field, desc=False):
        self.sort = (field, desc)
        return self

    def limit(self, value): self.take = value; return self
    def range(self, start, end): self.slice = (start, end); return self
    def insert(self, payload): self.operation, self.payload = "insert", payload; return self
    def update(self, payload): self.operation, self.payload = "update", payload; return self

    def _matches(self, row):
        for field, value in self.filters:
            if field == "__search__":
                if value not in " ".join(map(str, row.values())).lower(): return False
            elif row.get(field) != value:
                return False
        return True

    def execute(self):
        if self.operation == "insert":
            items = self.payload if isinstance(self.payload, list) else [self.payload]
            created = []
            for item in items:
                row = dict(item)
                row.setdefault("id", self.database.next_ids.setdefault(self.table_name, 1))
                self.database.next_ids[self.table_name] = row["id"] + 1
                row.setdefault("status", "pending")
                row.setdefault("created_at", datetime.now(timezone.utc).isoformat())
                self.rows.append(row); created.append(row)
            return SimpleNamespace(data=created, count=len(created))
        matched = [row for row in self.rows if self._matches(row)]
        if self.operation == "update":
            for row in matched: row.update(self.payload)
            return SimpleNamespace(data=matched, count=len(matched))
        if self.sort:
            field, reverse = self.sort
            matched.sort(key=lambda row: row.get(field) or "", reverse=reverse)
        total = len(matched)
        if self.slice: matched = matched[self.slice[0]:self.slice[1] + 1]
        if self.take is not None: matched = matched[:self.take]
        return SimpleNamespace(data=matched, count=total)


class FakeSupabase:
    def __init__(self):
        self.tables = {"tickets": [], "automation_actions": []}
        self.next_ids = {"tickets": 1, "automation_actions": 1}

    def table(self, name): return FakeQuery(self, name)


@pytest.fixture
def client():
    database = FakeSupabase()

    def override_db():
        yield database

    def override_user():
        return {"sub": "test-user", "email": "test@example.com", "role": "admin", "access_token": "test"}

    app.dependency_overrides[get_db_session_with_user] = override_db
    app.dependency_overrides[get_authenticated_service_db] = override_db
    app.dependency_overrides[get_current_user_token] = override_user
    app.dependency_overrides[require_staff_user] = override_user
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
