# Sources: postmark

## Official Documentation

- **Email API Reference**: https://postmarkapp.com/developer/api/email-api
  - Documents sendEmail, sendEmailBatch endpoints and response format
- **Templates API**: https://postmarkapp.com/developer/api/templates-api
  - Documents sendEmailWithTemplate, sendEmailBatchWithTemplates
- **Error Codes**: https://postmarkapp.com/developer/api/overview#error-codes
  - Complete list of API error codes and their meanings
- **API Overview**: https://postmarkapp.com/developer/api/overview
  - Authentication, rate limits, general API behavior

## SDK Source Code

- **Error Classes**: https://github.com/ActiveCampaign/postmark.js/blob/main/src/client/errors/Errors.ts
  - Complete error hierarchy: PostmarkError → HttpError → {InvalidAPIKeyError, InternalServerError, etc.}
  - ApiInputError subclasses: InactiveRecipientsError (406), InvalidEmailRequestError (300)
- **Error Handler**: https://github.com/ActiveCampaign/postmark.js/blob/main/src/client/errors/ErrorHandler.ts
  - HTTP status code → error class mapping (401, 404, 422, 429, 500, 503)
- **ServerClient**: https://github.com/ActiveCampaign/postmark.js/blob/main/src/client/ServerClient.ts
  - All public methods, parameter types, return types
- **BaseClient**: https://github.com/ActiveCampaign/postmark.js/blob/main/src/client/BaseClient.ts
  - HTTP request pipeline, error propagation flow

## Evidence Quality: partial

- Limited local test-repo coverage (blitz template, n8n node — not direct SDK usage)
- GitHub search unavailable during onboarding (auth expired)
- Contract based on SDK source code analysis — high confidence in error behavior
