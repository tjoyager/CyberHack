---
name: asyncpg SSL fix for Replit DATABASE_URL
description: How to handle ?sslmode=require in Replit's DATABASE_URL when using asyncpg with SQLAlchemy
---

Replit's managed PostgreSQL injects `?sslmode=require` into DATABASE_URL. asyncpg does not accept `sslmode` as a URL query parameter — it throws `TypeError: connect() got an unexpected keyword argument 'sslmode'`.

**Fix:** Strip `sslmode` from the URL using `urllib.parse`, detect if it was `require`/`verify-*`, then pass `connect_args={"ssl": "require"}` to `create_async_engine`.

**Why:** asyncpg uses Python's `ssl` module directly, not libpq params. The `sslmode` key is a libpq concept unsupported by asyncpg's connection interface.

**How to apply:** In `config.py`, add a `_strip_sslmode(url)` helper that returns `(clean_url, needs_ssl: bool)`. In `db.py`, use `connect_args={"ssl": "require"} if settings.async_database_needs_ssl else {}`.
