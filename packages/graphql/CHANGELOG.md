# CHANGELOG — graphql

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-18 — re-verified clean

- **Latest published:** graphql@17.0.1
- **Profile semver:** `>=16.0.0 <18.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** graphql@17.0.1
- **Profile semver:** >=16.0.0 <18.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** graphql@17.0.0
- **Profile semver:** `>=16.0.0 <18.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — semver range extended

- **Latest published:** graphql@17.0.0
- **Profile semver:** `>=16.0.0 <17.0.0` → `>=16.0.0 <18.0.0`
- **Verdict:** no error-handling-relevant changes between v16 and v17 — extended range
- **Changelog evidence:** v17.0.0 (2026-06-15) is the first stable v17, accumulating changes from alphas (since 2022-05). Breaking changes are: ESM-only packaging, dropped Node 12/17 support, removed deprecated APIs (getOperationRootType, graphql/subscription module, *Enum types, positional GraphQLError args, printError/formatError). NEW features: tracing channels (PR #4670), partial-result-on-abort (PR #4674), Object.create(null) for prototype safety (PR #4634). All 10 documented postconditions still apply: graphql() still returns errors not throws; subscribe() still returns discriminated union; parse/buildSchema still throw GraphQLError/Error respectively. Future deepen-pass candidate: add postcondition for partial-result-on-abort behavior in v17+.
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** graphql@16.14.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** graphql@>=16.0.0 <17.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
