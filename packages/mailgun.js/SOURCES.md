# Sources — mailgun.js

## Official Documentation

- **GitHub README** — https://github.com/mailgun/mailgun.js#readme
  - Initialization pattern (Mailgun class, FormData, client())
  - messages.create() API with error handling examples (.catch())
  - EU infrastructure configuration

- **Mailgun API Reference** — https://documentation.mailgun.com/docs/mailgun/api-reference/openapi-final/tag/Messages/
  - Official REST API documentation for the Messages endpoint
  - Error codes and response formats

- **npm package** — https://www.npmjs.com/package/mailgun.js
  - Version history, installation

## Error Handling Evidence

- **Issue #411: Unauthorized Error when calling mg.messages.create()** — https://github.com/mailgun/mailgun.js/issues/411
  - Confirms throws: `[Error: UNAUTHORIZED] { status: 401, details: 'Forbidden' }`
  - Shows the error object structure

- **Issue #269: Weird error on Node.js v18** — https://github.com/mailgun/mailgun.js/issues/269
  - Confirms throwing behavior on network-level errors

## Real-World Usage

- **strapi email-mailgun provider** — https://github.com/strapi/strapi/blob/main/packages/providers/email-mailgun/src/index.ts
  - Direct call to `mg.messages.create()` without try-catch (v10.2.1)

- **bulletproof-nodejs mailer service** — https://github.com/santiq/bulletproof-nodejs
  - Uses injected mailgun client: `this.emailClient.messages.create()` (v3.3.0)
