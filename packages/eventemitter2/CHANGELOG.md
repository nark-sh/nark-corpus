# CHANGELOG — eventemitter2

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100%

- **Profile:** `packages/eventemitter2/contract.yaml`
- **Functions added:** none (already at 100% coverage)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** on / once (instance) / off / removeListener / addListener / many / onAny / prependAny / offAny / prependListener / prependOnceListener / prependMany / removeAllListeners / setMaxListeners / getMaxListeners / eventNames / listenerCount / listeners / listenersAny / stopListeningTo / hasListeners — all sync this-returning registration/utility methods; their only throws are sync programmer-error TypeError guards on non-function args (`'on only accepts instances of Function'`, `'many only accepts instances of Function'`, etc.) rather than runtime async error contracts; TypeScript catches these at compile time.
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** node_modules/eventemitter2/eventemitter2.d.ts (v6.4.9), node_modules/eventemitter2/lib/eventemitter2.js (sync throw audit lines 135-1593)
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T07:51:54Z, deepen-stream-2 pass 62)
- **Verdict:** RE-CONFIRMED-COMPLETE. Phase 1 enumerated 27 declared methods in eventemitter2.d.ts; 6 async/error-throwing methods (constructor, emit, emitAsync, waitFor, static once, listenTo) all contracted with the existing 12 postconditions. Remaining 21 are sync registration/utility — no new contract needed.

## 2026-06-18 — re-verified clean

- **Latest published:** eventemitter2@6.4.9
- **Profile semver:** `>=6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** eventemitter2@6.4.9
- **Profile semver:** >=6.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** eventemitter2@6.4.9
- **Profile semver:** `>=6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** eventemitter2@6.4.9
- **Profile semver:** `>=6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** eventemitter2@6.4.9
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** eventemitter2@>=6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
