/**
 * Ground-truth fixture for @aws-sdk/client-lambda
 *
 * Annotations placed DIRECTLY before the violating call site.
 * The line number stored is the line of the awaited send() call.
 *
 * Postcondition IDs:
 *   aws-lambda-service-error                         (LambdaClient.send — all commands)
 *   aws-lambda-invoke-function-error-unchecked        (InvokeCommand — FunctionError not checked)
 *   aws-lambda-stream-no-error-handling               (InvokeWithResponseStreamCommand — no try-catch)
 *   aws-lambda-stream-invokecomplete-errorcode-unchecked (InvokeWithResponseStream — ErrorCode not checked)
 *   aws-lambda-waiter-no-error-handling               (waitUntilFunctionActive — no try-catch)
 *   aws-lambda-update-waiter-no-error-handling        (waitUntilFunctionUpdated — no try-catch)
 *   aws-lambda-create-no-error-handling               (CreateFunctionCommand — no try-catch)
 *   aws-lambda-update-code-no-error-handling          (UpdateFunctionCodeCommand — no try-catch)
 *   aws-lambda-update-code-precondition-failed        (UpdateFunctionCodeCommand — RevisionId race)
 *   aws-lambda-update-config-no-error-handling        (UpdateFunctionConfigurationCommand — no try-catch)
 *   aws-lambda-published-version-waiter-no-error-handling (waitUntilPublishedVersionActive — no try-catch)
 *   aws-lambda-event-source-mapping-no-error-handling (CreateEventSourceMappingCommand — no try-catch)
 *   aws-lambda-add-permission-no-error-handling       (AddPermissionCommand — no try-catch)
 *   aws-lambda-add-permission-policy-length-exceeded  (AddPermissionCommand — PolicyLengthExceededException not handled)
 *   aws-lambda-publish-version-no-error-handling      (PublishVersionCommand — no try-catch)
 *   aws-lambda-function-url-no-error-handling         (CreateFunctionUrlConfigCommand — no try-catch)
 */
import {
  LambdaClient,
  InvokeCommand,
  InvokeWithResponseStreamCommand,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
  CreateFunctionCommand,
  CreateEventSourceMappingCommand,
  DeleteFunctionCommand,
  AddPermissionCommand,
  PublishVersionCommand,
  CreateFunctionUrlConfigCommand,
  UpdateFunctionUrlConfigCommand,
  GetPolicyCommand,
  LambdaServiceException,
} from '@aws-sdk/client-lambda';
import {
  waitUntilFunctionActive,
  waitUntilFunctionActiveV2,
  waitUntilFunctionUpdated,
  waitUntilFunctionUpdatedV2,
  waitUntilPublishedVersionActive,
} from '@aws-sdk/client-lambda';

const lambdaClient = new LambdaClient({ region: 'us-east-1' });
const FUNCTION_ARN = 'arn:aws:lambda:us-east-1:123456789:function:my-function';

// ──────────────────────────────────────────────────
// 1. InvokeCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_invoke_missing(payload: unknown) {
  // SHOULD_FIRE: aws-lambda-service-error — InvokeCommand without try-catch
  const response = await lambdaClient.send(new InvokeCommand({
    FunctionName: FUNCTION_ARN,
    Payload: Buffer.from(JSON.stringify(payload)),
  }));
  return response.Payload;
}

