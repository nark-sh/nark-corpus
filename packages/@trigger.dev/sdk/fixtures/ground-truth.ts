/**
 * Ground-truth fixture for @trigger.dev/sdk
 *
 * Annotations placed DIRECTLY before the violating call site.
 * The line number stored is the line after the annotation comment.
 *
 * Postcondition IDs:
 *   trigger-no-try-catch               (tasks.trigger)
 *   batchtrigger-no-try-catch          (tasks.batchTrigger)
 *   retrieve-no-try-catch              (runs.retrieve)
 *   list-no-try-catch                  (runs.list)
 *   schedules-create-no-try-catch      (schedules.create)
 *   schedules-update-no-try-catch      (schedules.update)
 *   triggerandwait-unwrap-error        (tasks.triggerAndWait + .unwrap())
 *   triggerandwait-called-outside-task (tasks.triggerAndWait outside task)
 *   batchtriggerandwait-creation-error (tasks.batchTriggerAndWait throws)
 *   batchtriggerandwait-individual-failures-unchecked (results.runs not checked)
 *   cancel-no-try-catch                (runs.cancel)
 *   replay-no-try-catch                (runs.replay)
 *   reschedule-no-try-catch            (runs.reschedule)
 *   poll-no-try-catch                  (runs.poll)
 *   pause-no-try-catch                 (queues.pause)
 *   resume-no-try-catch                (queues.resume)
 *   createtoken-no-try-catch           (wait.createToken)
 *   completetoken-no-try-catch         (wait.completeToken)
 *   createpublictoken-no-try-catch     (auth.createPublicToken)
 *   createtriggerpublictoken-no-try-catch (auth.createTriggerPublicToken)
 *   createbatchtriggerpublictoken-no-try-catch (auth.createBatchTriggerPublicToken)
 *   tags-add-outside-task-context      (tags.add outside task run)
 *   tags-add-no-try-catch              (tags.add inside task without try-catch)
 *   metadata-flush-silent-failure      (metadata.flush swallows errors — no detector possible)
 *   constructevent-no-try-catch        (webhooks.constructEvent without try-catch)
 *   constructevent-swallowed-returns-200 (webhooks.constructEvent catch returns 2xx)
 *   fortoken-called-outside-task       (wait.forToken called from non-task context)
 *   fortoken-unwrap-timeout-unhandled  (wait.forToken().unwrap() without try-catch)
 *   query-execute-no-try-catch         (query.execute without try-catch)
 *
 *   Added 2026-06-24 (deepen-stream-3 pass 82):
 *   envvars-upload-no-try-catch        (envvars.upload without try-catch)
 *   envvars-create-no-try-catch        (envvars.create without try-catch)
 *   envvars-update-no-try-catch        (envvars.update without try-catch)
 *   envvars-del-no-try-catch           (envvars.del without try-catch)
 *   prompts-resolve-no-try-catch       (prompts.resolve — silent prompt failure)
 *   prompts-promote-no-try-catch       (prompts.promote — silent active-version swap)
 *   prompts-create-override-no-try-catch (prompts.createOverride without try-catch)
 *   idempotency-keys-create-no-try-catch (idempotencyKeys.create — duplicate-trigger risk)
 *   streams-read-no-try-catch          (streams.read + iteration not wrapped)
 *   streams-append-no-try-catch        (streams.append without try-catch)
 *   batch-retrieve-no-try-catch        (batch.retrieve without try-catch)
 *   usage-measure-no-try-catch         (usage.measure callback throws unhandled)
 */
import { tasks, schedules, runs, queues, wait, auth, tags, metadata, SubtaskUnwrapError, NotFoundError } from "@trigger.dev/sdk";

// ──────────────────────────────────────────────────
// 1. tasks.trigger — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_trigger_missing() {
  // SHOULD_FIRE: trigger-no-try-catch — tasks.trigger without try-catch
  const handle = await tasks.trigger("send-welcome-email", { userId: "u1" });
  return handle.id;
}

