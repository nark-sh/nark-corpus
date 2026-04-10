/**
 * Missing error handling for @trigger.dev/sdk
 * API calls without try/catch — should produce ERROR violations.
 */
import { tasks, schedules, runs } from "@trigger.dev/sdk";

// ── tasks.trigger — no try-catch ───────────────────────

async function triggerTaskMissing(payload: { userId: string }) {
  // ❌ No try-catch — API errors crash the caller
  const handle = await tasks.trigger("send-welcome-email", payload);
  return handle.id;
}

// ── tasks.batchTrigger — no try-catch ─────────────────

async function batchTriggerMissing(userIds: string[]) {
  // ❌ No try-catch — rate limit or auth errors propagate
  const handles = await tasks.batchTrigger(
    userIds.map(id => ({ id: "send-welcome-email", payload: { userId: id } }))
  );
  return handles.runs;
}

// ── runs.retrieve — no try-catch ──────────────────────

async function retrieveRunMissing(runId: string) {
  // ❌ No try-catch — throws 404 if run doesn't exist
  const run = await runs.retrieve(runId);
  return run;
}

// ── runs.list — no try-catch ──────────────────────────

async function listRunsMissing(tag: string) {
  // ❌ No try-catch — auth errors propagate
  const result = await runs.list({ tag: [tag], limit: 20 });
  return result.data;
}

// ── schedules.create — no try-catch ───────────────────

async function createScheduleMissing(cron: string, key: string) {
  // ❌ No try-catch — invalid cron or auth error propagates
  const schedule = await schedules.create({
    task: "daily-sync",
    cron,
    deduplicationKey: key,
  });
  return schedule.id;
}

// ── schedules.update — no try-catch ───────────────────

async function updateScheduleMissing(scheduleId: string, cron: string) {
  // ❌ No try-catch — 404 or auth error propagates
  await schedules.update(scheduleId, {
    task: "daily-sync",
    cron,
  });
}
