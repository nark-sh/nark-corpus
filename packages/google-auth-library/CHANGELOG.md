# CHANGELOG — google-auth-library

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass (drift-mode)

- **Latest published:** google-auth-library@10.7.0
- **Profile semver:** `>=8.0.0 <11.0.0` (unchanged)
- **Coverage:** 0.79 (15/19) → 0.95 (18/19)
- **Scanner version used:** nark@latest
- **Pass:** deepen-stream-3 pass 36 (drift-by-staleness — profile last deepened 2026-04-16)
- **Functions added:**
  - `OAuth2Client.revokeToken` — postcondition `revoke-token-unprotected`
    covers the logout-flow case where a 400 invalid_token (already-revoked token)
    or GaxiosError on the OAuth2 revoke endpoint crashes the route AFTER the
    session was cleared. Source: oauth2client.js lines 411-426.
  - `OAuth2Client.revokeCredentials` — postcondition `revoke-credentials-unprotected`
    covers the two-shape throw: synchronous-via-promise `Error('No access token
    to revoke.')` when credentials are empty, plus all the GaxiosError modes
    from revokeToken. Notes the half-state bug: this.credentials is cleared
    BEFORE the network call, so a failed revoke leaves local state cleared
    but server-side token still valid. Source: oauth2client.js lines 427-443.
  - `Impersonated.sign` — postcondition `impersonated-sign-unprotected` covers
    the IAM signBlob endpoint with its distinct quota and error semantics
    (403 PERMISSION_DENIED for missing roles/iam.serviceAccountTokenCreator,
    404 NOT_FOUND for missing target SA, 400 INVALID_ARGUMENT for blobs >64KB,
    429 RESOURCE_EXHAUSTED on the 60-req/min default IAM quota). Distinct from
    Impersonated.fetchIdToken because Impersonated.sign does NOT wrap errors
    with the 'unable to impersonate' message prefix that refreshToken/fetchIdToken
    use. Source: impersonated.js lines 102-117.
- **Omitted (still):** getFederatedSignonCerts/getIapPublicKeys (internal auth
  infra, transitively covered by verifyIdToken), getRequestHeaders/authorizeRequest/
  request/fetch (pass-through wrappers).
- **Source version inspected:** build/src from google-auth-library@10.7.0
  installed in /tmp/claude/bc-deepen/google-auth-library.
- **Verified by:** bc-deepen-contract (deepen-stream-3, pass 36, drift-mode)


## 2026-06-18 — re-verified clean

- **Latest published:** google-auth-library@10.7.0
- **Profile semver:** `>=8.0.0 <11.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** google-auth-library@10.7.0
- **Profile semver:** >=8.0.0 <11.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** google-auth-library@10.7.0
- **Profile semver:** `>=8.0.0 <11.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** google-auth-library@10.7.0
- **Profile semver:** `>=8.0.0 <11.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** google-auth-library@10.7.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** google-auth-library@>=8.0.0 <11.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
