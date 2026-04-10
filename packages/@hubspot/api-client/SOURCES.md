# Sources: @hubspot/api-client

## Official Documentation

- **HubSpot API Error Handling Guide**
  https://developers.hubspot.com/docs/api/error-handling
  Overview of HubSpot API error codes, rate limiting, and retry strategies.

- **CRM Contacts API Reference**
  https://developers.hubspot.com/docs/api/crm/contacts
  Documents create, update, archive, getById, and doSearch endpoints for contacts.

- **CRM Search API Reference**
  https://developers.hubspot.com/docs/api/crm/search
  Documents the doSearch endpoint, filter groups, and pagination.

- **HubSpot Node.js SDK GitHub Repository**
  https://github.com/HubSpot/hubspot-api-nodejs
  Source code and README for the official `@hubspot/api-client` npm package.

- **npm package page**
  https://www.npmjs.com/package/@hubspot/api-client
  Version history, weekly downloads, metadata.

## Error Contract Evidence

From the official error handling docs:
- All API methods throw when the response status is 4xx or 5xx
- 401: Invalid API key or expired OAuth token
- 403: Insufficient OAuth scope
- 404: Object not found by ID
- 409: Conflict (e.g., contact with email already exists) — error message contains existing ID
- 429: Rate limit exceeded — requires exponential backoff
- 5xx: Server-side HubSpot error — retry with backoff

From SDK source (github.com/HubSpot/hubspot-api-nodejs):
- The SDK wraps `node-fetch` / `axios` internally
- Non-2xx responses throw an `Error` with `body.message` and `statusCode`
- Network errors propagate as native `Error` objects

## Real-World Evidence

### cal.com (packages/app-store/hubspot/lib/CrmService.ts)
- **Version:** 6.0.1
- **Direct violations found:**
  - `hubspotClient.crm.objects.meetings.basicApi.create()` — no try-catch (TP)
  - `hubspotClient.crm.associations.batchApi.create()` — no try-catch (TP)
  - `hubspotClient.crm.objects.meetings.basicApi.update()` (×2) — no try-catch (TP)
  - `hubspotClient.crm.objects.meetings.basicApi.archive()` — no try-catch (TP)
  - `hubspotClient.crm.contacts.searchApi.doSearch()` — no try-catch (TP)
  - `hubspotClient.crm.contacts.basicApi.getById()` — no try-catch (TP)
- **Properly handled (negative examples):**
  - `hubspotClient.crm.properties.coreApi.getAll()` — wrapped in try-catch ✅
  - `hubspotClient.crm.contacts.basicApi.create()` — has .catch() ✅
  - `hubspotClient.crm.contacts.basicApi.update()` — wrapped in try-catch ✅
  - `hubspotClient.crm.owners.ownersApi.getPage()` — wrapped in try-catch ✅