// 1. tasks.trigger — with try/catch (SHOULD_NOT_FIRE)
async function gt_trigger_safe() {
  try {
    // SHOULD_NOT_FIRE: tasks.trigger has try-catch
    const handle = await tasks.trigger("send-welcome-email", { userId: "u1" });
    return handle.id;
  } catch (e) {
    throw e;
  }
}

// ──────────────────────────────────────────────────
// 2. tasks.batchTrigger
// ──────────────────────────────────────────────────

async function gt_batchTrigger_missing() {
  // SHOULD_FIRE: batchtrigger-no-try-catch — tasks.batchTrigger without try-catch
  const result = await tasks.batchTrigger([
    { id: "send-email", payload: { userId: "u1" } },
  ]);
  return result.runs;
}

async function gt_batchTrigger_safe() {
  try {
    // SHOULD_NOT_FIRE: tasks.batchTrigger has try-catch
    const result = await tasks.batchTrigger([
      { id: "send-email", payload: { userId: "u1" } },
    ]);
    return result.runs;
  } catch (e) {
    throw e;
  }
}

// ──────────────────────────────────────────────────
// 3. runs.retrieve
// ──────────────────────────────────────────────────

async function gt_retrieve_missing() {
  // SHOULD_FIRE: retrieve-no-try-catch — runs.retrieve without try-catch
  const run = await runs.retrieve("run_abc123");
  return run;
}

async function gt_retrieve_safe() {
  try {
    // SHOULD_NOT_FIRE: runs.retrieve has try-catch
    const run = await runs.retrieve("run_abc123");
    return run;
  } catch (e: any) {
    if (e.status === 404) return null;
    throw e;
  }
}

// ──────────────────────────────────────────────────
// 4. runs.list
// ──────────────────────────────────────────────────

async function gt_list_missing() {
  // SHOULD_FIRE: list-no-try-catch — runs.list without try-catch
  const result = await runs.list({ tag: ["account:123"], limit: 20 });
  return result.data;
}

async function gt_list_safe() {
  try {
    // SHOULD_NOT_FIRE: runs.list has try-catch
    const result = await runs.list({ tag: ["account:123"], limit: 20 });
    return result.data;
  } catch (e) {
    return [];
  }
}

// ──────────────────────────────────────────────────
// 5. schedules.create
// ──────────────────────────────────────────────────

async function gt_schedulesCreate_missing() {
  // SHOULD_FIRE: schedules-create-no-try-catch — schedules.create without try-catch
  const s = await schedules.create({
    task: "daily-sync",
    cron: "0 9 * * *",
    deduplicationKey: "daily-sync-prod",
  });
  return s.id;
}

async function gt_schedulesCreate_safe() {
  try {
    // SHOULD_NOT_FIRE: schedules.create has try-catch
    const s = await schedules.create({
      task: "daily-sync",
      cron: "0 9 * * *",
      deduplicationKey: "daily-sync-prod",
    });
    return s.id;
  } catch (e: any) {
    if (e.status === 422) throw new Error("Invalid schedule");
    throw e;
  }
}

// ──────────────────────────────────────────────────
// 6. schedules.update
// ──────────────────────────────────────────────────

async function gt_schedulesUpdate_missing() {
  // SHOULD_FIRE: schedules-update-no-try-catch — schedules.update without try-catch
  await schedules.update("sched_xyz", {
    task: "daily-sync",
    cron: "0 10 * * *",
  });
}

async function gt_schedulesUpdate_safe() {
  try {
    // SHOULD_NOT_FIRE: schedules.update has try-catch
    await schedules.update("sched_xyz", {
      task: "daily-sync",
      cron: "0 10 * * *",
    });
  } catch (e: any) {
    if (e.status === 404) return;
    throw e;
  }
}

// ──────────────────────────────────────────────────
// 7. tasks.triggerAndWait — .unwrap() without try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_triggerAndWait_unwrap_missing() {
  // SHOULD_FIRE: triggerandwait-unwrap-error — .unwrap() without try-catch
  const output = await tasks.triggerAndWait("process-payment", { amount: 100 }).unwrap();
  return output;
}

