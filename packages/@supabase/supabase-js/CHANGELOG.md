# CHANGELOG — @supabase/supabase-js

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
