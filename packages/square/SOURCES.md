# Sources: square

**Package:** square
**Version Range:** >=8.0.0
**Last Updated:** 2026-02-25

---

## Official Documentation

### Primary Sources

1. **Square Node.js SDK Overview**
   https://developer.squareup.com/docs/sdks/nodejs
   - SDK features and capabilities
   - Client initialization
   - Retry configuration

2. **Square Node.js SDK Quickstart**
   https://developer.squareup.com/docs/sdks/nodejs/quick-start
   - Getting started guide
   - Error handling example with SquareError
   - Locations API example

3. **Using the Square Node.js SDK**
   https://developer.squareup.com/docs/sdks/nodejs/using-nodejs-sdk
   - Detailed usage patterns
   - Client configuration
   - API examples

4. **GitHub Repository**
   https://github.com/square/square-nodejs-sdk
   - Official TypeScript SDK source code
   - README with examples
   - API documentation

### Error Handling Documentation

5. **Square Error Handling Guide**
   https://developer.squareup.com/docs/build-basics/general-considerations/handling-errors
   - Error types and status codes
   - Recommended error handling patterns
   - Retry strategies

6. **Payments API Error Handling**
   https://developer.squareup.com/docs/payments-api/error-handling
   - Payment-specific error scenarios
   - Decline codes and handling
   - Best practices for payment failures

### API-Specific Documentation

7. **Common API Patterns - Rate Limiting**
   https://developer.squareup.com/docs/build-basics/common-api-patterns/rate-limiting
   - Rate limit thresholds
   - 429 response handling
   - Retry strategies

8. **Common API Patterns - Idempotency**
   https://developer.squareup.com/docs/build-basics/common-api-patterns/idempotency
   - Idempotency key usage
   - Conflict handling (409 responses)
   - Best practices for retries

9. **Orders API - Error Scenarios**
   https://developer.squareup.com/docs/orders-api/error-scenarios
   - Order-specific validation errors
   - Version conflict handling
   - Missing order handling

10. **Orders API - Managing Orders**
    https://developer.squareup.com/docs/orders-api/manage-orders
    - Order lifecycle
    - Version management
    - Update patterns

11. **Customers API - Use the API**
    https://developer.squareup.com/docs/customers-api/use-the-api
    - Customer creation and retrieval
    - Duplicate customer handling
    - Customer data validation

### Migration and Versioning

12. **Square Node.js SDK Migration Guide**
    https://developer.squareup.com/docs/sdks/nodejs/migration
    - Version 40.0.0+ breaking changes
    - Parameter name changes
    - Client construction updates

---

## Error Types

### SquareError

**Import:** `import { SquareError } from "square"`

**Thrown when:** API returns non-success status code (4xx or 5xx)

**Properties:**
- `statusCode`: HTTP status code (number)
- `message`: Error message (string)
- `body`: Response body (object)
- `errors`: Array of error objects with:
  - `category`: Error category (string)
  - `code`: Specific error code (string)
  - `detail`: Detailed error message (string)
- `rawResponse`: Full HTTP response object

**Usage Example:**
```typescript
import { Client, SquareError } from "square";

try {
  const response = await client.payments.create({
    sourceId: "cnon:card-nonce-ok",
    amountMoney: { amount: BigInt(100), currency: "USD" },
    idempotencyKey: "unique-key-123"
  });
} catch (err) {
  if (err instanceof SquareError) {
    console.log(`Status: ${err.statusCode}`);
    console.log(`Message: ${err.message}`);
    err.errors?.forEach(e => {
      console.log(`${e.category}: ${e.code} - ${e.detail}`);
    });
  }
}
```

---

## Common Error Scenarios

### 1. Authentication Errors (401)

**Cause:** Invalid or expired access token

**Handling:**
- DO NOT retry
- Check API credentials
- Alert operations team

**Source:** https://developer.squareup.com/docs/sdks/nodejs

---

### 2. Rate Limiting (429)

**Cause:** Too many API requests

**Handling:**
- SDK automatically retries (default: 2 attempts)
- Implement exponential backoff for extended rate limiting
- Monitor rate limit headers

**Source:** https://developer.squareup.com/docs/build-basics/common-api-patterns/rate-limiting

---

### 3. Validation Errors (400, 422)

**Cause:** Invalid request parameters or payment declined

