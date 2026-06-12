# CHANGELOG — @elastic/elasticsearch

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-11 — semver range extended

- **Latest published:** @elastic/elasticsearch@9.4.2
- **Profile semver:** `>=7.0.0 <9.0.0` → `>=7.0.0 <10.0.0`
- **Verdict:** no error-handling-relevant changes between v8 and v9 — extended range
- **Changelog evidence:** `@elastic/transport` error classes (ResponseError, ConnectionError, TimeoutError, NoLivingConnectionsError, SerializationError, DeserializationError, ConfigurationError, RequestAbortedError) are byte-for-byte identical between transport@8.10.0 and transport@9.3.7 (verified by diffing extracted d.ts); only `cause?: unknown` added to ErrorOptions interface (non-breaking). elasticsearch v9.0.0 re-exports everything from `@elastic/transport` unchanged.
- **Scanner version used:** nark@3.0.0
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-11 — backfilled

- **Verified against:** @elastic/elasticsearch@>=7.0.0 <9.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
