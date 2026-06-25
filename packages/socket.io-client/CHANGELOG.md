# CHANGELOG — socket.io-client

## 2026-06-25 — re-verified clean

- **Latest published:** socket.io-client@4.8.3
- **Profile semver:** >=4.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% -> 100% (re-verification, no surface drift)

- **Profile:** `packages/socket.io-client/contract.yaml`
- **Functions added:** none (API surface unchanged across 4.6 -> 4.8.3)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** `socket.io.reconnect_attempt` (per-attempt observability, fires alongside reconnect_error which is already contracted), `socket.connect/open/disconnect/close/send` (sync chainable, no async error surface), `socket.timeout/onAny/offAny/listenersAny` (chainable / sync introspection), `Manager.open/connect` (chainable with optional error callback, surface duplicates socket.io connect_error event)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://socket.io/docs/v4/changelog/4.8.0 (transports option, tryAllTransports — config-only, no new async surface)
  - https://socket.io/docs/v4/changelog/4.8.3 (server bug fixes, mandated client bump, no client-side surface change)
  - node_modules/socket.io-client@4.8.3/build/esm/socket.d.ts and manager.d.ts (full TS declaration audit)
- **Verified by:** bc-deepen-contract (drift-by-staleness re-verification pass on 2026-06-24T10:50:47Z)

## 2026-06-18 — re-verified clean

- **Latest published:** socket.io-client@4.8.3
- **Profile semver:** `>=4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** socket.io-client@4.8.3
- **Profile semver:** >=4.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** socket.io-client@4.8.3
- **Profile semver:** `>=4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** socket.io-client@4.8.3
- **Profile semver:** `>=4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** socket.io-client@4.8.3
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-20 — backfilled

- **Verified against:** socket.io-client@>=4.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
