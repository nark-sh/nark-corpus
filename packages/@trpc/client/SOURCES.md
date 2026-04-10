# Sources — @trpc/client

## Documentation Sources

| URL | Fetched | Summary |
|-----|---------|---------|
| https://trpc.io/docs/client/vanilla | 2026-04-02 | Vanilla client overview |
| https://trpc.io/docs/client/vanilla/setup | 2026-04-02 | Client setup guide |
| https://trpc.io/docs/client/vanilla/infer-types | 2026-04-02 | Error handling pattern with isTRPCClientError |
| https://trpc.io/docs/server/error-handling | 2026-04-02 | TRPCError codes and error response structure |
| https://raw.githubusercontent.com/trpc/trpc/main/packages/client/src/TRPCClientError.ts | 2026-04-02 | TRPCClientError class definition |

## Key Evidence

From https://trpc.io/docs/client/vanilla/infer-types:
> The documented pattern for vanilla client error handling:
> ```typescript
> try {
>   await trpc.post.byId.query('1');
> } catch (cause) {
>   if (isTRPCClientError(cause)) {
>     console.log('data', cause.data);
>   }
> }
> ```

From https://trpc.io/docs/server/error-handling:
> tRPC defines error codes including UNAUTHORIZED (401), NOT_FOUND (404), INTERNAL_SERVER_ERROR (500).
> All procedure errors are wrapped in TRPCClientError on the client side.

## Type Definition Source

Examined from installed package `/tmp/trpc-examine/node_modules/@trpc/client/dist/`:
- `index.d.mts` — main exports
- `types.d-CAr6snH0.d.mts` — TRPCClientError class definition
- Both `.query()` and `.mutate()` return `Promise<output>` and throw `TRPCClientError`
