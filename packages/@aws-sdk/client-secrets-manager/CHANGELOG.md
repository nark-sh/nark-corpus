# Changelog — @aws-sdk/client-secrets-manager

Created by bc-deepen-contract Phase 6.4 — pre-CHANGELOG history not preserved.

## 2026-06-11 — deepen pass — coverage 33% → 50%

- **Profile:** `packages/@aws-sdk/client-secrets-manager/contract.yaml`
- **Functions added:** UpdateSecretVersionStageCommand, CancelRotateSecretCommand, PutResourcePolicyCommand, RestoreSecretCommand (4 total)
- **Postconditions added:** 11 (3 per UpdateSecretVersionStageCommand + 2 per CancelRotateSecretCommand + 3 per PutResourcePolicyCommand + 2 per RestoreSecretCommand)
- **Functions intentionally omitted this pass:** DescribeSecretCommand (read-only), ListSecretsCommand (pagination), ListSecretVersionIdsCommand (pagination), GetResourcePolicyCommand (read-only), DeleteResourcePolicyCommand (idempotent admin), ValidateResourcePolicyCommand (validation utility), GetRandomPasswordCommand (pure utility), TagResourceCommand/UntagResourceCommand (tagging admin), ReplicateSecretToRegionsCommand/RemoveRegionsFromReplicationCommand/StopReplicationToReplicaCommand (DR infrastructure) — no unique behavioral contracts beyond generic error handling
- **Scanner concerns queued:** 4 (`concern-20260611-aws-sdk-client-secrets-manager-deepen-5` through `-8`)
- **Scanner version used:** nark@1.0.5 (from nark-dev/nark/package.json)
- **Sources fetched:**
  - https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_UpdateSecretVersionStage.html
  - https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_CancelRotateSecret.html
  - https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_PutResourcePolicy.html
  - https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_RestoreSecret.html
  - https://docs.aws.amazon.com/secretsmanager/latest/userguide/reference_limits.html (staging labels quota: max 20)
- **Verified by:** bc-deepen-contract (pass on 2026-06-11T20:07:43Z)
