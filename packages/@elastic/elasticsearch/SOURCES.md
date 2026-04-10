# Sources: @elastic/elasticsearch

All behavioral claims in `contract.yaml` are traced to the sources below.

## Official Documentation

| Claim | Source |
|-------|--------|
| All client methods throw on connection failure, timeout, or non-2xx response | https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-connecting.html |
| Error types: ResponseError, ConnectionError, TimeoutError, NoLivingConnectionsError, RequestAbortedError | https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-connecting.html |
| ResponseError contains meta.statusCode, meta.body, meta.headers | https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-connecting.html |
| bulk() Promise resolves even if individual items fail; check response.errors | https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-helpers.html |
| get() throws ResponseError 404 when document not found (v8 always throws, no ignore: [404]) | https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html |
| import { errors } from '@elastic/elasticsearch' for error type narrowing | https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-connecting.html |

## GitHub Repository

- Main repo: https://github.com/elastic/elasticsearch-js
- Error types source: https://github.com/elastic/elasticsearch-js/blob/main/src/errors.ts
- Changelog: https://github.com/elastic/elasticsearch-js/blob/main/CHANGELOG.md

## npm Package

- https://www.npmjs.com/package/@elastic/elasticsearch
- Current stable: v8.x (>=8.16.0 as of early 2026)

## Version Provenance

Versions found in `test-repos/`:
- `^8.6.0` — `test-repos/nextjs/examples/with-elasticsearch/package.json`
- `^7.13.0` — `test-repos/backstage/plugins/search-backend-module-elasticsearch/package.json`

Contract covers `>=7.0.0 <9.0.0`. Error handling semantics (try-catch requirement) are
identical across v7 and v8. The main v8 change (response body unwrapping) is noted in
contract notes but does not affect postcondition requirements.

## Real-World Evidence

_Pending real-world scan validation (Phase 7-8). Will be updated after scanning test repos._
