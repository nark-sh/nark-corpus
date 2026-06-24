# CHANGELOG — pusher

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 83% → 100%

- **Profile:** `packages/pusher/contract.yaml`
- **Functions added:** none — re-verified pusher@5.3.4 API surface (6 async-callable methods, all already contracted)
- **Postconditions added:** 2 on `trigger()`
  - `trigger-encrypted-multi-channel-error` — sync plain Error from `lib/events.js:36-44` when multi-channel array contains a `private-encrypted-*` channel
  - `trigger-encryption-master-key-missing` — sync plain Error from `lib/events.js:6-10` when Pusher constructor lacks `encryptionMasterKeyBase64` but encrypted channel targeted
- **Functions intentionally omitted this pass:** authenticate, authorizeChannel, authenticateUser, webhook, createSignedQueryString, forCluster, forURL (all synchronous — no Promise-rejection contract)
- **Scanner concerns queued:** 2 (`concern-20260624-pusher-deepen-1`, `concern-20260624-pusher-deepen-2`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://github.com/pusher/pusher-http-node/blob/master/lib/events.js
  - https://pusher.com/docs/channels/using_channels/encrypted-channels/
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T09:17:23Z, deepen-stream-3)


## 2026-06-18 — re-verified clean

- **Latest published:** pusher@5.3.4
- **Profile semver:** `^5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** pusher@5.3.4
- **Profile semver:** ^5.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** pusher@5.3.4
- **Profile semver:** `^5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** pusher@5.3.4
- **Profile semver:** `^5.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** pusher@5.3.4
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-11 — backfilled

- **Verified against:** pusher@^5.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
