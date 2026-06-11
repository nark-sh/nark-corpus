/**
 * Ground-truth fixtures for @sentry/node Nark profile.
 *
 * Postconditions under test:
 *   - span-manual-finish-never-called   (startSpanManual — no try/finally with finish/span.end in callback)
 *   - span-manual-callback-rethrows     (startSpanManual — outside try-catch, error re-thrown)
 *   - inactive-span-end-never-called    (startInactiveSpan — no try/finally with span.end in scope)
 *   - monitor-callback-rethrows         (withMonitor — outside try-catch, error re-thrown)
 *   - monitor-slug-not-configured       (withMonitor — missing upsertMonitorConfig 3rd argument)
 *
 * Note: checkin-completion-missing (captureCheckIn) requires cross-call data-flow analysis
 * that exceeds current scanner capabilities — deferred, not tested here.
 */
import * as Sentry from "@sentry/node";

// ---------------------------------------------------------------------------
// startSpanManual — span.end() / finish() patterns
// ---------------------------------------------------------------------------

async function spanManualMissingFinish(): Promise<void> {
  // SHOULD_FIRE: span-manual-finish-never-called — callback has no try/finally with finish() or span.end()
  await Sentry.startSpanManual({ name: "my-op" }, async (span) => {
    await fetch("https://api.example.com/data");
  });
}

function spanManualFinishOnlyInHappyPath(): void {
  // SHOULD_FIRE: span-manual-finish-never-called — finish() only in happy path, not in finally
  Sentry.startSpanManual({ name: "my-op" }, (span, finish) => {
    try {
      doSomeWork();
      finish();
    } catch (err) {
      throw err;
    }
  });
}

async function spanManualWithProperFinish(): Promise<void> {
  // SHOULD_NOT_FIRE: callback has try/finally that calls finish()
  await Sentry.startSpanManual({ name: "my-op" }, async (span, finish) => {
    try {
      await fetch("https://api.example.com/data");
    } finally {
      finish();
    }
  });
}

function spanManualWithSpanEndInFinally(): void {
  // SHOULD_NOT_FIRE: callback has try/finally that calls span.end()
  Sentry.startSpanManual({ name: "my-op" }, (span) => {
    try {
      doSomeWork();
    } finally {
      span.end();
    }
  });
}

// ---------------------------------------------------------------------------
// startInactiveSpan — span.end() patterns
// ---------------------------------------------------------------------------

async function inactiveSpanEndNeverCalled(): Promise<void> {
  // SHOULD_FIRE: inactive-span-end-never-called — no try/finally with span.end() anywhere in function
  const span = Sentry.startInactiveSpan({ name: "parallel-work" });
  await fetch("https://api.example.com/data");
}

async function inactiveSpanEndOnlyOnSuccess(): Promise<void> {
  // SHOULD_FIRE: inactive-span-end-never-called — span.end() not in finally; fetch error leaks span
  const span = Sentry.startInactiveSpan({ name: "parallel-work" });
  const result = await fetch("https://api.example.com/data");
  span.end(); // only called if fetch doesn't throw — error path leaks span
}

async function inactiveSpanWithProperEnd(): Promise<void> {
  // SHOULD_NOT_FIRE: span.end() called in finally block
  const span = Sentry.startInactiveSpan({ name: "parallel-work" });
  try {
    await fetch("https://api.example.com/data");
  } finally {
    span.end();
  }
}

// ---------------------------------------------------------------------------
// withMonitor — cron job monitoring patterns (monitor-callback-rethrows)
// ---------------------------------------------------------------------------

async function monitorNoTryCatch(): Promise<void> {
  // SHOULD_FIRE: monitor-callback-rethrows — withMonitor outside try-catch, callback errors propagate
  await Sentry.withMonitor("my-cron-job", async () => {
    await runHeavyJob();
  });
}

async function monitorWithTryCatch(): Promise<void> {
  try {
    // SHOULD_NOT_FIRE: inside try-catch satisfies monitor-callback-rethrows
    await Sentry.withMonitor("my-cron-job", async () => {
      await runHeavyJob();
    });
  } catch (err) {
    console.error("Cron job failed:", err);
  }
}

// ---------------------------------------------------------------------------
// withMonitor — cron job monitoring patterns (monitor-slug-not-configured)
// ---------------------------------------------------------------------------

async function monitorMissingUpsertConfig(): Promise<void> {
  try {
    // SHOULD_FIRE: monitor-slug-not-configured — missing upsertMonitorConfig (only 2 args)
    await Sentry.withMonitor("my-cron-job", async () => {
      await runHeavyJob();
    });
  } catch (err) {
    console.error("Cron job failed:", err);
  }
}

async function monitorWithProperConfig(): Promise<void> {
  try {
    // SHOULD_NOT_FIRE: upsertMonitorConfig provided (3 args) — monitor-slug-not-configured satisfied
    await Sentry.withMonitor(
      "my-cron-job",
      async () => {
        await runHeavyJob();
      },
      {
        schedule: { type: "crontab", value: "0 * * * *" },
      }
    );
  } catch (err) {
    console.error("Cron job failed:", err);
  }
}

// ---------------------------------------------------------------------------
// Helpers (not under test)
// ---------------------------------------------------------------------------
function doSomeWork(): void {
  /* placeholder */
}

async function runHeavyJob(): Promise<void> {
  /* placeholder */
}
