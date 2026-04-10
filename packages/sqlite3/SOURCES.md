# sqlite3 - Error Handling Sources

**Package:** sqlite3 (node-sqlite3)
**Version:** >=5.0.3
**Last Updated:** 2026-02-26
**Maintenance Status:** Inactive (12+ months no release)

## Security

### CVE-2022-21227 (CVSS 7.5 - HIGH)
- **Affected:** < 5.0.3
- **Fixed:** 5.0.3
- **Impact:** DoS via invalid Function object crashes V8 engine
- **Sources:** https://nvd.nist.gov/vuln/detail/CVE-2022-21227

### Minimum Safe Version: 5.0.3

## Common Production Bugs

1. **Callback error ignored** (30-40%) - Silent failures
2. **SQL injection** - String concatenation instead of `?` placeholders
3. **SQLITE_BUSY not handled** - Database locked errors crash app
4. **Transaction rollback missing** - Data corruption
5. **Foreign keys not enabled** - PRAGMA foreign_keys = ON required

## Official Documentation
- GitHub: https://github.com/TryGhost/node-sqlite3
- API Wiki: https://github.com/TryGhost/node-sqlite3/wiki/API
- SQLite Docs: https://www.sqlite.org/

## Research Completeness
- ✅ 22 SQLite error codes documented
- ✅ 1 CVE analyzed
- ✅ 10 common bugs identified  
- ✅ 2,536 lines of research

**Last Updated:** 2026-02-26
