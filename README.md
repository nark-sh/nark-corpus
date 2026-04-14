# nark-corpus

**Contract library for nark — YAML definitions of error handling requirements for 169+ npm packages.**

This is the contract library used by [nark](https://github.com/nark-sh/nark), the contract coverage scanner. It contains 169+ contracts that describe how npm packages fail at runtime and what error handling callers must provide.

## What's a Contract?

A contract is a YAML file that describes:
- Which functions/methods in a package can fail
- How they fail (thrown errors, rejected promises, error events)
- What callers must do to handle those failures

Example contract for `axios`:

```yaml
package: axios
version: ">=0.21.0"
status: stable
imports:
  - module: axios
    default: axios
    named: [isAxiosError, AxiosError]
postconditions:
  - id: network-error-handling
    description: "HTTP requests must be wrapped in try-catch"
    severity: error
    trigger:
      function_call:
        object: axios
        methods: [get, post, put, patch, delete, request, head, options]
    requires:
      error_handling:
        type: try-catch
```

## Structure

```
nark-corpus/
├── packages/
│   ├── axios/
│   │   ├── contract.yaml     # Contract definition
│   │   ├── SOURCES.md        # Research sources
│   │   └── fixtures/         # Test fixtures
│   ├── @prisma/client/
│   │   ├── contract.yaml
│   │   ├── SOURCES.md
│   │   └── fixtures/
│   └── ...149 more packages
├── schema/
│   └── contract.schema.json  # JSON Schema for contracts
├── scripts/
│   └── validate-contracts.js # Validation script
└── package.json
```

## Covered Packages (169+)

| Category | Packages |
|----------|----------|
| HTTP clients | axios, got, node-fetch, undici, superagent, ky |
| Databases | prisma, knex, sequelize, typeorm, drizzle-orm, pg, mysql2, better-sqlite3, mongoose |
| Redis | ioredis, redis |
| Cloud - AWS | @aws-sdk/client-s3, client-dynamodb, client-ses, client-sqs, and more |
| Cloud - GCP | @google-cloud/storage, bigquery, pubsub, firestore |
| Cloud - Azure | @azure/storage-blob, cosmos, identity |
| Auth | jsonwebtoken, bcrypt, passport, @clerk/*, @auth0/* |
| Queues | bullmq, amqplib, kafkajs, bee-queue |
| AI/ML | openai, @anthropic-ai/sdk, @langchain/*, @mistralai/* |
| Email | nodemailer, @sendgrid/mail, resend, postmark |
| Payments | stripe, @paypal/checkout-server-sdk |
| Frameworks | express, fastify, @nestjs/*, @hapi/* |
| File/Storage | sharp, multer, fs-extra, archiver |
| Monitoring | @sentry/node, winston, pino, @datadog/* |
| And more... | 50+ additional packages |

## Using the Corpus

### With nark (recommended)

```bash
npm install nark nark-corpus
npx nark --tsconfig ./tsconfig.json
```

### Programmatic access

```javascript
import { getCorpusPath, getSchemaPath, getCorpusInfo } from 'nark-corpus';

// Get the path to the packages directory
const corpusPath = getCorpusPath();

// Get version and path info
const info = getCorpusInfo();
```

### Validate contracts

```bash
npm run validate
```

## Contributing a Contract

1. Create `packages/<name>/contract.yaml` following the schema
2. Add `SOURCES.md` linking to official docs, error references, changelogs
3. Add test fixtures in `packages/<name>/fixtures/`
4. Run `npm run validate` to check your contract
5. Submit a PR

See `schema/contract.schema.json` for the full contract schema.

## License

CC-BY-4.0 — contracts are freely usable with attribution.