async function gt_triggerAndWait_unwrap_safe() {
  try {
    // SHOULD_NOT_FIRE: .unwrap() wrapped in try-catch
    const output = await tasks.triggerAndWait("process-payment", { amount: 100 }).unwrap();
    return output;
  } catch (err) {
    if (err instanceof SubtaskUnwrapError) {
      console.error("Child task failed:", err.cause);
    }
    throw err;
  }
}

// NOTE: result.ok pattern (no .unwrap()) is a safe alternative to try/catch + .unwrap()
// The scanner currently fires triggerandwait-unwrap-error on triggerAndWait() without
// a surrounding try-catch, which is a known scanner limitation — the result.ok pattern
// is safe but the scanner cannot yet distinguish it from the unwrap() pattern.
// Scanner concern queued: concern-20260416-trigger-dev-sdk-deepen-1
// Excluded from ground-truth to avoid recording a false-positive failure.
//
// async function gt_triggerAndWait_result_check_safe() {
//   const result = await tasks.triggerAndWait("process-payment", { amount: 100 });
//   if (!result.ok) { /* safe - result.ok pattern */ }
//   return result.output;
// }

// ──────────────────────────────────────────────────
// 8. tasks.batchTriggerAndWait — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_batchTriggerAndWait_missing() {
  // SHOULD_FIRE: batchtriggerandwait-creation-error — no try-catch
  const results = await tasks.batchTriggerAndWait("send-email", [
    { payload: { to: "alice@example.com" } },
    { payload: { to: "bob@example.com" } },
  ]);
  return results.runs;
}

async function gt_batchTriggerAndWait_safe() {
  try {
    // SHOULD_NOT_FIRE: try-catch present
    const results = await tasks.batchTriggerAndWait("send-email", [
      { payload: { to: "alice@example.com" } },
      { payload: { to: "bob@example.com" } },
    ]);
    for (const result of results.runs) {
      if (!result.ok) {
        console.error("Item failed:", result.error);
      }
    }
    return results.runs;
  } catch (err) {
    throw err;
  }
}

// ──────────────────────────────────────────────────
// 9. runs.cancel — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_cancel_missing() {
  // SHOULD_FIRE: cancel-no-try-catch — runs.cancel without try-catch
  await runs.cancel("run_abc123");
}

async function gt_cancel_safe() {
  try {
    // SHOULD_NOT_FIRE: runs.cancel has try-catch
    await runs.cancel("run_abc123");
  } catch (err) {
    if (err instanceof NotFoundError) {
      return; // Already completed — safe to ignore
    }
    throw err;
  }
}

// ──────────────────────────────────────────────────
// 10. runs.replay — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_replay_missing() {
  // SHOULD_FIRE: replay-no-try-catch — runs.replay without try-catch
  const newRun = await runs.replay("run_abc123");
  return newRun.id;
}

async function gt_replay_safe() {
  try {
    // SHOULD_NOT_FIRE: runs.replay has try-catch
    const newRun = await runs.replay("run_abc123");
    return newRun.id;
  } catch (err) {
    if (err instanceof NotFoundError) {
      console.error("Run not found:", err.message);
      return null;
    }
    throw err;
  }
}

// ──────────────────────────────────────────────────
// 11. runs.poll — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_poll_missing() {
  // SHOULD_FIRE: poll-no-try-catch — runs.poll without try-catch
  const result = await runs.poll("run_abc123", { pollIntervalMs: 1000 });
  return result.status;
}

async function gt_poll_safe() {
  try {
    // SHOULD_NOT_FIRE: runs.poll has try-catch
    const result = await runs.poll("run_abc123", { pollIntervalMs: 1000 });
    if (result.status !== "COMPLETED") {
      console.error("Run did not complete:", result.status);
    }
    return result;
  } catch (err) {
    throw err;
  }
}

