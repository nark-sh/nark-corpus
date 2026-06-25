# CHANGELOG — @prisma/client

## 2026-06-25 — re-verified clean

- **Latest published:** @prisma/client@7.8.0
- **Profile semver:** >=4.0.0 <8.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-23 — deepened (contract_version 1.1.0 -> 1.2.0)

- **Latest published:** @prisma/client@7.8.0
- **Profile semver:** `>=4.0.0 <8.0.0` (unchanged)
- **Verdict:** added 8 previously-omitted functions (re-enumeration of v7 surface)
- **Functions added:** `findMany`, `count`, `aggregate`, `groupBy`,
  `createManyAndReturn`, `updateManyAndReturn`, `$queryRawUnsafe`,
  `$executeRawUnsafe`
- **Why re-enumerated:** v1.1.0 conservatively skipped 8 surfaces. Two motivated
  the re-enumeration:
  - `aggregate` returns `null` for `_min/_max/_avg/_sum` on no-rows — a silent-failure
    crash pattern indistinguishable in static analysis from valid data.
  - `$queryRawUnsafe` / `$executeRawUnsafe` are SQL-injection vectors with critical
    incident cost. Skipping them left a security-relevant gap.
- **Coverage:** effective_coverage 1.0 (all callable async surface contracted);
  remaining intentionally-omitted: `findRaw`, `aggregateRaw` (MongoDB-only),
  `$queryRawTyped` (newer typed variant), `$runCommandRaw` (MongoDB),
  `$extends` (extension hook, not a query op)
- **Fixture:** added `fixtures/v7-new-surface.ts` covering all 8 new functions
  with paired bad/good handlers
- **Scanner version used:** nark@3.1.0
- **Deepened by:** bc-deepen-contract (deepen-stream-2 pass 13)

## 2026-06-18 — re-verified clean

- **Latest published:** @prisma/client@7.8.0
- **Profile semver:** `>=4.0.0 <8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @prisma/client@7.8.0
- **Profile semver:** >=4.0.0 <8.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @prisma/client@7.8.0
- **Profile semver:** `>=4.0.0 <8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @prisma/client@7.8.0
- **Profile semver:** `>=4.0.0 <8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @prisma/client@7.8.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-06 — backfilled

- **Verified against:** @prisma/client@>=4.0.0 <8.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
