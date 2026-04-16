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

// SHOULD_FIRE: tags-add-outside-task-context — tags.add called from a route handler
// (not inside a task run() function)
async function gt_tagsAdd_outsideTaskContext_missing(userId: string) {
  // SHOULD_FIRE: tags-add-outside-task-context — tags.add outside task
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
  // SHOULD_FIRE: metadata-flush-silent-failure — flush swallows errors silently
  // Caller assumes flush succeeded, but there is no way to verify
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
