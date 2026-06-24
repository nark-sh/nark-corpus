# Changelog — @aws-sdk/client-secrets-manager

Created by bc-deepen-contract Phase 6.4 — pre-CHANGELOG history not preserved.

## 2026-06-24 — deepen pass — coverage 71% → 79%

- **Profile:** `packages/@aws-sdk/client-secrets-manager/contract.yaml`
- **Functions added:** UntagResourceCommand, StopReplicationToReplicaCommand (2 total)
- **Postconditions added:** 4 (untag-resource-self-lockout + untag-resource-no-try-catch; stop-replication-wrong-region-invocation + stop-replication-no-try-catch)
- **Pattern catalog match:** parity-gap fills.
  - UntagResourceCommand pairs with already-contracted TagResourceCommand. The 2026-06-12 omission rationale ("idempotent inverse — missing tags do not throw") was technically correct for the idempotent case but missed the AccessDeniedException self-lockout case documented in the operation description: removing a tag whose key participates in an IAM policy condition that grants the caller access locks the caller out of subsequent operations on the same secret.
  - StopReplicationToReplicaCommand pairs with already-contracted ReplicateSecretToRegionsCommand. The 2026-06-12 omission rationale ("per-region success/failure on the same response.ReplicationStatus shape") treated the replication-admin commands as symmetric. They are not: StopReplicationToReplica is an IRREVERSIBLE promotion of a replica to a primary and must be invoked from the replica Region (InvalidRequestException otherwise). Distinct behavioral contract worth tracking — split-brain risk in disaster-recovery automation.
- **Functions intentionally omitted (5 remaining):** ListSecretsCommand / ListSecretVersionIdsCommand (read-only pagination), GetResourcePolicyCommand (read-only GET paired with PutResourcePolicy), DeleteResourcePolicyCommand (admin delete paired with PutResourcePolicy — revisit if real-world usage emerges), RemoveRegionsFromReplicationCommand (per-region failures surface in response.ReplicationStatus[] already covered by replicate-secret-per-region-failure-unchecked).
- **Scanner concerns queued:** 2 (`concern-20260624-aws-secrets-manager-deepen-1`, `concern-20260624-aws-secrets-manager-deepen-2`)
- **Scanner version used:** nark@3.2.0 (from nark-dev/nark/package.json)
- **Sources fetched:**
  - https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_UntagResource.html
  - https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_StopReplicationToReplica.html
  - https://docs.aws.amazon.com/secretsmanager/latest/userguide/auth-and-access_examples.html
  - @aws-sdk/client-secrets-manager dist-types/commands/UntagResourceCommand.d.ts (@throws annotations)
  - @aws-sdk/client-secrets-manager dist-types/commands/StopReplicationToReplicaCommand.d.ts (@throws annotations)
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 83 on 2026-06-24T13:47:46Z)

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