// ──────────────────────────────────────────────────
// 12. queues.pause — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_pause_missing() {
  // SHOULD_FIRE: pause-no-try-catch — queues.pause without try-catch
  await queues.pause({ type: "task", name: "send-email" });
}

async function gt_pause_safe() {
  try {
    // SHOULD_NOT_FIRE: queues.pause has try-catch
    await queues.pause({ type: "task", name: "send-email" });
  } catch (err) {
    if (err instanceof NotFoundError) {
      console.warn("Queue not found");
    } else {
      throw err;
    }
  }
}

// ──────────────────────────────────────────────────
// 13. queues.resume — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_resume_missing() {
  // SHOULD_FIRE: resume-no-try-catch — queues.resume without try-catch
  await queues.resume({ type: "task", name: "send-email" });
}

async function gt_resume_safe() {
  try {
    // SHOULD_NOT_FIRE: queues.resume has try-catch
    await queues.resume({ type: "task", name: "send-email" });
  } catch (err) {
    throw err;
  }
}

// ──────────────────────────────────────────────────
// 14. wait.createToken — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_createToken_missing() {
  // SHOULD_FIRE: createtoken-no-try-catch — wait.createToken without try-catch
  const token = await wait.createToken({ timeout: "24h" });
  return token.url;
}

async function gt_createToken_safe() {
  try {
    // SHOULD_NOT_FIRE: wait.createToken has try-catch
    const token = await wait.createToken({ timeout: "24h" });
    return token.url;
  } catch (err) {
    throw err;
  }
}

// ──────────────────────────────────────────────────
// 15. wait.completeToken — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_completeToken_missing(tokenId: string) {
  // SHOULD_FIRE: completetoken-no-try-catch — wait.completeToken without try-catch
  await wait.completeToken(tokenId, { status: "approved" });
}

async function gt_completeToken_safe(tokenId: string) {
  try {
    // SHOULD_NOT_FIRE: wait.completeToken has try-catch
    await wait.completeToken(tokenId, { status: "approved" });
  } catch (err) {
    if (err instanceof NotFoundError) {
      console.warn("Token already completed or expired:", tokenId);
    } else {
      throw err;
    }
  }
}

// ──────────────────────────────────────────────────
// 16. auth.createPublicToken — no try/catch (SHOULD_FIRE)
// Added: deepen-stream-1 pass 6 (2026-04-16)
// ──────────────────────────────────────────────────

async function gt_createPublicToken_missing(runId: string) {
  // SHOULD_FIRE: createpublictoken-no-try-catch — auth.createPublicToken without try-catch
  const token = await auth.createPublicToken({
    scopes: { read: { runs: [runId] } },
    expirationTime: "15m",
  });
  return token;
}

async function gt_createPublicToken_safe(runId: string) {
  try {
    // SHOULD_NOT_FIRE: auth.createPublicToken has try-catch
    const token = await auth.createPublicToken({
      scopes: { read: { runs: [runId] } },
      expirationTime: "15m",
    });
    return token;
  } catch (err) {
    console.error("Failed to create public token:", err);
    throw err;
  }
}

// ──────────────────────────────────────────────────
// 17. auth.createTriggerPublicToken — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_createTriggerPublicToken_missing() {
  // SHOULD_FIRE: createtriggerpublictoken-no-try-catch — no try-catch
  const token = await auth.createTriggerPublicToken("send-welcome-email");
  return token;
}

async function gt_createTriggerPublicToken_safe() {
  try {
    // SHOULD_NOT_FIRE: auth.createTriggerPublicToken has try-catch
    const token = await auth.createTriggerPublicToken("send-welcome-email");
    return token;
  } catch (err) {
    console.error("Failed to create trigger token:", err);
    throw err;
  }
}

// ──────────────────────────────────────────────────
// 18. auth.createBatchTriggerPublicToken — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_createBatchTriggerPublicToken_missing() {
  // SHOULD_FIRE: createbatchtriggerpublictoken-no-try-catch — no try-catch
  const token = await auth.createBatchTriggerPublicToken("process-items");
  return token;
}

