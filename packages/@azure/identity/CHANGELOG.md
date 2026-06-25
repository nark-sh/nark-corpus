# CHANGELOG — @azure/identity

## 2026-06-25 — re-verified clean

- **Latest published:** @azure/identity@4.13.1
- **Profile semver:** >=3.0.0 <5.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% (3/3) → 100% (4/4)

- **Profile:** `packages/@azure/identity/contract.yaml`
- **Functions added:** DeviceCodeCredential.authenticate (1 total)
- **Postconditions added:** 1 (`device-code-authenticate-no-try-catch`)
- **Functions intentionally omitted this pass:** none (synchronous helpers and the 18+ credential classes' `getToken()` methods stay covered under the universal `credential.getToken()` postcondition)
- **Scanner concerns queued:** 1 (`concern-20260624-azure-identity-deepen-3` — distinguish per-credential-class `.authenticate()` dispatch so DeviceCodeCredential vs InteractiveBrowserCredential map to their respective postconditions instead of the matcher falling back to method-name only)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://learn.microsoft.com/en-us/javascript/api/@azure/identity/devicecodecredential?view=azure-node-latest, https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/identity/identity/src/credentials/deviceCodeCredential.ts, https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-device-code
- **Rationale:** drift-by-staleness sweep — prior deepen was 2026-04-16 (oldest in deepen-index). Re-enumeration of @azure/identity@4.13.1 dist/commonjs/credentials/*.d.ts surfaced one uncovered async method: `DeviceCodeCredential.authenticate()`. Microsoft docs explicitly state CredentialUnavailableError is thrown on failure; most common production cause is device code expiry from user inattention (15-min default TTL). Signature mirrors InteractiveBrowserCredential.authenticate(): `Promise<AuthenticationRecord | undefined>`.
- **Verified by:** bc-deepen-contract (pass 45 on 2026-06-24T06:09:39Z, deepen-stream-3)

## 2026-06-18 — re-verified clean

- **Latest published:** @azure/identity@4.13.1
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @azure/identity@4.13.1
- **Profile semver:** >=3.0.0 <5.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @azure/identity@4.13.1
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @azure/identity@4.13.1
- **Profile semver:** `>=3.0.0 <5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @azure/identity@4.13.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — semver range extended

- **Latest published:** @azure/identity@4.13.1
- **Profile semver:** `^3.0.0` → `>=3.0.0 <5.0.0`
- **Verdict:** no error-handling-relevant changes between v3 and v4 — v4 added WAM broker support and dropped Node 16; no error class or getToken throw pattern changes
- **Changelog evidence:** v4.0.0: "Node.js v20 supported, v16 no longer supported", broker authentication added — no changes to AuthenticationError, CredentialUnavailableError patterns
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-16 — backfilled

- **Verified against:** @azure/identity@^3.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
