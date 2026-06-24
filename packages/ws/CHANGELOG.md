# CHANGELOG — ws

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 88% → 90%

- **Profile:** `packages/ws/contract.yaml`
- **Functions added:** pong, terminate (2 total)
- **Postconditions added:** 5
  - pong.pong-before-open (error, DOWNTIME/service_unavailable)
  - pong.pong-callback-receives-error (warning, SILENT_FAILURE/degraded_performance)
  - terminate.terminate-during-connecting-silent (warning, SILENT_FAILURE/degraded_performance)
  - terminate.terminate-on-closed-no-op (info, SILENT_FAILURE/degraded_performance)
- **Functions intentionally omitted this pass:** pause/resume (flow-control helpers, silently return on CONNECTING/CLOSED, <1% codebase usage); createWebSocketStream (carried from prior pass — niche Duplex wrapper, same error contracts as WebSocket)
- **Scanner concerns queued:** 3 (`concern-20260624-ws-deepen-1`, `concern-20260624-ws-deepen-2`, `concern-20260624-ws-deepen-3`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://github.com/websockets/ws/blob/master/lib/websocket.js (pong: lines 399-421; terminate: lines 492-504)
  - https://github.com/websockets/ws/blob/master/doc/ws.md
- **Verified by:** bc-deepen-contract (pass 59, deepen-stream-2, drift-by-staleness mode, 2026-06-24T07:19:10Z)
- **Drift-mode notes:** Re-enumerated ws@8.21.0 lib/websocket.js prototype methods against the 2026-04-16 baseline. profile semver `>=8.17.1` unchanged; latest published is 8.21.0 still in range. Found 2 uncontracted methods (pong, terminate) with confirmed throw / silent-failure hazards. Coverage 7/8 = 0.88 → 9/10 = 0.9.


## 2026-06-18 — re-verified clean

- **Latest published:** ws@8.21.0
- **Profile semver:** `>=8.17.1` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** ws@8.21.0
- **Profile semver:** >=8.17.1 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** ws@8.21.0
- **Profile semver:** `>=8.17.1` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** ws@8.21.0
- **Profile semver:** `>=8.17.1` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** ws@8.21.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** ws@>=8.17.1
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
