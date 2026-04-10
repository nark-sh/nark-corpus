# Sources — better-sqlite3

| URL | Fetched | Summary |
|---|---|---|
| https://raw.githubusercontent.com/WiseLibs/better-sqlite3/master/docs/api.md | 2026-04-02 | Official API docs. Documents SqliteError, all throwing methods, error codes |
| https://github.com/WiseLibs/better-sqlite3 | 2026-04-02 | Main repo. README confirms synchronous API design |
| https://security.snyk.io/package/npm/better-sqlite3 | 2026-04-02 | No known CVEs for this package |

## Key Findings

- All statement methods (run, get, all, iterate) are **synchronous** and throw `SqliteError`
- `SqliteError` has a `code` property: extended SQLite result codes (`SQLITE_CONSTRAINT_UNIQUE`, `SQLITE_BUSY`, `SQLITE_FULL`, etc.)
- `backup()` is the only async method (returns a Promise)
- Transactions auto-rollback on thrown exceptions; `exec()` does NOT
- Real-world evidence: RedisInsight checks `e.code === 'SQLITE_CONSTRAINT'` in production code
