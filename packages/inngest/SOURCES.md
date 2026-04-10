# Sources: inngest

Reference documentation for the inngest contract.

## Official Documentation

| URL | Description |
|-----|-------------|
| https://www.inngest.com/docs/reference/typescript/events/send | `inngest.send()` reference — signature, return type, error behavior |
| https://www.inngest.com/docs/reference/typescript/client/create | `new Inngest()` constructor — `id` required, `eventKey` vs env var |
| https://www.inngest.com/docs/reference/functions/create | `inngest.createFunction()` — config, trigger, handler params |
| https://www.inngest.com/docs/reference/functions/step-run | `step.run()` — memoized execution, retry behavior |
| https://www.inngest.com/docs/reference/functions/step-sleep | `step.sleep()` — must be awaited |
| https://www.inngest.com/docs/reference/functions/step-sleep-until | `step.sleepUntil()` — must be awaited |
| https://www.inngest.com/docs/reference/functions/step-wait-for-event | `step.waitForEvent()` — returns null on timeout |
| https://www.inngest.com/docs/reference/functions/step-send-event | `step.sendEvent()` — use inside handlers instead of inngest.send() |
| https://www.inngest.com/docs/reference/functions/step-invoke | `step.invoke()` — invoke other Inngest functions |
| https://www.inngest.com/docs/reference/typescript/functions/errors | Error types: NonRetriableError, RetryAfterError, StepError |
| https://www.inngest.com/docs/reference/typescript/functions/handling-failures | `onFailure` handler — fires after all retries exhausted |
| https://www.inngest.com/docs/guides/error-handling | Error vs failure distinction, retry semantics |
| https://www.inngest.com/docs/functions/retries | Retry configuration, NonRetriableError, RetryAfterError |
| https://www.inngest.com/docs/getting-started/nextjs-quick-start | Next.js quickstart — canonical usage patterns |
| https://www.inngest.com/docs/learn/inngest-steps | All step methods overview |

## Package

- https://www.npmjs.com/package/inngest — npm page, download stats
- https://github.com/inngest/inngest-js — TypeScript SDK source

## Real-World Evidence

These are confirmed real-world examples of the anti-patterns this contract detects. They establish that the postconditions identify genuine bugs in production code — not theoretical edge cases.

| Project | Stars | Pattern Found | File | Classification |
|---------|-------|---------------|------|----------------|
| [documenso](https://github.com/documenso/documenso) | ~9k | `await this._client.send({...})` without try-catch inside `triggerJob()` | [`packages/lib/jobs/client/inngest.ts`](https://github.com/documenso/documenso/blob/main/packages/lib/jobs/client/inngest.ts) | TRUE_POSITIVE |

**Why this matters:** documenso is a production document-signing SaaS used by thousands. The `triggerJob()` method calls `inngest.send()` without error handling, meaning any Inngest API outage or misconfigured event key silently propagates as an unhandled exception through the job dispatch layer.

**Note on the official docs:** The [Inngest Next.js quickstart](https://www.inngest.com/docs/getting-started/nextjs-quick-start) itself omits try-catch on `send()` — which is exactly why AI-generated code reproduces this anti-pattern. Our contract corrects this documentation gap.

---

## Key Findings from Sources

1. **`inngest.send()` throws on failure** — the SDK makes an HTTP request and throws on network/API errors. The official docs do NOT wrap send() in try-catch in their quickstart examples, which is why AI-generated code often omits this.

2. **`step.waitForEvent()` returns null on timeout** — explicitly documented in the reference. The null case represents a timed-out wait (the event was never received). Accessing `.data` on a null result throws TypeError.

3. **`step.sendEvent()` inside handlers** — the docs explicitly recommend using `step.sendEvent()` instead of `inngest.send()` when sending events from within an Inngest function, because `step.sendEvent()` is memoized (won't re-send on retries).

4. **`serve()` no error handling needed** — confirmed in docs and examples. The `serve()` adapter (from `inngest/next`, `inngest/hono`, etc.) is a factory that returns route handlers. It does not make network calls.
