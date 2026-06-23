# CHANGELOG — axios

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 91% → 100%

- **Profile:** `packages/axios/contract.yaml`
- **Functions added:** query (1 total)
- **Postconditions added:** 4 (query-error-4xx-5xx, query-method-not-allowed-405, query-rate-limited-429, query-network-failure)
- **Edge cases added:** 2 (query-no-queryform-shorthand, query-upstream-support-uneven)
- **Functions intentionally omitted this pass:** options (CORS preflight handled automatically by the browser; rarely called explicitly from Node.js application code; error profile identical to get/delete/head)
- **Scanner concerns queued:** 0 — scanner already detects axios.query() via the existing class-method detection path (no new rule required; ground-truth tests confirm)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://github.com/axios/axios/pull/10802, https://github.com/axios/axios/pull/10680, https://www.ietf.org/archive/id/draft-ietf-httpbis-safe-method-w-body-09.html, https://axios-http.com/docs/handling_errors, /tmp/claude-501/bc-deepen-stream3/node_modules/axios/CHANGELOG.md (v1.16.0 release notes), /tmp/claude-501/bc-deepen-stream3/node_modules/axios/index.d.ts (v1.18.1), /tmp/claude-501/bc-deepen-stream3/node_modules/axios/lib/core/Axios.js (v1.18.1)
- **Drift detected:** axios v1.16.0 (2026-05-02) introduced the QUERY HTTP method (PR #10802) per draft-ietf-httpbis-safe-method-w-body. axios.query() and instance.query() are now first-class API surface, identical generation pattern to post/put/patch (lib/core/Axios.js:256-281), no queryForm shorthand by design. Profile was 82 days stale (last_deepened 2026-04-02) so this method was missed by bc-version-drift's semver-range check. v1.16.0 also added AxiosError.ECONNREFUSED static constant (PR #10680) — referenced in the new query-network-failure postcondition description so callers can match the constant instead of string-compare on error.code.
- **Verified by:** bc-deepen-contract (pass 14 on 2026-06-23T23:05:00Z)

- **Latest published:** axios@1.18.0
- **Profile semver:** `>=1.0.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** axios@1.18.0
- **Profile semver:** >=1.0.0 <2.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** axios@1.18.0
- **Profile semver:** `>=1.0.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** axios@1.18.0
- **Profile semver:** `>=1.0.0 <2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** axios@1.18.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-06 — backfilled

- **Verified against:** axios@>=1.0.0 <2.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
