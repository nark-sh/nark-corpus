# CHANGELOG — @auth0/nextjs-auth0

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 83% → 88%

- **Profile:** `packages/@auth0/nextjs-auth0/contract.yaml`
- **Functions added:** Auth0Client.passkey.register, Auth0Client.passkey.challenge, Auth0Client.passkey.getToken, Auth0Client.passkey.enrollmentChallenge, Auth0Client.passkey.enrollmentVerify, Auth0Client.passwordless.start, Auth0Client.passwordless.verify (7 total)
- **Postconditions added:** 9 (passkey-register-not-enabled, passkey-challenge-no-credential, passkey-gettoken-mfa-required [v4.23 BREAKING], passkey-gettoken-invalid-assertion, passkey-enrollment-challenge-missing-scope, passkey-enrollment-verify-duplicate-or-rejected, passwordless-start-rate-limit-or-disabled, passwordless-verify-mfa-required [v4.23 BREAKING], passwordless-verify-invalid-otp)
- **Functions intentionally omitted this pass:** createFetcher (wraps getAccessToken, covered), startInteractiveLogin (returns redirect, no distinct contract), connectAccount (low adoption, parallels getAccessTokenForConnection)
- **Scanner concerns queued:** 9 (`concern-20260624-auth0-nextjs-auth0-deepen-1` through `-9`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://raw.githubusercontent.com/auth0/nextjs-auth0/main/CHANGELOG.md (v4.21.0 / v4.22.0 / v4.23.0 release entries)
  - https://github.com/auth0/nextjs-auth0/pull/2634 (Passwordless implementation)
  - https://github.com/auth0/nextjs-auth0/pull/2676 (Passkey implementation)
  - https://github.com/auth0/nextjs-auth0/pull/2680 (Passkey enrollment via MyAccount)
  - https://github.com/auth0/nextjs-auth0/pull/2702 (v4.23 BREAKING — MfaRequiredError surfaced from passkeyGetToken + passwordlessVerify)
  - node_modules/@auth0/nextjs-auth0@4.23.0 typescript declarations (`dist/types/passkey.d.ts`, `dist/types/passwordless.d.ts`, `dist/server/client.d.ts`, `dist/errors/passkey-errors.d.ts`, `dist/errors/passwordless-errors.d.ts`, `dist/server/auth-client.js`)
- **contract_version:** bumped 2.0.0 → 2.1.0
- **Verified by:** bc-deepen-contract (pass 38 on 2026-06-24T03:16:32Z, drift-by-staleness mode)

## 2026-06-18 — re-verified clean

- **Latest published:** @auth0/nextjs-auth0@4.22.0
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @auth0/nextjs-auth0@4.22.0
- **Profile semver:** >=2.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @auth0/nextjs-auth0@4.22.0
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @auth0/nextjs-auth0@4.22.0
- **Profile semver:** `>=2.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @auth0/nextjs-auth0@4.22.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @auth0/nextjs-auth0@>=2.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