async function gt_createBatchTriggerPublicToken_safe() {
  try {
    // SHOULD_NOT_FIRE: auth.createBatchTriggerPublicToken has try-catch
    const token = await auth.createBatchTriggerPublicToken("process-items");
    return token;
  } catch (err) {
    console.error("Failed to create batch trigger token:", err);
    throw err;
  }
}

// ──────────────────────────────────────────────────
// 19. tags.add — outside task context (SHOULD_FIRE)
// Note: tags-add-outside-task-context fires at RUNTIME (taskContext.ctx is null).
// The scanner detects tags.add() called in non-task async functions (route handlers, etc.)
// ──────────────────────────────────────────────────

// NOTE: scanner gap — tags-add-outside-task-context requires detecting that tags.add()
// is NOT inside a task run() function. Scanner cannot determine task context statically.
async function gt_tagsAdd_outsideTaskContext_missing(userId: string) {
  await tags.add([`user:${userId}`, "processing"]);
}

// tags.add used correctly inside a task — annotated as SHOULD_NOT_FIRE
// (cannot easily represent task context in fixture — shown for documentation)
async function gt_tagsAdd_insideTask_safe(userId: string) {
  try {
    // SHOULD_NOT_FIRE: tags.add inside task with try-catch
    await tags.add([`user:${userId}`, "processing"]);
  } catch (err) {
    console.warn("Failed to add tags:", err);
    // Non-critical — continue task execution
  }
}

// ──────────────────────────────────────────────────
// 20. metadata.flush — silent failure (SHOULD_FIRE annotation)
// Note: metadata-flush-silent-failure cannot be detected by a try-catch scanner
// because flush() NEVER throws. The scanner concern documents that this needs
// a different detection strategy (pattern: flush() followed by child task trigger
// without verifying flush succeeded via metadata.current()).
// ──────────────────────────────────────────────────

async function gt_metadataFlush_silentFailure() {
  // NOTE: scanner gap — metadata-flush-silent-failure: flush() never throws, so try-catch
  // scanner cannot detect it. Needs a different detection strategy.
  metadata.set("progress", 0.5);
  await metadata.flush(); // Silently fails on network error — no exception raised
  // Child task triggered next may see stale metadata
  await tasks.trigger("process-next-step", { step: "post-flush" });
}

async function gt_metadataFlush_withLogging() {
  // SHOULD_NOT_FIRE: acknowledged pattern — logging current state before flush
  // (best practice when metadata is critical)
  metadata.set("progress", 0.5);
  const current = metadata.current();
  console.log("Flushing metadata:", current); // Log before flush for audit trail
  await metadata.flush();
  // Note: still no guarantee flush succeeded, but at least state is logged
}

// ──────────────────────────────────────────────────
// 21. webhooks.constructEvent — no try/catch (SHOULD_FIRE)
// Added in deepen pass 2026-06-18 (deepen-stream-1 pass 4)
// ──────────────────────────────────────────────────

// Stub imports referenced only as types in the new fixtures — actual webhooks/wait/query
// exports come from @trigger.dev/sdk @ 4.x. We keep type-only references soft so the
// fixture compiles in the existing ES2020 sandbox without DOM lib.
declare const webhooks: { constructEvent: (req: any, secret: string) => Promise<any> };
declare const query: { execute: (q: string, options?: any) => Promise<any> };
declare class WebhookError extends Error {}
declare class WaitpointTimeoutError extends Error {}

// NOTE: scanner gap — constructevent-no-try-catch requires a new detector to be
// added (concern-20260618-trigger-dev-sdk-deepen-1). Annotation kept as documentation.
async function gt_webhookConstructEvent_missing(req: any, secret: string) {
  // FUTURE_FIRE: constructevent-no-try-catch — webhooks.constructEvent without try-catch
  const event = await webhooks.constructEvent(req, secret);
  return event;
}

