# CHANGELOG — rxjs

## 2026-06-25 — re-verified clean

- **Latest published:** rxjs@7.8.2
- **Profile semver:** >=7.0.0 <8.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100%

- **Profile:** `packages/rxjs/contract.yaml`
- **Mode:** drift-by-staleness re-verification (last_deepened was 2026-04-16, oldest in public tier)
- **Functions added:** none (API surface unchanged)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** none (all 5 async-callable still contracted)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `node_modules/rxjs/dist/types/internal/firstValueFrom.d.ts` (signature unchanged)
  - `node_modules/rxjs/dist/types/internal/lastValueFrom.d.ts` (signature unchanged)
  - `node_modules/rxjs/dist/types/internal/Observable.d.ts` (forEach, toPromise unchanged)
  - `node_modules/rxjs/dist/types/internal/observable/dom/fetch.d.ts` (fromFetch unchanged)
  - `node_modules/rxjs/CHANGELOG.md` (7.7.0 → 7.8.2 are bug fixes only)
- **Verdict:** rxjs@7.8.2 is the latest within the declared semver `>=7.0.0 <8.0.0`. No new async-callable functions since 2026-04-16. ajax/webSocket exports return Observables (not Promises), not relevant. Contract re-verified accurate. `contract_version` bumped 1.1.0 -> 1.1.1.
- **Verified by:** bc-deepen-contract (pass 54 on 2026-06-24T06:28:22Z, deepen-stream-2)

## 2026-06-18 — re-verified clean

- **Latest published:** rxjs@7.8.2
- **Profile semver:** `>=7.0.0 <8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** rxjs@7.8.2
- **Profile semver:** >=7.0.0 <8.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** rxjs@7.8.2
- **Profile semver:** `>=7.0.0 <8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** rxjs@7.8.2
- **Profile semver:** `>=7.0.0 <8.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** rxjs@7.8.2
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** rxjs@>=7.0.0 <8.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
