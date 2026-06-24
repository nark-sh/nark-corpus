# CHANGELOG — passport-local

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen re-verification (no changes)

- **Latest published:** passport-local@1.0.0 (published 2014-03-08; frozen for 12 years)
- **Profile semver:** `>=1.0.0` (unchanged)
- **API surface re-enumerated:** the published tarball ships 3 files (`lib/index.js`, `lib/strategy.js`, `lib/utils.js`). Public exports: only the `Strategy` constructor. `Strategy.prototype.authenticate(req, options)` is documented `@api protected` and only invoked by the passport framework — not directly callable by application code, correctly omitted. `utils.lookup()` is exported by `utils.js` but NOT re-exported by `index.js`, so it is not part of the package's public API.
- **Verdict:** contract is complete relative to the actual callable surface. The 6 postconditions across 4 Strategy call-context entries (base, passReqToCallback, body-parser, usernameField, plus the serializeUser session-persistence note) cover every behavioral failure mode a passport-local consumer can hit. No new postconditions added.
- **Coverage:** 5/6 surfaces contracted; 1 internal method (`Strategy.prototype.authenticate`) correctly omitted. Effective coverage = 100%.
- **Scanner version used:** nark@3.1.0 (no scan run — re-verification is by source re-read, source is byte-identical to prior pass)
- **Verified by:** bc-deepen-contract / deepen-stream-3 pass 67

## 2026-06-18 — re-verified clean

- **Latest published:** passport-local@1.0.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** passport-local@1.0.0
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** passport-local@1.0.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** passport-local@1.0.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** passport-local@1.0.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-18 — backfilled

- **Verified against:** passport-local@>=1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