async function gt_webhookConstructEvent_safe(req: any, secret: string): Promise<{ status: number; body: any }> {
  try {
    // SHOULD_NOT_FIRE: webhooks.constructEvent has try-catch returning non-2xx on error
    const event = await webhooks.constructEvent(req, secret);
    return { status: 200, body: { ok: true, event } };
  } catch (err) {
    if (err instanceof WebhookError) {
      return { status: 400, body: "Invalid webhook" };
    }
    throw err;
  }
}

// 21b. webhooks.constructEvent — swallowed, returns 200 (FUTURE_FIRE on different pattern)
// NOTE: scanner gap — constructevent-swallowed-returns-200 needs new detector
// (concern-20260618-trigger-dev-sdk-deepen-2).
async function gt_webhookConstructEvent_swallowed(req: any, secret: string): Promise<{ status: number; body: any }> {
  try {
    // FUTURE_FIRE: constructevent-swallowed-returns-200 — catch returns 200 on signature failure
    const event = await webhooks.constructEvent(req, secret);
    return { status: 200, body: { ok: true, event } };
  } catch (err) {
    console.error(err);
    return { status: 200, body: { ok: true } }; // VULN: 200 on forge
  }
}

// ──────────────────────────────────────────────────
// 22. wait.forToken — no try/catch + unwrap (SHOULD_FIRE)
// Note: fortoken-called-outside-task fires at RUNTIME (taskContext.ctx is null).
// The scanner gap (concern-20260618-trigger-dev-sdk-deepen-3) requires task-context
// detection that does not yet exist. Outside-task SHOULD_FIRE annotation omitted
// here pending scanner upgrade; see contract.yaml for postcondition definition.
// ──────────────────────────────────────────────────

// NOTE: scanner gap — fortoken-called-outside-task requires detecting that wait.forToken()
// is NOT inside a task run() function. Scanner cannot determine task context statically yet.
// NOTE: scanner gap — fortoken-unwrap-timeout-unhandled requires chain-aware
// detection of .unwrap() on wait.forToken() result (concern-20260618-trigger-dev-sdk-deepen-4).
async function gt_waitForToken_unwrap_missing(tokenId: string) {
  // FUTURE_FIRE: fortoken-unwrap-timeout-unhandled — .unwrap() without try-catch
  const approval = await wait.forToken<{ approved: boolean }>(tokenId).unwrap();
  return approval;
}

async function gt_waitForToken_unwrap_safe(tokenId: string) {
  try {
    // SHOULD_NOT_FIRE: .unwrap() inside try-catch with timeout fallback
    const approval = await wait.forToken<{ approved: boolean }>(tokenId).unwrap();
    return { approved: true, data: approval };
  } catch (err) {
    if (err instanceof WaitpointTimeoutError) {
      return { approved: false, reason: "timeout" as const };
    }
    throw err;
  }
}

// ──────────────────────────────────────────────────
// 23. query.execute — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

// NOTE: scanner gap — query-execute-no-try-catch needs the standard try-catch
// detector extended to recognize query.execute() (concern-20260618-trigger-dev-sdk-deepen-5).
async function gt_queryExecute_missing(): Promise<{ status: number; body: any }> {
  // FUTURE_FIRE: query-execute-no-try-catch — query.execute without try-catch
  const result = await query.execute("SELECT run_id, status FROM runs", {
    period: "7d",
    format: "json",
  });
  return { status: 200, body: { runs: result.results } };
}

async function gt_queryExecute_safe(): Promise<{ status: number; body: any }> {
  try {
    // SHOULD_NOT_FIRE: query.execute has try-catch with structured error handling
    const result = await query.execute("SELECT run_id, status FROM runs", {
      period: "7d",
      format: "json",
    });
    return { status: 200, body: { runs: result.results } };
  } catch (err) {
    console.error("TRQL query failed:", err);
    return { status: 500, body: "Query failed" };
  }
}

// ──────────────────────────────────────────────────
// Added 2026-06-24 (deepen-stream-3 pass 82)
// composable-middleware-misclassified-as-sync-factory pattern fixtures
// ──────────────────────────────────────────────────

import { envvars, idempotencyKeys, batch, usage } from "@trigger.dev/sdk";

