/**
 * Instance/namespace usage patterns for @trigger.dev/sdk
 * Tests detection via named imports (tasks, schedules, runs).
 */
import { tasks, schedules, runs } from "@trigger.dev/sdk";
import { runs as runsV3 } from "@trigger.dev/sdk/v3";

// ── Destructured patterns ──────────────────────────────

const { trigger } = tasks;  // destructured — analyzer may or may not detect

async function triggerViaDestructure(payload: object) {
  // May or may not fire — destructured binding loses import tracking
  const handle = await trigger("my-task", payload);
  return handle.id;
}

// ── Subpath import — should normalize ─────────────────

async function retrieveViaSubpath(runId: string) {
  // ❌ @trigger.dev/sdk/v3 normalizes to @trigger.dev/sdk — should fire
  const run = await runsV3.retrieve(runId);
  return run;
}

// ── Correct usage ─────────────────────────────────────

async function triggerWithTryCatch(payload: object) {
  try {
    // SHOULD_NOT_FIRE — has try-catch
    const handle = await tasks.trigger("my-task", payload);
    return handle.id;
  } catch (e) {
    throw e;
  }
}

// ── Class wrapping tasks API ───────────────────────────

class JobService {
  async enqueue(taskId: string, payload: object) {
    // ❌ No try-catch on tasks.trigger in class method
    const handle = await tasks.trigger(taskId, payload);
    return handle.id;
  }

  async listRecent(tag: string) {
    // ❌ No try-catch on runs.list in class method
    const result = await runs.list({ tag: [tag], limit: 10 });
    return result.data;
  }

  async createScheduleSafe(cron: string) {
    try {
      // SHOULD_NOT_FIRE — has try-catch
      const s = await schedules.create({ task: "recurring-job", cron, deduplicationKey: "k1" });
      return s.id;
    } catch (e) {
      throw e;
    }
  }
}
