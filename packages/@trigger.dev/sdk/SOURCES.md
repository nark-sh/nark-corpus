# Sources: @trigger.dev/sdk

## Official Documentation

### Error Handling
- https://trigger.dev/docs/errors-retrying — Official error handling and retry docs
- https://trigger.dev/docs/v3/errors-retrying — V3 error handling documentation

### Run Management
- https://trigger.dev/docs/management/runs/trigger — tasks.trigger() API reference
- https://trigger.dev/docs/management/runs/retrieve — runs.retrieve() API reference
- https://trigger.dev/docs/management/runs/list — runs.list() API reference

### Schedule Management
- https://trigger.dev/docs/management/schedules/create — schedules.create() API reference
- https://trigger.dev/docs/management/schedules/update — schedules.update() API reference

## Error Type Evidence

The SDK throws `ApiRequestError` (extends `Error`) for all HTTP errors. From SDK source and docs:
- 401: Invalid or missing `TRIGGER_SECRET_KEY` environment variable
- 403: API key lacks required permissions
- 404: Run/task/schedule not found
- 422: Validation error (invalid cron expression, unknown task ID)
- 429: Rate limit exceeded — common in high-throughput job triggering
- 500/503: Trigger.dev service error

## Real-World Evidence

### recoupable--api (local test repo)
Found in `lib/trigger/`:
- `triggerRunSandboxCommand.ts:18` — `tasks.trigger("run-sandbox-command", payload)` without try-catch
- `createSchedule.ts:21` — `schedules.create({...})` without try-catch
- `updateSchedule.ts:18` — `schedules.update(scheduleId, {...})` without try-catch
- `retrieveTaskRun.ts:10` — `runs.retrieve(runId)` without try-catch
- `listTaskRuns.ts:22` — `runs.list({tag: [tag], limit})` without try-catch

All 5 call sites lack try-catch. Strong evidence of common misuse pattern.
