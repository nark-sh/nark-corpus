# CHANGELOG — @aws-sdk/client-sns

## 2026-06-25 — re-verified clean

- **Latest published:** @aws-sdk/client-sns@3.1075.0
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-24 — deepen pass — coverage 80% → 86%

- **Profile:** `packages/@aws-sdk/client-sns/contract.yaml`
- **Functions added:** PublishCommand, ConfirmSubscriptionCommand (2 total)
- **Postconditions added:** 4
  - `sns-publish-endpoint-disabled-not-handled` (PublishCommand — EndpointDisabled / PlatformApplicationDisabled routing to device-deregistration flow)
  - `sns-publish-kms-error-not-handled` (PublishCommand — KMS error family split from AuthorizationError)
  - `sns-confirm-subscription-replay-limit-exceeded` (ConfirmSubscriptionCommand — replay token must trigger re-subscription)
  - `sns-confirm-subscription-token-invalid-not-handled` (ConfirmSubscriptionCommand — expired-token "please re-subscribe" UX)
- **Functions intentionally omitted this pass:** none new (CreatePlatformEndpointCommand still omitted — generic SNSServiceException profile, niche SaaS adoption; see prior-pass omission rationale)
- **Scanner concerns queued:** 4 (`concern-20260624-aws-sns-deepen-4`, `-5`, `-6`, `-7`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://docs.aws.amazon.com/sns/latest/api/API_Publish.html
  - https://docs.aws.amazon.com/sns/latest/dg/sns-mobile-application-as-subscriber.html
  - https://docs.aws.amazon.com/sns/latest/api/API_SetEndpointAttributes.html
  - https://docs.aws.amazon.com/sns/latest/dg/sns-server-side-encryption.html
  - https://docs.aws.amazon.com/kms/latest/developerguide/services-sns.html
  - https://docs.aws.amazon.com/sns/latest/api/API_ConfirmSubscription.html
  - https://docs.aws.amazon.com/sns/latest/dg/SendMessageToHttp.html
- **@throws lists confirmed from:** `dist-types/commands/PublishCommand.d.ts` and `dist-types/commands/ConfirmSubscriptionCommand.d.ts` in @aws-sdk/client-sns@3.1075.0
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 37, drift-by-staleness, 2026-06-24)

## 2026-06-18 — re-verified clean

- **Latest published:** @aws-sdk/client-sns@3.1072.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @aws-sdk/client-sns@3.1070.0
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @aws-sdk/client-sns@3.1069.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @aws-sdk/client-sns@3.1069.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @aws-sdk/client-sns@3.1068.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @aws-sdk/client-sns@>=3.0.0 <4.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
