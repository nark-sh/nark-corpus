/**
 * Ground-truth fixtures for @sentry/node Nark profile.
 * Tests postconditions: span-manual-finish-never-called, span-manual-callback-rethrows,
 * inactive-span-end-never-called, monitor-callback-rethrows, monitor-slug-not-configured,
 * checkin-completion-missing
 */
import * as Sentry from "@sentry/node";

// ---------------------------------------------------------------------------
// startSpanManual — span.end() / finish() patterns
// ---------------------------------------------------------------------------

// @expect-violation: span-manual-finish-never-called
// @expect-violation: span-manual-callback-rethrows
async function spanManualMissingFinish(): Promise<void> {
  await Sentry.startSpanManual({ name: "my-op" }, async (span) => {
    // Missing: finish() / span.end() is never called
    await fetch("https://api.example.com/data");
    // span leaks — never sent to Sentry
  });
}

// @expect-violation: span-manual-finish-never-called
function spanManualFinishOnlyInHappyPath(): void {
  Sentry.startSpanManual({ name: "my-op" }, (span, finish) => {
    try {
      doSomeWork();
      finish(); // only called on success — throws exit without finishing
    } catch (err) {
      // missing: finish() in error path
      throw err;
    }
  });
}

// @expect-clean
async function spanManualWithProperFinish(): Promise<void> {
  await Sentry.startSpanManual({ name: "my-op" }, async (span, finish) => {
    try {
      await fetch("https://api.example.com/data");
    } finally {
      finish(); // always called via try/finally
    }
  });
}

// @expect-clean
function spanManualWithSpanEndInFinally(): void {
  Sentry.startSpanManual({ name: "my-op" }, (span) => {
    try {
      doSomeWork();
    } finally {
      span.end(); // span.end() also acceptable
    }
  });
}

// ---------------------------------------------------------------------------
// startInactiveSpan — span.end() patterns
// ---------------------------------------------------------------------------

// @expect-violation: inactive-span-end-never-called
async function inactiveSpanEndNeverCalled(): Promise<void> {
  const span = Sentry.startInactiveSpan({ name: "parallel-work" });
  await fetch("https://api.example.com/data");
  // Missing: span.end() — span never sent to Sentry
}

// @expect-violation: inactive-span-end-never-called
async function inactiveSpanEndOnlyOnSuccess(): Promise<void> {
  const span = Sentry.startInactiveSpan({ name: "parallel-work" });
  const result = await fetch("https://api.example.com/data");
  span.end(); // only called if fetch doesn't throw — error path leaks span
  return;
}

// @expect-clean
async function inactiveSpanWithProperEnd(): Promise<void> {
  const span = Sentry.startInactiveSpan({ name: "parallel-work" });
  try {
    await fetch("https://api.example.com/data");
  } finally {
    span.end(); // always called
  }
}

// ---------------------------------------------------------------------------
// withMonitor — cron job monitoring patterns
// ---------------------------------------------------------------------------

// @expect-violation: monitor-callback-rethrows
// @expect-violation: monitor-slug-not-configured
async function monitorMissingConfigAndNoErrorHandling(): Promise<void> {
  // No upsertMonitorConfig — slug might not exist (silent miss)
  // No try/catch — error propagates as unhandled rejection
  await Sentry.withMonitor("my-cron-job", async () => {
    await runHeavyJob();
  });
}

// @expect-violation: monitor-slug-not-configured
async function monitorMissingUpsertConfig(): Promise<void> {
  try {
    await Sentry.withMonitor("my-cron-job", async () => {
      await runHeavyJob();
    });
    // No upsertMonitorConfig — if slug doesn't exist, check-ins are silently ignored
  } catch (err) {
    console.error("Cron job failed:", err);
  }
}

// @expect-clean
async function monitorWithProperConfigAndErrorHandling(): Promise<void> {
  try {
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
    // Error is already captured by withMonitor as status="error"
    // But we still need to handle it here to prevent unhandled rejection
    console.error("Cron job failed:", err);
  }
}

// ---------------------------------------------------------------------------
// captureCheckIn — manual two-step check-in pattern
// ---------------------------------------------------------------------------

// @expect-violation: checkin-completion-missing
async function checkInMissingCompletion(): Promise<void> {
  // Only sends in_progress — no ok/error check-in on completion/failure
  Sentry.captureCheckIn({
    monitorSlug: "my-cron",
    status: "in_progress",
  });
  await runHeavyJob(); // if this throws, completion check-in is never sent
  // Missing: Sentry.captureCheckIn({ monitorSlug: 'my-cron', status: 'ok', checkInId })
}

// @expect-violation: checkin-completion-missing
async function checkInMissingErrorCompletion(): Promise<void> {
  const checkInId = Sentry.captureCheckIn({
    monitorSlug: "my-cron",
    status: "in_progress",
  });
  await runHeavyJob();
  Sentry.captureCheckIn({ monitorSlug: "my-cron", status: "ok", checkInId });
  // Missing: error branch — if runHeavyJob throws, no error check-in is sent
}

// @expect-clean
async function checkInWithProperCompletion(): Promise<void> {
  const checkInId = Sentry.captureCheckIn({
    monitorSlug: "my-cron",
    status: "in_progress",
  });
  try {
    await runHeavyJob();
    Sentry.captureCheckIn({ monitorSlug: "my-cron", status: "ok", checkInId });
  } catch (err) {
    Sentry.captureCheckIn({
      monitorSlug: "my-cron",
      status: "error",
      checkInId,
    });
    throw err;
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
