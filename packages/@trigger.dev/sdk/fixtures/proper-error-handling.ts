/**
 * Proper error handling for @trigger.dev/sdk
 * All API calls wrapped in try/catch — should produce 0 violations.
 */
import { tasks, schedules, runs } from "@trigger.dev/sdk";

// ── tasks.trigger ──────────────────────────────────────

async function triggerTaskSafe(payload: { userId: string }) {
  try {
    const handle = await tasks.trigger("send-welcome-email", payload);
    return handle.id;
  } catch (e: any) {
    if (e.status === 429) {
      // rate limited — surface to caller
      throw new Error("Rate limit exceeded, try again later");
    }
    throw e;
  }
}

// ── tasks.batchTrigger ─────────────────────────────────

async function batchTriggerSafe(userIds: string[]) {
  try {
    const handles = await tasks.batchTrigger(
      userIds.map(id => ({ id: "send-welcome-email", payload: { userId: id } }))
    );
    return handles.runs;
  } catch (e: any) {
    throw e;
  }
}

// ── runs.retrieve ──────────────────────────────────────

async function retrieveRunSafe(runId: string) {
  try {
    const run = await runs.retrieve(runId);
    return run;
  } catch (e: any) {
    if (e.status === 404) return null;
    throw e;
  }
}

// ── runs.list ──────────────────────────────────────────

async function listRunsSafe(tag: string) {
  try {
    const result = await runs.list({ tag: [tag], limit: 20 });
    return result.data;
  } catch (e: any) {
    return [];
  }
}

// ── schedules.create ───────────────────────────────────

async function createScheduleSafe(cron: string, key: string) {
  try {
    const schedule = await schedules.create({
      task: "daily-sync",
      cron,
      deduplicationKey: key,
    });
    return schedule.id;
  } catch (e: any) {
    if (e.status === 422) {
      throw new Error(`Invalid schedule parameters: ${e.message}`);
    }
    throw e;
  }
}

// ── schedules.update ───────────────────────────────────

async function updateScheduleSafe(scheduleId: string, cron: string) {
  try {
    await schedules.update(scheduleId, {
      task: "daily-sync",
      cron,
    });
  } catch (e: any) {
    if (e.status === 404) return; // already deleted
    throw e;
  }
}
