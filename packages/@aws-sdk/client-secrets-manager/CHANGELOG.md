# Changelog — @aws-sdk/client-secrets-manager

Created by bc-deepen-contract Phase 6.4 — pre-CHANGELOG history not preserved.

## 2026-06-12 — deepen pass — coverage 50% → 71%

- **Profile:** `packages/@aws-sdk/client-secrets-manager/contract.yaml`
- **Functions added:** DescribeSecretCommand, ReplicateSecretToRegionsCommand, ValidateResourcePolicyCommand, TagResourceCommand, GetRandomPasswordCommand (5 total)
- **Postconditions added:** 12 (3 per DescribeSecretCommand + 3 per ReplicateSecretToRegionsCommand + 2 per ValidateResourcePolicyCommand + 2 per TagResourceCommand + 1 per GetRandomPasswordCommand)
- **Functions intentionally omitted this pass:** ListSecretsCommand / ListSecretVersionIdsCommand (read-only pagination), GetResourcePolicyCommand / DeleteResourcePolicyCommand (admin reads/idempotent deletes paired with PutResourcePolicy already contracted), UntagResourceCommand (idempotent inverse of TagResourceCommand - missing tags do not throw), RemoveRegionsFromReplicationCommand / StopReplicationToReplicaCommand (replication admin paired with ReplicateSecretToRegions — per-region success/failure on same response.ReplicationStatus shape, generic SecretsManagerServiceException covers their throws)
- **Scanner concerns queued:** 5 (`concern-20260612-aws-sdk-client-secrets-manager-deepen-1` through `-5`)
- **Scanner version used:** nark@3.0.0 (from nark-dev/nark/package.json)
- **Sources fetched:**
  - https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_DescribeSecret.html
  - https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_ReplicateSecretToRegions.html
  - https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_ValidateResourcePolicy.html
  - https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_TagResource.html
  - https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetRandomPassword.html
  - https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html
  - https://docs.aws.amazon.com/secretsmanager/latest/userguide/create-manage-multi-region-secrets.html
  - https://docs.aws.amazon.com/secretsmanager/latest/userguide/reference_limits.html (per-secret tag quota: max 50)
  - @aws-sdk/client-secrets-manager@3.989.0 dist-types/commands/*.d.ts (@throws annotations)
  - @aws-sdk/client-secrets-manager@3.989.0 dist-types/models/models_0.d.ts (ReplicationStatusType, ValidateResourcePolicyResponse, ValidationErrorsEntry shapes)
- **Verified by:** bc-deepen-contract (pass on 2026-06-12T02:35:08Z)

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