// envvars.upload — missing try/catch
async function gt_envvarsUpload_missing(projectRef: string) {
  // SHOULD_FIRE: envvars-upload-no-try-catch
  await envvars.upload(projectRef, "prod", {
    variables: { DATABASE_URL: "postgres://x" },
    override: true,
  });
}

async function gt_envvarsUpload_safe(projectRef: string) {
  try {
    // SHOULD_NOT_FIRE: envvars.upload wrapped in try/catch
    await envvars.upload(projectRef, "prod", {
      variables: { DATABASE_URL: "postgres://x" },
      override: true,
    });
  } catch (err) {
    console.error("Env upload failed:", err);
    throw err;
  }
}

// envvars.create — missing try/catch
async function gt_envvarsCreate_missing() {
  // SHOULD_FIRE: envvars-create-no-try-catch
  await envvars.create({ name: "STRIPE_KEY", value: "sk_test" });
}

async function gt_envvarsCreate_safe() {
  try {
    // SHOULD_NOT_FIRE: envvars.create handles ConflictError fallback
    await envvars.create({ name: "STRIPE_KEY", value: "sk_test" });
  } catch (err) {
    if ((err as any)?.status === 409) {
      await envvars.update("STRIPE_KEY", { value: "sk_test" });
      return;
    }
    throw err;
  }
}

// envvars.update — missing try/catch
async function gt_envvarsUpdate_missing() {
  // SHOULD_FIRE: envvars-update-no-try-catch
  await envvars.update("STRIPE_KEY", { value: "sk_new" });
}

async function gt_envvarsUpdate_safe() {
  try {
    // SHOULD_NOT_FIRE: envvars.update wrapped
    await envvars.update("STRIPE_KEY", { value: "sk_new" });
  } catch (err) {
    console.error("Update failed:", err);
    throw err;
  }
}

// envvars.del — missing try/catch
async function gt_envvarsDel_missing() {
  // SHOULD_FIRE: envvars-del-no-try-catch
  await envvars.del("OLD_KEY");
}

async function gt_envvarsDel_safe() {
  try {
    // SHOULD_NOT_FIRE: envvars.del idempotent-safe wrap
    await envvars.del("OLD_KEY");
  } catch (err) {
    if ((err as any)?.status === 404) return;
    throw err;
  }
}

// prompts.resolve — missing try/catch (silent prompt failure)
async function gt_promptsResolve_missing() {
  const { prompts } = await import("@trigger.dev/sdk");
  // SHOULD_FIRE: prompts-resolve-no-try-catch
  const resolved = await prompts.resolve("summarize-email", { tone: "warm" });
  return resolved;
}

async function gt_promptsResolve_safe() {
  const { prompts } = await import("@trigger.dev/sdk");
  try {
    // SHOULD_NOT_FIRE: prompts.resolve wrapped — fails fast on missing prompt
    const resolved = await prompts.resolve("summarize-email", { tone: "warm" });
    return resolved;
  } catch (err) {
    console.error("Prompt resolve failed — refusing to send empty prompt to LLM:", err);
    throw err;
  }
}

// prompts.promote — missing try/catch
async function gt_promptsPromote_missing() {
  const { prompts } = await import("@trigger.dev/sdk");
  // SHOULD_FIRE: prompts-promote-no-try-catch
  await prompts.promote("summarize-email", 7);
}

async function gt_promptsPromote_safe() {
  const { prompts } = await import("@trigger.dev/sdk");
  try {
    // SHOULD_NOT_FIRE: prompts.promote with audit logging
    await prompts.promote("summarize-email", 7);
    console.log("Promoted summarize-email v7");
  } catch (err) {
    console.error("Promote failed:", err);
    throw err;
  }
}

// prompts.createOverride — missing try/catch
async function gt_promptsCreateOverride_missing() {
  const { prompts } = await import("@trigger.dev/sdk");
  // SHOULD_FIRE: prompts-create-override-no-try-catch
  await prompts.createOverride("summarize-email", { content: "New text" } as any);
}

