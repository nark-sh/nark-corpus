# Sources: pusher

Behavioral claims in `contract.yaml` are derived from the following sources.

## Primary Sources

### Official Library (GitHub README)

**URL:** https://github.com/pusher/pusher-http-node

The primary API reference for the `pusher` Node.js server library. Documents:
- All method signatures (`trigger`, `triggerBatch`, `sendToUser`, `get`, `authorizeChannel`, `authenticateUser`)
- Error handling section: `RequestError` class with `status`, `error`, `body`, `url` properties
- Promise-based API (v4+ — callbacks removed)
- Event format and channel constraints (max 100 channels per trigger, max 10 events per triggerBatch)

**Postconditions supported:**
- `trigger: api-error` — "pusher.trigger will reject the promise with a Pusher.RequestError if the API returns an error status code or there is a network failure"
- `triggerBatch: api-error` — same error surface as trigger
- `sendToUser: api-error` — same error surface

### Pusher REST API Reference

**URL:** https://pusher.com/docs/channels/library_auth_reference/rest-api/

Documents the underlying HTTP API that the Node.js library wraps. Defines error status codes:
- 400 Bad Request — validation errors (invalid channel name, event name too long)
- 401 Unauthorized — invalid app credentials
- 403 Forbidden — not authorized for this operation
- 413 Entity Too Large — message body too large
- 429 Too Many Requests — rate limit exceeded

### Pusher Channel Types

**URL:** https://pusher.com/docs/channels/using_channels/channel-types/

Documents public, private (`private-`), presence (`presence-`), and encrypted (`private-encrypted-`) channels.
Relevant for understanding what `trigger` and `sendToUser` operate on.

### Pusher User Authentication

**URL:** https://pusher.com/docs/channels/server_api/authenticating-users/

Documents the `authenticateUser` and `sendToUser` API for user-bound messaging.
`sendToUser` requires clients to have authenticated via `pusher-js` `signin()`.

## Version History Sources

### v5.3.2 Release Notes

**URL:** https://github.com/pusher/pusher-http-node/releases/tag/v5.3.2

"Fixed missing error types for TypeScript support" — `RequestError` and `WebHookError`
now properly exported as named TypeScript types (previously not exported).

### v5.0.0 Migration

**URL:** https://github.com/pusher/pusher-http-node/blob/master/CHANGELOG.md

Breaking change: `trigger(channel, event, data, socketId)` → `trigger(channel, event, data, { socket_id })`.
The 4th positional string argument for socket_id exclusion became a params object.

### v4.0.0 Migration (Callbacks → Promises)

Documented in CHANGELOG: removed callback-based API, all async methods now return Promises.
`RequestError.statusCode` renamed to `RequestError.status`.

## Real-World Evidence

*No real-world TPs confirmed yet — evidence_quality: stub.*

TODO: Search GitHub for TypeScript SaaS repos using `pusher` and confirm TRUE_POSITIVE violations
in production code to upgrade evidence_quality to `partial` or `confirmed`.
