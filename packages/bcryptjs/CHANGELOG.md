# CHANGELOG — bcryptjs

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-25 — deepen pass — coverage 75% → 75% (fixture completeness pass)

- **Profile:** `packages/bcryptjs/contract.yaml`
- **Functions added:** none (all 9 contractable functions already contracted)
- **Postconditions added:** 0
- **Fixture annotations added:** 4 SHOULD_FIRE/SHOULD_NOT_FIRE pairs in `fixtures/ground-truth.ts`:
  `genSalt`, `hashSync`, `compareSync`, `genSaltSync` — all previously contracted but lacking ground-truth test cases
- **Functions intentionally omitted this pass:** `setRandomFallback` (config-only), `encodeBase64` (internal), `decodeBase64` (internal) — same as previous pass
- **Scanner concerns queued:** 0 (all prior bcryptjs concerns are status:implemented)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** bcryptjs@3.0.3 `types.d.ts` (re-verified full API surface: 12 exports, no changes since 3.0.3)
- **Verified by:** bc-deepen-contract (pass 19, deepen-stream-1, 2026-06-25)
- **Coverage score fix:** contract.yaml `coverage_score` corrected from `1.0` (effective) to `0.75` (raw 9/12) for consistency with deepen-index


## 2026-06-19 — deepen pass — coverage 50% → 75% (effective 100%)

- **Profile:** `packages/bcryptjs/contract.yaml`
- **Functions added:** `getRounds`, `getSalt`, `truncates` (3 total)
- **Postconditions added:** 4 throw conditions (get-rounds-type-error, get-salt-type-error, get-salt-illegal-length, truncates-type-error) + 2 security-risk edge cases (get-rounds-silent-nan-on-malformed-hash, truncates-must-precede-hashing)
- **Functions intentionally omitted this pass:** `setRandomFallback` (config-only, no call-site error contract); `encodeBase64` / `decodeBase64` (internal utility codec, no application call sites in corpus)
- **Scanner concerns queued:** 3 (`concern-20260619-bcryptjs-deepen-1`, `concern-20260619-bcryptjs-deepen-2`, `concern-20260619-bcryptjs-deepen-3`) — all sync-throw detection requiring try-catch around direct call expressions (no `await` path)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:** https://github.com/dcodeIO/bcrypt.js/blob/master/index.js (source-verified at bcryptjs@3.0.3 lines 296-326), https://raw.githubusercontent.com/dcodeIO/bcrypt.js/master/README.md
- **Verified by:** bc-deepen-contract (pass on 2026-06-19T01:30:00Z)

## 2026-06-18 — re-verified clean

- **Latest published:** bcryptjs@3.0.3
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** bcryptjs@3.0.3
- **Profile semver:** >=2.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** bcryptjs@3.0.3
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** bcryptjs@3.0.3
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** bcryptjs@3.0.3
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-14 — backfilled

- **Verified against:** bcryptjs@>=2.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
