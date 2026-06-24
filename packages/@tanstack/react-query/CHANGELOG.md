# CHANGELOG — @tanstack/react-query

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass 26 — coverage re-verified at 100% (15/15 non-omitted, surface re-counted to 20)

- **Profile:** `packages/@tanstack/react-query/contract.yaml`
- **Functions added:** useSuspenseQueries, resetQueries (2 total)
- **Postconditions added:** 5 (suspense-queries-error-boundary-required, suspense-queries-cancellation-not-supported, suspense-queries-stale-refetch-cascade, resetqueries-silent-refetch-failure, resetqueries-throws-when-throw-on-error)
- **Functions intentionally omitted this pass:** cancelQueries (`.catch(noop)` body — never rejects), prefetchInfiniteQuery (`.catch(noop)` body — same profile as prefetchQuery), resumePausedMutations (internal recovery method; per-mutation errors flow through each mutation's onError, no call-site contract), usePrefetchQuery (synchronous void return, no Promise to await), usePrefetchInfiniteQuery (synchronous void return)
- **Scanner concerns queued:** 2 (`concern-20260624-tanstack-react-query-deepen-1` for useSuspenseQueries detection in react-query-analyzer; `concern-20260624-tanstack-react-query-deepen-2` for QueryClient property-chain detection covering resetQueries plus existing imperative methods)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://github.com/TanStack/query/blob/main/docs/reference/QueryClient.md (cancelQueries / resetQueries / resumePausedMutations behavior), https://github.com/TanStack/query/blob/main/docs/framework/react/reference/useSuspenseQueries.md (signature + cancellation + stale-refetch caveat), https://github.com/TanStack/query/blob/main/docs/framework/react/guides/suspense.md (ErrorBoundary contract), direct source inspection of `node_modules/@tanstack/query-core/build/modern/queryClient.js` (resetQueries lines 126-140, cancelQueries 141-147, refetchQueries 165-180, prefetchInfiniteQuery 198-200, resumePausedMutations 205-210) and `node_modules/@tanstack/react-query/build/modern/_tsup-dts-rollup.d.ts` (useSuspenseQueries line 915, usePrefetchQuery line 852, usePrefetchInfiniteQuery line 848)
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 26 on 2026-06-24T01:34:30Z)
- **contract_version:** 2.0.0 → 2.1.0
- **Surface count correction:** pass 2 (2026-04-13) recorded 21 async-callable functions; pass 26 re-counted to 20 — the prior tally double-counted by including the QueryClient class entry itself as a callable, but that entry holds class-level preconditions only (no Promise-returning method on the class itself). All 11 imperative QueryClient methods + 7 hooks + 2 sync prefetch hooks = 20 total surface.


## 2026-06-18 — re-verified clean

- **Latest published:** @tanstack/react-query@5.101.0
- **Profile semver:** `>=5.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @tanstack/react-query@5.101.0
- **Profile semver:** >=5.0.0 <6.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @tanstack/react-query@5.101.0
- **Profile semver:** `>=5.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @tanstack/react-query@5.101.0
- **Profile semver:** `>=5.0.0 <6.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @tanstack/react-query@5.101.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-13 — backfilled

- **Verified against:** @tanstack/react-query@>=5.0.0 <6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
