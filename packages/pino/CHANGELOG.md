# CHANGELOG — pino

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 100% → 100% (re-confirmed-complete)

- **Profile:** `packages/pino/contract.yaml`
- **Functions added:** none (re-confirmed-complete; full API surface re-enumerated against pino@10.3.1 dist d.ts and docs/api.md)
- **Postconditions added:** 0
- **API surface verified:** 16 callable functions/methods (4 top-level functions + 12 Logger instance methods)
- **Contracted (7):** `pino()`, `pino.destination()`, `pino.transport()`, `pino.multistream()`, `logger.child()`, `logger.fatal()` (edge-case only), `logger.flush()`
- **Intentionally omitted (9):** `logger.error`, `logger.warn`, `logger.info`, `logger.debug`, `logger.trace`, `logger.silent`, `logger.isLevelEnabled`, `logger.bindings`, `logger.setBindings` — all are synchronous, void/boolean return, no Promise, no documented throws beyond the serializer-must-not-throw edge case already attached to `pino()`. `logger.silent` is a documented noop. Per-line log methods cannot throw on their own — failures bubble through the destination stream's `error` event which is covered by the destination/transport postconditions.
- **MultiStreamRes sub-methods reviewed:** `add()`, `flushSync()`, `remove()`, `clone()` on the object returned by `pino.multistream()` are NOT separately contracted because (a) scanner detection is name-based at the call site, (b) `multistream().flushSync()` is a rare 2-chain pattern not seen in the pino corpus fixtures or scan results, and (c) the factory-level postconditions already cover invalid-stream-entry and individual-stream-failure-silent which are the documented failure modes. If 2-chain detection lands as a scanner upgrade, revisit and add `multistream-flushsync-throws-on-eagain-eio` as a sub-method postcondition.
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** `node_modules/pino/pino.d.ts` (908 LOC, full d.ts), `node_modules/pino/docs/api.md` (Statics + Logger Instance sections), `node_modules/sonic-boom/README.md` (flushSync semantics)
- **Verified by:** bc-deepen-contract pass 20 (deepen-stream-3, 2026-06-23T00:15:43Z)

## 2026-06-18 — re-verified clean

- **Latest published:** pino@10.3.1
- **Profile semver:** `>=7.0.0 <12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** pino@10.3.1
- **Profile semver:** >=7.0.0 <12.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** pino@10.3.1
- **Profile semver:** `>=7.0.0 <12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** pino@10.3.1
- **Profile semver:** `>=7.0.0 <12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** pino@10.3.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-03 — backfilled

- **Verified against:** pino@>=7.0.0 <12.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
