# Sources — resend

## Official Documentation

| URL | Description |
|-----|-------------|
| https://resend.com/docs/send-with-nodejs | Node.js quickstart with emails.send() examples |
| https://resend.com/docs/api-reference/emails/send-email | emails.send() API reference — params, response shape |
| https://resend.com/docs/api-reference/emails/send-batch-emails | batch.send() API reference |
| https://resend.com/docs/api-reference/introduction#errors | Error response format: { name, message, statusCode } |
| https://resend.com/docs/api-reference/introduction#error-codes | All error codes with descriptions |

## GitHub

| URL | Description |
|-----|-------------|
| https://github.com/resend/resend-node | Official Node.js SDK source code |
| https://github.com/resend/resend-node/releases | Changelog — v2.0 introduced { data, error } result pattern |

## Key Behavioral Claims

| Claim | Source |
|-------|--------|
| SDK returns { data, error } — does not throw | https://resend.com/docs/api-reference/introduction#errors |
| Rate limit: returns statusCode=429 | https://resend.com/docs/api-reference/introduction#error-codes |
| Invalid from address: returns error (domain must be verified) | https://resend.com/docs/api-reference/introduction#error-codes |
| Batch failures are all-or-nothing | https://resend.com/docs/api-reference/emails/send-batch-emails |
