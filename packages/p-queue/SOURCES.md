# Sources — p-queue

## Documentation Fetched (2026-04-02)

| URL | Summary |
|-----|---------|
| https://raw.githubusercontent.com/sindresorhus/p-queue/main/readme.md | p-queue README. Explicitly states "If your items can potentially throw an exception, you must handle those errors from the returned Promise." Documents TimeoutError and error event. |
| https://raw.githubusercontent.com/sindresorhus/p-queue/main/source/index.ts | p-queue source. add() is async, uses pTimeout for timeout option. Emits 'error' event when task rejects. Promise still rejects even with error listener. |

## Key Quote

From the README:
> "If your items can potentially throw an exception, you must handle those errors from
> the returned Promise or they may be reported as an unhandled Promise rejection."

## Error Types

- `TimeoutError` — task exceeds `timeout` option (exported from p-queue)
- Task-specific errors — any error thrown by the task function
- `AbortError` — when AbortSignal is aborted