// 1. InvokeCommand — with try/catch (SHOULD_NOT_FIRE)
async function gt_invoke_safe(payload: unknown) {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    const response = await lambdaClient.send(new InvokeCommand({
      FunctionName: FUNCTION_ARN,
      Payload: Buffer.from(JSON.stringify(payload)),
    }));
    return response.Payload;
  } catch (error) {
    if (error instanceof LambdaServiceException) {
      console.error(`Lambda error [${error.name}]: ${error.message}`);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 2. UpdateFunctionCodeCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_updateCode_missing(zipBuffer: Uint8Array) {
  // SHOULD_FIRE: aws-lambda-service-error — UpdateFunctionCodeCommand without try-catch
  await lambdaClient.send(new UpdateFunctionCodeCommand({
    FunctionName: FUNCTION_ARN,
    ZipFile: zipBuffer,
  }));
}

// 2. UpdateFunctionCodeCommand — with try/catch (SHOULD_NOT_FIRE)
async function gt_updateCode_safe(zipBuffer: Uint8Array) {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    await lambdaClient.send(new UpdateFunctionCodeCommand({
      FunctionName: FUNCTION_ARN,
      ZipFile: zipBuffer,
    }));
  } catch (error) {
    console.error('Failed to update function code:', error);
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 3. DeleteFunctionCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_deleteFunction_missing() {
  // SHOULD_FIRE: aws-lambda-service-error — DeleteFunctionCommand without try-catch
  await lambdaClient.send(new DeleteFunctionCommand({
    FunctionName: FUNCTION_ARN,
  }));
}

// 3. DeleteFunctionCommand — with try/catch (SHOULD_NOT_FIRE, idempotent pattern)
async function gt_deleteFunction_safe() {
  try {
    // SHOULD_NOT_FIRE: send has try-catch
    await lambdaClient.send(new DeleteFunctionCommand({
      FunctionName: FUNCTION_ARN,
    }));
  } catch (error) {
    if (error instanceof LambdaServiceException && error.name === 'ResourceNotFoundException') {
      return; // Already deleted
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 4. InvokeCommand — FunctionError not checked (NOTE: needs new scanner detection rule)
// aws-lambda-invoke-function-error-unchecked is a silent-failure pattern (HTTP 200, no throw)
// The existing scanner detects try-catch absence but not missing FunctionError checks.
// This function has try-catch so aws-lambda-service-error should NOT fire.
// Detection for invoke-function-error-unchecked is queued as scanner concern.
async function gt_invoke_function_error_unchecked(payload: unknown) {
  // SHOULD_NOT_FIRE: has try-catch (aws-lambda-service-error covered), FunctionError check omitted intentionally
  // No SHOULD_FIRE annotation here — scanner rule for FunctionError-unchecked not yet implemented
  try {
    const response = await lambdaClient.send(new InvokeCommand({
      FunctionName: FUNCTION_ARN,
      Payload: Buffer.from(JSON.stringify(payload)),
    }));
    // Missing check: if (response.FunctionError) — needs new scanner rule
    return JSON.parse(Buffer.from(response.Payload!).toString());
  } catch (error) {
    throw error;
  }
}

// 4. InvokeCommand — FunctionError properly checked (SHOULD_NOT_FIRE)
async function gt_invoke_function_error_checked(payload: unknown) {
  try {
    const response = await lambdaClient.send(new InvokeCommand({
      FunctionName: FUNCTION_ARN,
      Payload: Buffer.from(JSON.stringify(payload)),
    }));
    // SHOULD_NOT_FIRE: FunctionError is checked
    if (response.FunctionError) {
      const errorPayload = JSON.parse(Buffer.from(response.Payload!).toString());
      throw new Error(`Lambda function error: ${response.FunctionError} — ${errorPayload.errorMessage}`);
    }
    return JSON.parse(Buffer.from(response.Payload!).toString());
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 5. InvokeWithResponseStreamCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// NOTE: scanner fires aws-lambda-service-error (generic send rule) for missing try-catch.
// aws-lambda-stream-no-error-handling (stream-specific postcondition) requires new scanner rule.
async function gt_stream_missing_try_catch(payload: unknown) {
  // SHOULD_FIRE: aws-lambda-service-error — InvokeWithResponseStreamCommand without try-catch
  const response = await lambdaClient.send(new InvokeWithResponseStreamCommand({
    FunctionName: FUNCTION_ARN,
    Payload: Buffer.from(JSON.stringify(payload)),
  }));
  for await (const event of response.EventStream!) {
    if (event.PayloadChunk) {
      process.stdout.write(Buffer.from(event.PayloadChunk.Payload!).toString());
    }
  }
}

// 5. InvokeWithResponseStreamCommand — with try/catch but no ErrorCode check
// NOTE: aws-lambda-stream-invokecomplete-errorcode-unchecked needs new scanner detection rule
// This function has try-catch so aws-lambda-service-error should NOT fire.
async function gt_stream_missing_errorcode_check(payload: unknown) {
  try {
    const response = await lambdaClient.send(new InvokeWithResponseStreamCommand({
      FunctionName: FUNCTION_ARN,
      Payload: Buffer.from(JSON.stringify(payload)),
    }));
    for await (const event of response.EventStream!) {
      if (event.PayloadChunk) {
        process.stdout.write(Buffer.from(event.PayloadChunk.Payload!).toString());
      }
      if (event.InvokeComplete) {
        // SHOULD_NOT_FIRE: has try-catch. Missing ErrorCode check needs new scanner rule.
        // Detection for aws-lambda-stream-invokecomplete-errorcode-unchecked is queued.
      }
    }
  } catch (error) {
    throw error;
  }
}

// 5. InvokeWithResponseStreamCommand — fully correct (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_stream_with_all_checks(payload: unknown) {
  try {
    const response = await lambdaClient.send(new InvokeWithResponseStreamCommand({
      FunctionName: FUNCTION_ARN,
      Payload: Buffer.from(JSON.stringify(payload)),
    }));
    for await (const event of response.EventStream!) {
      if (event.PayloadChunk) {
        process.stdout.write(Buffer.from(event.PayloadChunk.Payload!).toString());
      }
      if (event.InvokeComplete) {
        // SHOULD_NOT_FIRE: ErrorCode is checked
        if (event.InvokeComplete.ErrorCode) {
          throw new Error(
            `Streaming function error: ${event.InvokeComplete.ErrorCode} — ${event.InvokeComplete.ErrorDetails}`
          );
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 6. waitUntilFunctionActive — no try/catch
// NOTE: aws-lambda-waiter-no-error-handling needs new scanner detection rule for waiter calls.
// Waiter functions are not client.send() calls, so existing generic rule doesn't apply.
// Scanner concern queued. These functions document the correct/incorrect usage patterns.
// ──────────────────────────────────────────────────

async function gt_wait_function_active_missing(functionName: string) {
  // Missing try-catch around waiter — TimeoutError when function stays Pending.
  // Detection gap: scanner doesn't yet detect missing try-catch on waiter calls.
  await waitUntilFunctionActiveV2(
    { client: lambdaClient, maxWaitTime: 300 },
    { FunctionName: functionName }
  );
}

// 6. waitUntilFunctionActive — with try/catch (SHOULD_NOT_FIRE)
async function gt_wait_function_active_safe(functionName: string) {
  try {
    // SHOULD_NOT_FIRE: waiter has try-catch — correct pattern
    await waitUntilFunctionActiveV2(
      { client: lambdaClient, maxWaitTime: 300 },
      { FunctionName: functionName }
    );
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      throw new Error(`Function ${functionName} did not become active within 5 minutes`);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 7. waitUntilFunctionUpdated — no try/catch
// NOTE: same detection gap as waitUntilFunctionActive — scanner concern queued.
// ──────────────────────────────────────────────────

async function gt_wait_function_updated_missing(functionName: string) {
  // Missing try-catch around update waiter — TimeoutError when update stalls.
  await waitUntilFunctionUpdatedV2(
    { client: lambdaClient, maxWaitTime: 300 },
    { FunctionName: functionName }
  );
}

// 7. waitUntilFunctionUpdated — with try/catch (SHOULD_NOT_FIRE)
async function gt_wait_function_updated_safe(functionName: string) {
  try {
    // SHOULD_NOT_FIRE: waiter has try-catch — correct pattern
    await waitUntilFunctionUpdatedV2(
      { client: lambdaClient, maxWaitTime: 300 },
      { FunctionName: functionName }
    );
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      throw new Error(`Function ${functionName} update did not complete within 5 minutes`);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 8. CreateFunctionCommand — no try/catch (SHOULD_FIRE)
// The generic aws-lambda-service-error rule covers CreateFunctionCommand missing try-catch.
// ──────────────────────────────────────────────────

async function gt_create_function_missing(
  functionName: string,
  roleArn: string,
  zipBuffer: Uint8Array
) {
  // ResourceConflictException if function already exists; CodeStorageExceededException on quota
  // SHOULD_FIRE: aws-lambda-service-error — CreateFunctionCommand without try-catch
  await lambdaClient.send(new CreateFunctionCommand({
    FunctionName: functionName,
    Runtime: 'nodejs22.x',
    Role: roleArn,
    Handler: 'index.handler',
    Code: { ZipFile: zipBuffer },
  }));
}

// 8. CreateFunctionCommand — with try/catch + ResourceConflictException handling (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_create_function_safe(
  functionName: string,
  roleArn: string,
  zipBuffer: Uint8Array
) {
  try {
    // SHOULD_NOT_FIRE: CreateFunctionCommand has try-catch
    await lambdaClient.send(new CreateFunctionCommand({
      FunctionName: functionName,
      Runtime: 'nodejs22.x',
      Role: roleArn,
      Handler: 'index.handler',
      Code: { ZipFile: zipBuffer },
    }));
  } catch (error: any) {
    if (error.name === 'ResourceConflictException') {
      // Function already exists — update code instead
      await lambdaClient.send(new UpdateFunctionCodeCommand({
        FunctionName: functionName,
        ZipFile: zipBuffer,
      }));
    } else if (error.name === 'CodeStorageExceededException') {
      throw new Error('Lambda code storage quota exceeded — delete old function versions');
    } else {
      throw error;
    }
  }
}

// ──────────────────────────────────────────────────
// 9. UpdateFunctionConfigurationCommand — no try/catch (SHOULD_FIRE)
// Covers: aws-lambda-update-config-no-error-handling
// ResourceConflictException when another update is in progress (VPC provisioning takes 60+ seconds)
// ──────────────────────────────────────────────────

// @expect-violation: aws-lambda-service-error
async function gt_update_config_missing(functionName: string) {
  // aws-lambda-update-config-no-error-handling (scanner concern queued for command-specific rule)
  await lambdaClient.send(new UpdateFunctionConfigurationCommand({
    FunctionName: functionName,
    Timeout: 30,
    MemorySize: 512,
    Environment: { Variables: { KEY: 'value' } },
  }));
}

// 9. UpdateFunctionConfigurationCommand — with try/catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_update_config_safe(functionName: string) {
  try {
    // SHOULD_NOT_FIRE: UpdateFunctionConfigurationCommand has try-catch
    await lambdaClient.send(new UpdateFunctionConfigurationCommand({
      FunctionName: functionName,
      Timeout: 30,
      MemorySize: 512,
      Environment: { Variables: { KEY: 'value' } },
    }));
    await waitUntilFunctionUpdatedV2(
      { client: lambdaClient, maxWaitTime: 300 },
      { FunctionName: functionName }
    );
  } catch (error: any) {
    if (error.name === 'ResourceConflictException') {
      // Another update in progress — wait then retry
      await waitUntilFunctionUpdatedV2({ client: lambdaClient, maxWaitTime: 300 }, { FunctionName: functionName });
    } else if (error.name === 'InvalidParameterValueException') {
      throw new Error(`Invalid Lambda config: ${error.message}`);
    } else {
      throw error;
    }
  }
}

// ──────────────────────────────────────────────────
// 10. waitUntilPublishedVersionActive — no try/catch
// Covers: aws-lambda-published-version-waiter-no-error-handling
// NOTE: scanner detection for waiter calls is a pending concern — these document correct/incorrect patterns.
// ──────────────────────────────────────────────────

async function gt_wait_published_version_missing(functionName: string, version: string) {
  // Missing try-catch — TimeoutError when published version stays in Pending state
  // Detection gap: scanner doesn't yet detect missing try-catch on waiter calls.
  await waitUntilPublishedVersionActive(
    { client: lambdaClient, maxWaitTime: 300 },
    { FunctionName: functionName, Qualifier: version }
  );
}

// 10. waitUntilPublishedVersionActive — with try/catch (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_wait_published_version_safe(functionName: string, version: string) {
  try {
    // SHOULD_NOT_FIRE: waiter has try-catch — correct pattern for blue/green deploys
    await waitUntilPublishedVersionActive(
      { client: lambdaClient, maxWaitTime: 300 },
      { FunctionName: functionName, Qualifier: version }
    );
  } catch (error: any) {
    if (error.name === 'TimeoutError') {
      throw new Error(`Published version ${version} of ${functionName} did not become active within 5 minutes`);
    }
    throw new Error(`Version activation failed: ${error.message}`);
  }
}

// ──────────────────────────────────────────────────
// 11. CreateEventSourceMappingCommand — no try/catch (SHOULD_FIRE)
// Covers: aws-lambda-event-source-mapping-no-error-handling
// ResourceConflictException when mapping already exists (not idempotent)
// ──────────────────────────────────────────────────

// @expect-violation: aws-lambda-service-error
async function gt_create_event_source_mapping_missing(functionName: string, sqsQueueArn: string) {
  // aws-lambda-event-source-mapping-no-error-handling (scanner concern queued for command-specific rule)
  await lambdaClient.send(new CreateEventSourceMappingCommand({
    FunctionName: functionName,
    EventSourceArn: sqsQueueArn,
    BatchSize: 10,
    FunctionResponseTypes: ['ReportBatchItemFailures'],
  }));
}

// 11. CreateEventSourceMappingCommand — with try/catch + idempotency handling (SHOULD_NOT_FIRE)
// @expect-clean
async function gt_create_event_source_mapping_safe(functionName: string, sqsQueueArn: string) {
  try {
    // SHOULD_NOT_FIRE: CreateEventSourceMappingCommand has try-catch
    await lambdaClient.send(new CreateEventSourceMappingCommand({
      FunctionName: functionName,
      EventSourceArn: sqsQueueArn,
      BatchSize: 10,
      FunctionResponseTypes: ['ReportBatchItemFailures'],
    }));
  } catch (error: any) {
    if (error.name === 'ResourceConflictException') {
      // Mapping already exists — idempotent, safe to continue
      console.info(`Event source mapping already exists for ${functionName}`);
    } else if (error.name === 'ResourceNotFoundException') {
      throw new Error(`Function ${functionName} or event source ${sqsQueueArn} not found`);
    } else {
      throw error;
    }
  }
}

// ──────────────────────────────────────────────────
// 12. AddPermissionCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_add_permission_missing(functionName: string, apiGwArn: string, routeId: string) {
  // SHOULD_FIRE: aws-lambda-add-permission-no-error-handling
  await lambdaClient.send(new AddPermissionCommand({
    FunctionName: functionName,
    StatementId: `apigw-${routeId}`,
    Action: 'lambda:InvokeFunction',
    Principal: 'apigateway.amazonaws.com',
    SourceArn: apiGwArn,
  }));
}

// 12. AddPermissionCommand — with try/catch handling all named exceptions (SHOULD_NOT_FIRE)
async function gt_add_permission_safe(functionName: string, apiGwArn: string, routeId: string) {
  try {
    // SHOULD_NOT_FIRE: AddPermissionCommand has try-catch with named branches
    await lambdaClient.send(new AddPermissionCommand({
      FunctionName: functionName,
      StatementId: `apigw-${routeId}`,
      Action: 'lambda:InvokeFunction',
      Principal: 'apigateway.amazonaws.com',
      SourceArn: apiGwArn,
    }));
  } catch (error: any) {
    if (error.name === 'ResourceConflictException') {
      // Statement Sid already exists — idempotent, safe to continue
      console.info(`Permission ${routeId} already exists on ${functionName}`);
    } else if (error.name === 'PolicyLengthExceededException') {
      throw new Error(`Lambda function policy on ${functionName} hit 20 KB cap — clean up unused Sids before adding new permissions`);
    } else if (error.name === 'PublicPolicyException') {
      throw new Error(`Refusing to grant public access to ${functionName} without SourceAccount/SourceArn condition`);
    } else if (error.name === 'PreconditionFailedException') {
      throw new Error(`AddPermission race condition on ${functionName} — RevisionId mismatch`);
    } else {
      throw error;
    }
  }
}

// ──────────────────────────────────────────────────
// 13. AddPermissionCommand — generic catch swallows PolicyLengthExceededException (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// Postcondition `aws-lambda-add-permission-policy-length-exceeded` has no scanner detector yet —
// concern queued in scanner upgrade-concerns.json. Fixture documents the violation pattern
// but does NOT carry SHOULD_FIRE until detection lands.
async function gt_add_permission_policy_length_unchecked(functionName: string, sid: string) {
  try {
    await lambdaClient.send(new AddPermissionCommand({
      FunctionName: functionName,
      StatementId: sid,
      Action: 'lambda:InvokeFunction',
      Principal: 's3.amazonaws.com',
    }));
  } catch (error: any) {
    // Generic catch — does not differentiate PolicyLengthExceededException; deploy silently fails forever
    console.error('AddPermission failed:', error.message);
  }
}

// 13. AddPermissionCommand — specifically handles PolicyLengthExceededException (SHOULD_NOT_FIRE)
async function gt_add_permission_policy_length_handled(functionName: string, sid: string) {
  try {
    // SHOULD_NOT_FIRE: PolicyLengthExceededException is explicitly branched
    await lambdaClient.send(new AddPermissionCommand({
      FunctionName: functionName,
      StatementId: sid,
      Action: 'lambda:InvokeFunction',
      Principal: 's3.amazonaws.com',
    }));
  } catch (error: any) {
    if (error.name === 'PolicyLengthExceededException') {
      const policy = await lambdaClient.send(new GetPolicyCommand({ FunctionName: functionName }));
      throw new Error(`Lambda policy on ${functionName} at 20 KB cap; ${policy.Policy?.length} bytes — prune Sids and retry`);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────
// 14. PublishVersionCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_publish_version_missing(functionName: string, currentRevisionId: string) {
  // SHOULD_FIRE: aws-lambda-publish-version-no-error-handling
  const published = await lambdaClient.send(new PublishVersionCommand({
    FunctionName: functionName,
    Description: 'v2.0.0 release',
    RevisionId: currentRevisionId,
  }));
  return published.Version;
}

// 14. PublishVersionCommand — with try/catch + waitUntilPublishedVersionActive (SHOULD_NOT_FIRE)
async function gt_publish_version_safe(functionName: string, currentRevisionId: string) {
  try {
    // SHOULD_NOT_FIRE: PublishVersionCommand has try-catch with named branches
    const published = await lambdaClient.send(new PublishVersionCommand({
      FunctionName: functionName,
      Description: 'v2.0.0 release',
      RevisionId: currentRevisionId,
    }));
    await waitUntilPublishedVersionActive(
      { client: lambdaClient, maxWaitTime: 300 },
      { FunctionName: functionName, Qualifier: published.Version }
    );
    return published.Version;
  } catch (error: any) {
    if (error.name === 'CodeStorageExceededException') {
      throw new Error('Lambda 75 GB code storage quota exceeded — delete old versions before publishing');
    } else if (error.name === 'FunctionVersionsPerCapacityProviderLimitExceededException') {
      throw new Error(`Capacity provider version limit reached for ${functionName} — delete old versions`);
    } else if (error.name === 'PreconditionFailedException') {
      throw new Error(`Publish race condition on ${functionName} — $LATEST has been updated since RevisionId was fetched`);
    } else if (error.name === 'ResourceConflictException') {
      throw new Error(`Publish failed — concurrent UpdateFunctionCode in progress on ${functionName}`);
    } else {
      throw error;
    }
  }
}

// ──────────────────────────────────────────────────
// 15. CreateFunctionUrlConfigCommand — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_create_function_url_missing(functionName: string) {
  // SHOULD_FIRE: aws-lambda-function-url-no-error-handling
  await lambdaClient.send(new CreateFunctionUrlConfigCommand({
    FunctionName: functionName,
    AuthType: 'AWS_IAM',
    Cors: { AllowOrigins: ['https://app.example.com'], AllowMethods: ['POST'] },
  }));
}

// 15. CreateFunctionUrlConfigCommand — with try/catch + idempotency fallback (SHOULD_NOT_FIRE)
async function gt_create_function_url_safe(functionName: string, authType: 'AWS_IAM' | 'NONE') {
  if (authType === 'NONE') {
    console.warn(`SECURITY: creating PUBLIC Function URL for ${functionName} (no AWS_IAM auth)`);
  }
  try {
    // SHOULD_NOT_FIRE: CreateFunctionUrlConfigCommand has try-catch with named branches
    await lambdaClient.send(new CreateFunctionUrlConfigCommand({
      FunctionName: functionName,
      AuthType: authType,
      Cors: { AllowOrigins: ['https://app.example.com'], AllowMethods: ['POST'] },
    }));
  } catch (error: any) {
    if (error.name === 'ResourceConflictException') {
      // Function URL already exists — switch to update
      await lambdaClient.send(new UpdateFunctionUrlConfigCommand({
        FunctionName: functionName,
        AuthType: authType,
      }));
    } else if (error.name === 'ResourceNotFoundException') {
      throw new Error(`Function ${functionName} not found — create it before adding a Function URL`);
    } else if (error.name === 'InvalidParameterValueException') {
      throw new Error(`Invalid Function URL config for ${functionName}: ${error.message}`);
    } else {
      throw error;
    }
  }
}
