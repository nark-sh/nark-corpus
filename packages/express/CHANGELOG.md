# CHANGELOG — express

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 100% → 100% (re-confirmed)

- **Profile:** `packages/express/contract.yaml`
- **Verified against:** express@5.2.1 (latest published, installed via `npm install express` on 2026-06-23)
- **Functions added:** none (re-confirmation pass — API surface unchanged since 2026-04-04 pass)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** express.raw, express.text, app.param (rationale unchanged — identical body-parser/raw-body error profile; app.param shares async-middleware-unhandled-rejection semantics)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **API surface re-enumerated from:** node_modules/express@5.2.1/lib/express.js (top-level exports), lib/application.js (app.METHOD, app.use, app.listen, app.param, app.engine, app.route), lib/response.js (res.sendFile, res.download, res.render, res.send/json/jsonp/redirect/sendStatus etc.)
- **Verdict:** 14 async-relevant API functions enumerated. 11 contracted, 3 intentionally omitted. Effective coverage = 11/11 = 1.0. No new methods introduced in express@5.x that aren't either (a) already contracted or (b) covered by the omission rationale. Express 5 auto-rejection-forwarding is documented in the parent contract notes; the postconditions correctly reflect the Express 4 vs 5 difference. metadata.last_verified bumped to 2026-06-23. No contract.yaml structural changes; no new fixtures; no scanner concerns.
- **Verified by:** bc-deepen-contract / deepen-stream-3 pass 22 (2026-06-24T00:40:37Z)

## 2026-06-18 — re-verified clean

- **Latest published:** express@5.2.1
- **Profile semver:** `>=4.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** express@5.2.1
- **Profile semver:** >=4.0.0 <6.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** express@5.2.1
- **Profile semver:** `>=4.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** express@5.2.1
- **Profile semver:** `>=4.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** express@5.2.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-04 — backfilled

- **Verified against:** express@>=4.0.0 <6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
