# CHANGELOG — undici

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-18 — deepen pass — coverage 91% → 100%

- **Profile:** `packages/undici/contract.yaml`
- **Functions added:** response.blob, response.bytes, response.formData, pipeline, Dispatcher.destroy, EventSource (6 total)
- **Postconditions added:** 10 (response-blob-no-try-catch, response-blob-body-already-read, response-bytes-no-try-catch, response-bytes-body-already-read, response-formdata-no-try-catch, response-formdata-unsupported-content-type, pipeline-missing-error-listener, dispatcher-destroy-no-try-catch, eventsource-constructor-syntax-error, eventsource-connection-error-not-handled)
- **Functions intentionally omitted this pass:** none — all async-callable surface methods present in undici@8.5.0 declaration files are now contracted
- **Scanner concerns queued:** 9 (concern-20260618-undici-deepen-1 through concern-20260618-undici-deepen-9)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:** undici@8.5.0 types/index.d.ts, types/api.d.ts, types/fetch.d.ts (BodyMixin), types/dispatcher.d.ts, types/websocket.d.ts, types/eventsource.d.ts; lib/web/fetch/body.js (consumeBody, formData parser), lib/web/eventsource/eventsource.js (constructor + event dispatch), lib/dispatcher/dispatcher-base.js (destroy lifecycle), lib/api/api-pipeline.js (Duplex error path); https://developer.mozilla.org/en-US/docs/Web/API/Response/{blob,bytes,formData}, https://developer.mozilla.org/en-US/docs/Web/API/EventSource, https://github.com/nodejs/undici/blob/main/docs/docs/api/Errors.md
- **Verified by:** bc-deepen-contract (pass on 2026-06-18T18:00:00Z)

## 2026-06-18 — re-verified clean

- **Latest published:** undici@8.5.0
- **Profile semver:** `>=5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** undici@8.5.0
- **Profile semver:** >=5.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** undici@8.5.0
- **Profile semver:** `>=5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** undici@8.5.0
- **Profile semver:** `>=5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** undici@8.4.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-11 — backfilled

- **Verified against:** undici@>=5.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
