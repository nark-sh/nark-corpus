# CHANGELOG — redis

All notable verification, deepen, and fork events for this profile. Newest first.



## 2026-06-15 — re-verified clean

- **Latest published:** redis@6.0.0
- **Profile semver:** `>=5.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** redis@6.0.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — semver range extended

- **Latest published:** redis@6.0.0
- **Profile semver:** `>=5.0.0 <6.0.0` → `>=5.0.0 <7.0.0`
- **Verdict:** no error-handling-relevant changes between v5 and v6 — RESP3 default is a wire-level change; `.on('error')` handler requirement and ECONNREFUSED throw patterns are unchanged
- **Changelog evidence:** v6.0.0 release notes: "RESP3 is now the default protocol", "Raise minimum Node.js engine to 20" — no error class or API changes
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-06 — backfilled

- **Verified against:** redis@>=5.0.0 <6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
