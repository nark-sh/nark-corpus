# Sources: braintree

## Official Documentation

- **Exceptions reference**: https://developer.paypal.com/braintree/docs/reference/general/exceptions/node
  All thrown exception types: AuthenticationError, AuthorizationError, NotFoundError, ServerError,
  GatewayTimeoutError, RequestTimeoutError, ServiceUnavailableError, TooManyRequestsError,
  UnexpectedError, UpgradeRequired.

- **Result objects**: https://developer.paypal.com/braintree/docs/reference/general/result-objects/node
  Braintree uses a dual error model. Infrastructure failures throw exceptions. Business logic failures
  (validation, declined cards) are returned in result objects (result.success=false, result.errors).

- **transaction.sale**: https://developer.paypal.com/braintree/docs/reference/request/transaction/sale/node
  Process a payment. Returns result object (check result.success). Throws on infrastructure failure.

- **transaction.refund**: https://developer.paypal.com/braintree/docs/reference/request/transaction/refund/node
  Refund a settled transaction. Throws if already fully refunded or wrong state.

- **clientToken.generate**: https://developer.paypal.com/braintree/docs/reference/request/client-token/generate/node
  Generate client token. Required for every checkout session.

- **customer.create**: https://developer.paypal.com/braintree/docs/reference/request/customer/create/node
  Create a customer record in the Braintree vault.

- **Validation errors**: https://developer.paypal.com/braintree/docs/reference/general/validation-errors/overview/node
  Access via result.errors.for().on() or result.errors.deepErrors().

## SDK Repository

- **braintree/braintree_node**: https://github.com/braintree/braintree_node
  Official Node.js SDK (333 stars). Source of error class hierarchy.

- **braintree_express_example**: https://github.com/braintree/braintree_express_example
  Official example: gateway.clientToken.generate(), gateway.transaction.find(), gateway.transaction.sale().
  Uses Promise-based API with .catch().

## Real-World Usage

- **nestjsx/nestjs-braintree** (76 stars): TypeScript NestJS module. Exposes gateway methods directly
  with no try-catch — all exceptions propagate to callers. Confirmed true positive pattern.
  Methods: transaction.sale, transaction.refund, subscription.create, subscription.cancel.

## Package

- **npm**: https://www.npmjs.com/package/braintree
- **Version**: 3.36.0 (latest as of 2026-03-13)
- **TypeScript types**: Limited official support. Community @types packages available.

## Error Handling Contract Rationale

Braintree has a dual error model (unusual among payment APIs):
1. **Infrastructure errors** → thrown exceptions (requires try-catch)
2. **Business logic errors** → result objects (requires result.success check)

This contract covers path 1 (thrown exceptions). Path 2 (result.success) requires separate
dataflow analysis not yet supported by the V2 analyzer.

Evidence quality: `partial` — nestjsx/nestjs-braintree confirms the antipattern exists in
production TypeScript code, but the repo has <100 stars. More real-world evidence needed.