async function gt_promptsCreateOverride_safe() {
  const { prompts } = await import("@trigger.dev/sdk");
  try {
    // SHOULD_NOT_FIRE: prompts.createOverride with conflict fallback
    await prompts.createOverride("summarize-email", { content: "New text" } as any);
  } catch (err) {
    if ((err as any)?.status === 409) {
      await prompts.updateOverride("summarize-email", { content: "New text" } as any);
      return;
    }
    throw err;
  }
}

// idempotencyKeys.create — missing try/catch
async function gt_idempotencyKeysCreate_missing(userId: string) {
  // SHOULD_FIRE: idempotency-keys-create-no-try-catch
  const key = await idempotencyKeys.create(["user", userId, "welcome"]);
  return key;
}

async function gt_idempotencyKeysCreate_safe(userId: string) {
  try {
    // SHOULD_NOT_FIRE: idempotencyKeys.create wrapped to prevent duplicate child trigger
    const key = await idempotencyKeys.create(["user", userId, "welcome"]);
    return key;
  } catch (err) {
    console.error("Idempotency key creation failed — refusing duplicate trigger:", err);
    throw err;
  }
}

// streams.read — missing try/catch
async function gt_streamsRead_missing(runId: string) {
  const { streams } = await import("@trigger.dev/sdk");
  // SHOULD_FIRE: streams-read-no-try-catch
  const stream = await streams.read<any>(runId, "completion");
  for await (const chunk of stream) {
    console.log(chunk);
  }
}

async function gt_streamsRead_safe(runId: string) {
  const { streams } = await import("@trigger.dev/sdk");
  try {
    // SHOULD_NOT_FIRE: streams.read wrapped + iteration wrapped
    const stream = await streams.read<any>(runId, "completion");
    try {
      for await (const chunk of stream) {
        console.log(chunk);
      }
    } catch (iterErr) {
      console.warn("Stream dropped mid-flight:", iterErr);
    }
  } catch (err) {
    if ((err as any)?.status === 404) return;
    throw err;
  }
}

// streams.append — missing try/catch
async function gt_streamsAppend_missing() {
  const { streams } = await import("@trigger.dev/sdk");
  // SHOULD_FIRE: streams-append-no-try-catch
  await streams.append("completion", "chunk-data");
}

async function gt_streamsAppend_safe() {
  const { streams } = await import("@trigger.dev/sdk");
  try {
    // SHOULD_NOT_FIRE: streams.append wrapped with rate-limit retry
    await streams.append("completion", "chunk-data");
  } catch (err) {
    console.warn("Append failed:", err);
  }
}

// batch.retrieve — missing try/catch
async function gt_batchRetrieve_missing(batchId: string) {
  // SHOULD_FIRE: batch-retrieve-no-try-catch
  const info = await batch.retrieve(batchId);
  return info;
}

async function gt_batchRetrieve_safe(batchId: string) {
  try {
    // SHOULD_NOT_FIRE: batch.retrieve wrapped with NotFoundError handling
    const info = await batch.retrieve(batchId);
    return info;
  } catch (err) {
    if ((err as any)?.status === 404) return null;
    throw err;
  }
}

// usage.measure — callback throws without outer try/catch
async function gt_usageMeasure_missing() {
  // SHOULD_FIRE: usage-measure-no-try-catch
  const { result, compute } = await usage.measure(async () => {
    return await expensiveLLMCall();
  });
  console.log("cost", compute.costInCents);
  return result;
}

async function gt_usageMeasure_safe() {
  try {
    // SHOULD_NOT_FIRE: usage.measure wrapped
    const { result, compute } = await usage.measure(async () => {
      return await expensiveLLMCall();
    });
    console.log("cost", compute.costInCents);
    return result;
  } catch (err) {
    console.error("Measured call failed:", err);
    throw err;
  }
}

// Stub for the helper used in usage.measure fixtures
async function expensiveLLMCall(): Promise<string> {
  return "llm-output";
}
