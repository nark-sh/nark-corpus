# CHANGELOG — typescript

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-14 — re-verified clean

- **Latest published:** typescript@6.0.3
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — semver range extended

- **Latest published:** typescript@6.0.3
- **Profile semver:** `>=4.0.0 <6.0.0` → `>=4.0.0 <7.0.0`
- **Verdict:** no error-handling-relevant changes — TypeScript 6 is a stepping-stone release; ts.sys file I/O error behavior (ENOENT, etc.) is stable across 4.x–6.x; compiler API error surfacing unchanged
- **Changelog evidence:** TypeScript 6.0 announcement: "stepping-stone release aligning with upcoming native-speed 7.0" — no changes to ts.sys APIs or Node.js filesystem error propagation
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-18 — backfilled

- **Verified against:** typescript@>=4.0.0 <6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
