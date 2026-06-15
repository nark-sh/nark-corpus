# CHANGELOG — twilio

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-14 — re-verified clean

- **Latest published:** twilio@6.0.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — semver range extended

- **Latest published:** twilio@6.0.2
- **Profile semver:** `>=3.0.0 <6.0.0` → `>=3.0.0 <7.0.0`
- **Verdict:** no error-handling-relevant changes in v6 — major bump was solely to signal Node.js 20 minimum requirement; no API, error class, or RestException behavior changes
- **Changelog evidence:** v6.0.0 CHANGES.md: "Bump version to 6.0.0 (major version release). Raise minimum Node.js engine from >=14.0 to >=20.0." — this is the entire documented breaking change
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-15 — backfilled

- **Verified against:** twilio@>=3.0.0 <6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
