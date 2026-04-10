/**
 * Ground-truth fixture for @trigger.dev/sdk
 *
 * Annotations placed DIRECTLY before the violating call site.
 * The line number stored is the line after the annotation comment.
 *
 * Postcondition IDs:
 *   trigger-no-try-catch         (tasks.trigger)
 *   batchtrigger-no-try-catch    (tasks.batchTrigger)
 *   retrieve-no-try-catch        (runs.retrieve)
 *   list-no-try-catch            (runs.list)
 *   schedules-create-no-try-catch (schedules.create)
 *   schedules-update-no-try-catch (schedules.update)
 */
import { tasks, schedules, runs } from "@trigger.dev/sdk";

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
