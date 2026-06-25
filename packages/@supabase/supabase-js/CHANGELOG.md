# CHANGELOG — @supabase/supabase-js

## 2026-06-25 — deepen pass — coverage 84% → 100%

- **Profile:** `packages/@supabase/supabase-js/contract.yaml`
- **Functions added:** auth.getUserIdentities, auth.linkIdentity, auth.unlinkIdentity, storage.update, storage.createSignedUploadUrl, storage.uploadToSignedUrl (6 total)
- **Postconditions added:** 12 (2 per new function avg: auth-get-identities-no-session, auth-link-identity-already-exists, auth-link-identity-manual-linking-disabled, auth-unlink-identity-single-identity, auth-unlink-identity-email-conflict, storage-update-not-found, storage-update-unauthorized, storage-create-signed-upload-url-no-token, storage-create-signed-upload-url-unauthorized, storage-upload-to-signed-url-expired-token, storage-upload-to-signed-url-unauthorized — note: auth.getUserIdentities has 1 postcondition)
- **Coverage:** 22/25 (84%) → 28/28 (100%) effective and raw
- **Scanner concerns queued:** 6 (concern-20260625-supabase-js-deepen-1 through concern-20260625-supabase-js-deepen-6)
- **Contract version:** 1.0.0 → 1.1.0
- **Sources fetched:** GoTrueClient.d.ts + GoTrueClient.js (@supabase/auth-js@2.x, bundled in supabase-js@2.108.2); storage-js/dist/index.cjs (@supabase/storage-js, bundled in supabase-js@2.108.2); https://supabase.com/docs/reference/javascript/auth-getuseridentities; https://supabase.com/docs/reference/javascript/auth-linkidentity; https://supabase.com/docs/reference/javascript/auth-unlinkidentity; https://supabase.com/docs/guides/auth/debugging/error-codes; https://supabase.com/docs/reference/javascript/storage-from-update; https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl; https://supabase.com/docs/reference/javascript/storage-from-uploadtosignedurl
- **Key data-loss finding:** auth.unlinkIdentity with single identity on password-less account causes permanent user lockout (single_identity_not_deletable — DATA_LOSS incident_label, high cost)
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 1 on 2026-06-25)

## 2026-06-25 — re-verified clean

- **Latest published:** @supabase/supabase-js@2.108.2
- **Profile semver:** >=2.0.0 <3.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 62% → 84%

- **Profile:** `packages/@supabase/supabase-js/contract.yaml`
- **Functions added:** signInWithOtp, verifyOtp, getUser, updateUser, refreshSession, exchangeCodeForSession, storage.download, storage.createSignedUrl (8 total)
- **Postconditions added:** 18
- **Functions intentionally omitted this pass:** signInAnonymously (low adoption guest flow), signInWithIdToken (Apple/Google native — less common), signInWithSSO (enterprise only), signInWithWeb3 / signInWithPasskey / registerPasskey (new/experimental in 2.x), resend (covered by signInWithOtp rate-limit guidance), reauthenticate (companion to updateUser, covered via reauthentication_needed branch), setSession (server-side wrapper around getSession), storage.move/copy/list/remove (lower priority builder methods), storage.createBucket/deleteBucket (admin operations), removeChannel/removeAllChannels (realtime cleanup, low error severity)
- **Scanner concerns queued:** 8 (concern-20260623-supabase-supabase-js-deepen-stream3-pass11-1 through concern-20260623-supabase-supabase-js-deepen-stream3-pass11-8)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:** https://supabase.com/docs/reference/javascript/auth-signinwithotp, https://supabase.com/docs/reference/javascript/auth-verifyotp, https://supabase.com/docs/reference/javascript/auth-getuser, https://supabase.com/docs/guides/auth/server-side/nextjs, https://supabase.com/docs/reference/javascript/auth-updateuser, https://supabase.com/docs/reference/javascript/auth-refreshsession, https://supabase.com/docs/reference/javascript/auth-exchangecodeforsession, https://supabase.com/docs/guides/auth/server-side/oauth-with-pkce-flow-for-ssr, https://supabase.com/docs/reference/javascript/storage-from-download, https://supabase.com/docs/reference/javascript/storage-from-createsignedurl. Type signatures verified against supabase-js@2.108.2 (GoTrueClient.d.ts + storage-js/dist/index.d.cts).
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 11 on 2026-06-23T22:05:35Z)

## 2026-06-18 — re-verified clean

- **Latest published:** @supabase/supabase-js@2.108.2
- **Profile semver:** `>=2.0.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @supabase/supabase-js@2.108.2
- **Profile semver:** >=2.0.0 <3.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @supabase/supabase-js@2.108.2
- **Profile semver:** `>=2.0.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @supabase/supabase-js@2.108.2
- **Profile semver:** `>=2.0.0 <3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @supabase/supabase-js@2.108.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-02 — backfilled

- **Verified against:** @supabase/supabase-js@>=2.0.0 <3.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
