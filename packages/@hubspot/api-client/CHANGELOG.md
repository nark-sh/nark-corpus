# CHANGELOG — @hubspot/api-client

## 2026-06-25 — re-verified clean

- **Latest published:** @hubspot/api-client@13.5.0
- **Profile semver:** >=1.0.0 <14.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 93% -> 93%

- **Profile:** `packages/@hubspot/api-client/contract.yaml`
- **Functions added:** Client.apiRequest (1 total — top-level escape hatch for not-wrapped endpoints)
- **Postconditions added:** 2 (api-request-no-try-catch, api-request-response-status-unchecked)
- **Functions intentionally omitted this pass:** none (carry-over: getPage / batchApi.read / oauth.accessTokens / oauth.refreshTokens / crm.imports — unchanged from 2026-04-16)
- **Scanner concerns queued:** 2 (`concern-20260624-hubspot-api-client-deepen-9`, `concern-20260624-hubspot-api-client-deepen-10`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://github.com/HubSpot/hubspot-api-nodejs#not-wrapped-endpoints (README escape-hatch section)
  - https://github.com/node-fetch/node-fetch#handling-exceptions (FetchError vs HTTP status semantics)
  - https://developers.hubspot.com/docs/api/error-handling
  - `node_modules/@hubspot/api-client@13.5.0/lib/src/client.{js,d.ts}` (apiRequest source)
  - `node_modules/@hubspot/api-client@13.5.0/lib/src/services/http/HttpClient.js` (returns raw node-fetch Response)
  - `node_modules/@hubspot/api-client@13.5.0/lib/src/services/decorators/RetryDecorator.js` (watches error.code, not response.status — does NOT help apiRequest)
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 55 on 2026-06-24T06:35:02Z)
- **Note:** denominator grew from 14 -> 15 (newly discovered surface). Numerator 13 -> 14. Coverage rounds to 0.93 either way. The critical contract distinction: apiRequest() returns raw node-fetch Response and does NOT throw on HTTP 4xx/5xx — unlike every other Client.* method in this contract. RetryDecorator does not save callers because it watches caughtError.code on thrown ApiException, which apiRequest never produces.


## 2026-06-18 — re-verified clean

- **Latest published:** @hubspot/api-client@13.5.0
- **Profile semver:** `>=1.0.0 <14.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @hubspot/api-client@13.5.0
- **Profile semver:** >=1.0.0 <14.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @hubspot/api-client@13.5.0
- **Profile semver:** `>=1.0.0 <14.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @hubspot/api-client@13.5.0
- **Profile semver:** `>=1.0.0 <14.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @hubspot/api-client@13.5.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — semver range extended

- **Latest published:** @hubspot/api-client@13.5.0
- **Profile semver:** `>=1.0.0 <12.0.0` → `>=1.0.0 <14.0.0`
- **Verdict:** no error-handling-relevant changes in v12 or v13 — API method renames and structural reorganization only; ApiException error-handling patterns unchanged
- **Changelog evidence:** v13.0.0: moved/renamed methods across API classes, renamed archiveGDPR() to _delete() — no changes to error types, ApiException behavior, or HTTP error surfacing
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-16 — backfilled

- **Verified against:** @hubspot/api-client@>=1.0.0 <12.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
