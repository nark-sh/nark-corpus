# CHANGELOG — @trpc/client

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (drift-by-staleness re-verify)

- **Profile:** `packages/@trpc/client/contract.yaml`
- **Package version inspected:** @trpc/client@11.18.0 (fetched via npm install for fresh `.d.ts`)
- **Functions added:** none (re-verification only)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:**
  - `WsClient.close()` — declared `async ... Promise<void>` in v11.18.0, but internal awaits use `.catch(() => null)` (wsLink-CobRSm6C.cjs lines 484-498) so the promise never rejects — no error contract to enforce
  - link factories (`httpLink`, `httpBatchLink`, `httpBatchStreamLink`, `httpSubscriptionLink`, `wsLink`, `retryLink`, `splitLink`, `loggerLink`, `unstable_localLink`) — all synchronous `TRPCLink<TRouter>` returns, no Promise surface
  - client factories (`createTRPCClient`, `createTRPCClientProxy`, `createTRPCUntypedClient`, `createWSClient`, `getUntypedClient`, `getFetch`) — synchronous constructors / utilities
  - type guards (`isTRPCClientError`, `isFormData`, `isNonJsonSerializable`, `isOctetType`, `clientCallTypeToProcedureType`, `jsonEncoder`) — pure synchronous helpers
- **Scanner concerns queued:** 0 (existing concerns from 2026-04-16 pass remain pending)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `node_modules/@trpc/client@11.18.0/dist/index.d.cts` (45 top-level exports)
  - `node_modules/@trpc/client@11.18.0/dist/wsLink.d-DzZZZGZQ.d.cts` (WsClient class declaration)
  - `node_modules/@trpc/client@11.18.0/dist/wsLink-CobRSm6C.cjs` (WsClient.close source — confirms internal `.catch(() => null)` swallow)
- **Contract changes:**
  - `semver: ">=10.0.0"` → `">=10.0.0 <12.0.0"` (explicit upper bound on v11.x)
  - `contract_version: 1.1.0` → `1.2.0`
  - `last_verified: 2026-04-16` → `2026-06-24`
  - notes block extended with v11 surface analysis + omission rationale
- **Verdict:** v10 → v11 introduced no new throwing async surface on the client proxy. The proxy form (`.query` / `.mutate` / `.subscribe`) preserved identical semantics. WsClient.close() is the only new async-shape addition but its internal awaits suppress all rejection paths.
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 60, 2026-06-24T07:29:22Z)

## 2026-06-18 — re-verified clean

- **Latest published:** @trpc/client@11.18.0
- **Profile semver:** `>=10.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @trpc/client@11.17.0
- **Profile semver:** >=10.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @trpc/client@11.17.0
- **Profile semver:** `>=10.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @trpc/client@11.17.0
- **Profile semver:** `>=10.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @trpc/client@11.17.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @trpc/client@>=10.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
