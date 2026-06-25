# CHANGELOG — @aws-sdk/client-lambda

## 2026-06-25 — re-verified clean

- **Latest published:** @aws-sdk/client-lambda@3.1075.0
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 82% → 86%

- **Profile:** `packages/@aws-sdk/client-lambda/contract.yaml`
- **Package version verified against:** @aws-sdk/client-lambda@3.1075.0
- **Functions added:** send (AddPermissionCommand), send (PublishVersionCommand), send (CreateFunctionUrlConfigCommand) (3 total)
- **Postconditions added:** 5 (aws-lambda-add-permission-no-error-handling, aws-lambda-add-permission-policy-length-exceeded, aws-lambda-publish-version-no-error-handling, aws-lambda-function-url-no-error-handling; AddPermission carries 2 postconditions)
- **Functions intentionally omitted this pass:** InvokeAsyncCommand (deprecated legacy async API), DeleteFunctionCommand (admin-only destructive op). 70+ other command paths covered by the generic send postcondition.
- **Scanner concerns queued:** 4 (`concern-20260624-aws-sdk-client-lambda-deepen-9` AddPermission generic, `-10` AddPermission PolicyLengthExceededException specific, `-11` PublishVersion generic, `-12` CreateFunctionUrlConfig generic)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://docs.aws.amazon.com/lambda/latest/api/API_AddPermission.html, https://docs.aws.amazon.com/lambda/latest/api/API_PublishVersion.html, https://docs.aws.amazon.com/lambda/latest/api/API_CreateFunctionUrlConfig.html, https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html, https://docs.aws.amazon.com/lambda/latest/dg/urls-configuration.html, @aws-sdk/client-lambda@3.1075.0 TypeScript declarations (dist-types/commands/*Command.d.ts @throws annotations)
- **Verified by:** bc-deepen-contract (pass 34, deepen-stream-3, 2026-06-24T03:32:49Z)
- **Notes:** Re-deepen of a profile last deepened 2026-04-16. The contract correctly treats most of the 86-command SDK surface via the generic `aws-lambda-service-error` rule on `lambdaClient.send()`. This pass adds command-specific postconditions for 3 commands whose throw set is materially distinct from the generic rule: AddPermission (PolicyLengthExceededException is silent operational failure; PublicPolicyException is security guardrail), PublishVersion (CodeStorageExceededException is silent rollout-wide failure; FunctionVersionsPerCapacityProviderLimitExceededException is new in v3.1075.0), CreateFunctionUrlConfig (AuthType=NONE is security-critical public exposure literal). All 24 existing ground-truth tests pass after additions.

## 2026-06-18 — re-verified clean

- **Latest published:** @aws-sdk/client-lambda@3.1072.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @aws-sdk/client-lambda@3.1070.0
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @aws-sdk/client-lambda@3.1069.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @aws-sdk/client-lambda@3.1069.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @aws-sdk/client-lambda@3.1068.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @aws-sdk/client-lambda@>=3.0.0 <4.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