**Handling:**
- Check `err.errors` array for specific issues
- Validate required fields
- For payment declines, display user-friendly message
- DO NOT retry without fixing validation issues

**Source:** https://developer.squareup.com/docs/payments-api/error-handling

---

### 4. Idempotency Conflicts (409)

**Cause:** Idempotency key reused with different parameters

**Handling:**
- Generate new idempotency key
- Or retrieve the original result
- DO NOT retry with same key and different data

**Source:** https://developer.squareup.com/docs/build-basics/common-api-patterns/idempotency

---

### 5. Resource Not Found (404)

**Cause:** Customer ID, Order ID, or other resource doesn't exist

**Handling:**
- Handle missing resource gracefully
- DO NOT retry
- Update application state to reflect missing resource

**Source:** https://developer.squareup.com/docs/customers-api/use-the-api

---

### 6. Server Errors (5xx)

**Cause:** Square server error or temporary outage

**Handling:**
- SDK automatically retries (default: 2 attempts)
- Implement exponential backoff
- Log errors and monitor for persistent issues
- Use idempotency keys to prevent duplicate operations

**Source:** https://developer.squareup.com/docs/sdks/nodejs

---

### 7. Network Errors (408, Connection Errors)

**Cause:** Network connectivity issues or timeouts

**Handling:**
- SDK automatically retries 408 errors (default: 2 attempts)
- Implement exponential backoff for connection errors
- Always use idempotency keys for non-idempotent operations

**Source:** https://developer.squareup.com/docs/sdks/nodejs

---

## SDK Configuration

### Retry Configuration

The SDK supports configuring retry behavior:

```typescript
const client = new Client({
  accessToken: "YOUR_ACCESS_TOKEN",
  environment: Environment.Production,
  // Global retry configuration
  timeout: 60000,
  maxRetries: 3  // Default: 2
});

// Per-request retry override
const response = await client.payments.create(
  requestBody,
  { maxRetries: 5 }
);
```

**Default Retry Behavior:**
- Retries on: 408 (Timeout), 429 (Rate Limit), 5xx (Server Errors)
- Default attempts: 2 retries
- Strategy: Exponential backoff

**Source:** https://developer.squareup.com/docs/sdks/nodejs

---

## Main API Areas

### Payments API
- `client.payments.create()` - Create payment
- `client.paymentsApi.createPayment()` - Legacy method
- Error handling: Payment declines, validation errors, rate limits

### Orders API
- `client.ordersApi.createOrder()` - Create order
- `client.ordersApi.updateOrder()` - Update order
- Error handling: Version conflicts, validation errors

### Customers API
- `client.customersApi.createCustomer()` - Create customer
- `client.customersApi.retrieveCustomer()` - Get customer by ID
- Error handling: Duplicate customers, missing customers

### Locations API
- `client.locations.list()` - List all locations
- Error handling: Authentication errors, rate limits

---

## Additional Resources

### Community Examples

13. **Square API with Node.js Guide**
    https://www.w3tutorials.net/blog/square-api-nodejs/
    - Community examples and patterns

14. **Getting Started with Square Node.js SDK (LogRocket)**
    https://blog.logrocket.com/getting-started-square-node-js-sdk/
    - Tutorial with error handling examples

15. **Web Payments SDK Exception Handling**
    https://developer.squareup.com/docs/web-payments/exception-handling
    - Browser-side error handling patterns

---

## Security Considerations

### No Known CVEs

As of 2026-02-25, no CVEs found for the `square` npm package.

**Searched:**
- CVE databases (cvedetails.com, nvd.nist.gov)
- npm security advisories
- GitHub security advisories
- Snyk vulnerability database

### Best Practices

1. **Always use idempotency keys** for payment operations
2. **Implement exponential backoff** for retries
3. **Validate request data** before API calls
4. **Handle payment declines gracefully** with user-friendly messages
5. **Monitor rate limits** and implement backoff strategies
6. **Use environment variables** for access tokens (never hardcode)

---

## Package Information

- **npm:** https://www.npmjs.com/package/square
- **Current version:** 44.0.0+ (as of Feb 2025)
- **Breaking changes:** Version 40.0.0 introduced breaking changes
- **Deprecated:** `square-connect` (use `square` instead)

---

## Verification Status

✅ **Verified:** 2026-02-25
✅ **Sources:** All links verified and accessible
✅ **Contract Version:** 1.0.0
✅ **Package Version Range:** >=8.0.0
