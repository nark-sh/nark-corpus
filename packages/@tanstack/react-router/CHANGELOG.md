# CHANGELOG — @tanstack/react-router

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% -> 100% (re-verified-complete)

- **Profile:** `packages/@tanstack/react-router/contract.yaml`
- **Latest published:** @tanstack/react-router@1.170.16
- **Profile semver:** `>=1.0.0 <2.0.0` (unchanged)
- **Functions added:** none (re-verified, no new throw-bearing async surface)
- **Postconditions added:** 0
- **Functions intentionally omitted this pass:** 28 (utility re-exports, history factories, boundary components, reactive state hooks, render utilities, file-route config helpers, control-flow markers, internal React helpers — full list in deepen-index.json)
- **Scanner concerns queued:** 0
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** dist/esm/index.d.ts (52 export lines / 43 distinct value-level exports), dist/esm/router.d.ts, dist/esm/useNavigate.d.ts, dist/esm/useBlocker.d.ts, dist/esm/awaited.d.ts, dist/esm/lazyRouteComponent.d.ts, dist/esm/RouterProvider.d.ts, ../router-core/dist/esm/router.d.ts (Router class methods), ../router-core/dist/esm/RouterProvider.d.ts (NavigateFn signature), ../router-core/dist/esm/redirect.d.ts, ../router-core/dist/esm/not-found.d.ts
- **Verified by:** bc-deepen-contract pass 31 (deepen-stream-2, 2026-06-24T01:50:48Z)

Notes: First true deepen pass since 2026-04-13 baseline (drift-by-staleness pickup at 73 days stale). Minor drift since baseline (v1.168.19 -> v1.170.16) added reactive read-only hook return extensions (useRouter, useCanGoBack) but no new throw-bearing functions. The 15 contracted functions still cover 100% of the user-facing throw surface. File-based routing factories (createFileRoute, createRootRoute, createRouteMask) share createRoute's error semantics — covered via the existing createRoute contract. Router class instance methods (router.navigate, router.load, router.invalidate, router.preloadRoute) share the navigate/loader/preload semantics already contracted via the useNavigate/useLoaderData hooks — same throw paths, same required handling. redirect() and notFound() are router-internal control-flow markers (designed to be thrown to be caught by router internals); user code is expected to let them propagate — adding postconditions would create false positives. last_verified bumped to 2026-06-24; coverage_score stays at 1.0.

## 2026-06-18 — re-verified clean

- **Latest published:** @tanstack/react-router@1.170.16
- **Profile semver:** `>=1.0.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @tanstack/react-router@1.170.16
- **Profile semver:** >=1.0.0 <2.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @tanstack/react-router@1.170.15
- **Profile semver:** `>=1.0.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @tanstack/react-router@1.170.15
- **Profile semver:** `>=1.0.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @tanstack/react-router@1.170.15
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-13 — backfilled

- **Verified against:** @tanstack/react-router@>=1.0.0 <2.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
