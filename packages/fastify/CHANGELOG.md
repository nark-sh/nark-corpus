# CHANGELOG — fastify

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-18 — deepen pass — coverage 90% → 91%

- **Profile:** `packages/fastify/contract.yaml`
- **Functions added:** setNotFoundHandler (1 total)
- **Postconditions added:** 3 (setnotfoundhandler-called-after-start, setnotfoundhandler-already-set, setnotfoundhandler-handler-throws-routes-via-error-handler)
- **Functions intentionally omitted this pass:** inject (in-process testing harness — not a production runtime contract surface); `[Symbol.asyncDispose]` (alias for close(), same error semantics); WebDAV verbs / `all` (same RouteShorthandMethod signature as `get` — covered by existing get postconditions).
- **Scanner concerns queued:** 2 (`concern-20260618-fastify-deepen-1` detection rule for setNotFoundHandler patterns, `concern-20260618-fastify-deepen-2` wire up new fixtures into ground-truth suite)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:**
  - https://fastify.dev/docs/latest/Reference/Server/#setnotfoundhandler
  - https://fastify.dev/docs/latest/Reference/Plugins/
  - https://fastify.dev/docs/latest/Reference/Hooks/#onerror
  - `node_modules/fastify/types/instance.d.ts` (FastifyInstance method signatures)
  - `node_modules/fastify/lib/four-oh-four.js` (setNotFoundHandler implementation; the `Not found handler already set` Error is thrown at lines 93-94)
  - `node_modules/fastify/lib/errors.js` (FST_ERR_* error registry)
  - `node_modules/fastify/fastify.js:694-697` (throwIfAlreadyStarted('Cannot call "setNotFoundHandler"!'))
  - `node_modules/fastify/lib/error-handler.js` (404 handler errors routed via setErrorHandler chain)
- **Verified by:** bc-deepen-contract pass 15 (deepen-stream-2, 2026-06-18T23:54:40Z)
- **Notes:** First proper Phase 1 enumeration since the entry was reconstructed from contract.yaml on 2026-04-13 (api_functions_total/contracted were `null` before this pass). Walked the FastifyInstance type declarations to confirm the true async-callable surface = 11 methods. After this pass: 10 contracted, 1 omitted (inject — testing harness), effective coverage 10/10 = 100%. Two new fixtures added (notfound-handler-{missing,proper}-error-handling.ts) with @expect-violation/@expect-clean annotations matching the three new postcondition ids. Scanner does not yet have a detection rule specific to setNotFoundHandler — queued as concern -1; the fixtures serve as a TODO-anchor for the implementation upgrade.

## 2026-06-18 — re-verified clean

- **Latest published:** fastify@5.8.5
- **Profile semver:** `>=5.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** fastify@5.8.5
- **Profile semver:** >=5.0.0 <6.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** fastify@5.8.5
- **Profile semver:** `>=5.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** fastify@5.8.5
- **Profile semver:** `>=5.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** fastify@5.8.5
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-13 — backfilled

- **Verified against:** fastify@>=5.0.0 <6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
