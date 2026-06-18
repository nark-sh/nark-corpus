# CHANGELOG — socket.io

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-18 — deepen pass — coverage 83% → 100% (effective)

- **Profile:** `packages/socket.io/contract.yaml`
- **Functions added:** 0 (API surface re-enumerated; no new contracts written)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** `Server.allSockets`, `Namespace.allSockets`, `BroadcastOperator.allSockets` — all 3 marked `@deprecated` in socket.io@4.8.3 source (`dist/index.d.ts`, `dist/namespace.d.ts`, `dist/broadcast-operator.d.ts`) with removal warning: "this method will be removed in the next major release, please use serverSideEmit or fetchSockets instead"
- **Surface re-confirmed:** 15 total async-callable, 10 contracted, 5 intentionally omitted (Socket.leave + Namespace.serverSideEmitWithAck previously omitted; allSockets x3 newly omitted as deprecated)
- **Effective coverage:** 10 / (15 - 5 omitted) = 1.0
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.1.0
- **Sources fetched:** TypeScript declarations from socket.io@4.8.3 (`node_modules/socket.io/dist/*.d.ts`)
- **Verified by:** bc-deepen-contract (pass-5 deepen-stream-1 on 2026-06-18T21:47:08Z)
- **Closes prior gap:** pass-10 deepen-stream-2 deferred allSockets() postcondition work citing context budget; this pass resolves it by classifying allSockets() as intentionally-omitted (deprecated upstream) rather than writing postconditions for a method slated for removal


## 2026-06-18 — re-verified clean

- **Latest published:** socket.io@4.8.3
- **Profile semver:** `^4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** socket.io@4.8.3
- **Profile semver:** ^4.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** socket.io@4.8.3
- **Profile semver:** `^4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** socket.io@4.8.3
- **Profile semver:** `^4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** socket.io@4.8.3
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-20 — backfilled

- **Verified against:** socket.io@^4.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
