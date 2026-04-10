# Stripe Behavioral Contract - Sources

## Official Documentation

### Error Handling
- **Main Error Handling Guide**: https://docs.stripe.com/error-handling
- **API Error Reference**: https://docs.stripe.com/api/errors
- **Idempotent Requests**: https://docs.stripe.com/api/idempotent_requests
- **Webhook Signatures**: https://docs.stripe.com/webhooks/signatures
- **Rate Limits**: https://docs.stripe.com/rate-limits

### API References
- **Charges API**: https://docs.stripe.com/api/charges
- **PaymentIntents API**: https://docs.stripe.com/api/payment_intents
- **Customers API**: https://docs.stripe.com/api/customers
- **Refunds API**: https://docs.stripe.com/api/refunds
- **Webhooks API**: https://docs.stripe.com/api/webhook_endpoints

## Error Types

### CardError
**When it occurs**: Payment processing failures - cards declined, expired, or blocked

**Common codes**:
- `card_declined`: Card was declined by issuer
- `expired_card`: Card has expired
- `incorrect_cvc`: CVC code is incorrect
- `processing_error`: Generic processing failure

**Handling strategy**:
- Distinguish between fraud blocks, issuer declines, and other problems
- Prompt customers for alternative payment methods
- DO NOT retry without user intervention
- Display user-friendly error messages based on decline code

**Source**: https://docs.stripe.com/error-handling

### InvalidRequestError
**When it occurs**: API calls with incorrect parameters or invalid state

**Properties**:
- `param`: The parameter that caused the error
- `doc_url`: Link to documentation for the error
- `code`: Specific error code (e.g., `resource_missing`, `charge_already_refunded`)

**Common codes**:
- `resource_missing`: Requested resource doesn't exist
- `charge_already_refunded`: Charge has already been fully refunded
- `parameter_invalid_integer`: Parameter should be an integer

**Handling strategy**:
- Use `param` field to identify which parameter is problematic
- Consult `doc_url` for specific guidance
- DO NOT retry without fixing the parameter issue

**Source**: https://docs.stripe.com/api/errors

### RateLimitError
**When it occurs**: Exceeding API call volume limits

**Handling strategy**:
- Implement exponential backoff retry logic
- Use Retry-After header if present
- Rate limits are per-account, not per-API-key
- Contact Stripe support for anticipated traffic spikes
- Consider request queuing for sustained high volume

**Source**: https://docs.stripe.com/rate-limits

### AuthenticationError
**When it occurs**: Invalid, missing, or revoked API credentials

**Handling strategy**:
- DO NOT retry - this is a configuration error
- Verify correct API key usage (test vs live mode)
- Check if keys have been rotated or revoked
- Alert operations team immediately
- Never log API keys in error messages

**Source**: https://docs.stripe.com/error-handling

### APIConnectionError (Network Errors)
**When it occurs**: Network connectivity problems between your server and Stripe

**Handling strategy**:
- Treat outcomes as indeterminate
- ALWAYS use idempotency keys for safe retries
- Implement exponential backoff (max 3 attempts recommended)
- Query payment status before creating new payment
- Consider enabling automatic retries in Stripe SDK

**Source**: https://docs.stripe.com/error-handling

## Idempotency

### Critical Concept
**All mutating operations MUST use idempotency keys** to prevent duplicate charges, refunds, or customer creation.

**Key Rules**:
1. Use unique idempotency key per logical operation
2. Same key + different parameters returns original result (NOT an error)
3. Keys can be reused after 24 hours
4. Network errors require retry with SAME idempotency key
5. Payment-critical operations always need idempotency keys

**Source**: https://docs.stripe.com/api/idempotent_requests

### Idempotency Key Errors
**StripeIdempotencyError**: Idempotency key used with different parameters

**Handling**: This indicates a logic error in your code. Each unique operation should have a unique key.

## Webhooks

### Signature Verification (CRITICAL)
**ALWAYS verify webhook signatures** to prevent spoofing and replay attacks.

**Security Requirements**:
1. Use `stripe.webhooks.constructEvent()` with signature header
2. NEVER process webhook data without verification
3. Return 400 if signature verification fails
4. Log signature failures for security monitoring
5. Check timestamp to prevent replay attacks (tolerance window configurable)

**Source**: https://docs.stripe.com/webhooks/signatures

### Webhook Reliability
- Stripe retries failed webhooks once per hour for up to 3 days
- Return 2xx status code to acknowledge receipt
- 3xx, 4xx, 5xx codes indicate failure - Stripe will retry
- Implement idempotent webhook handlers (Stripe may send duplicates)

**Source**: [Webhook Best Practices](https://docs.stripe.com/webhooks/best-practices)

### Common Webhook Issues
**Duplicate events**: Stripe may send same event multiple times

**Handling strategy**:
1. Track processed event IDs
2. Make handlers idempotent
3. Return 2xx even for duplicates
4. Use database uniqueness constraints where applicable

**GitHub Issue**: [Are Stripe webhooks idempotent? (#612)](https://github.com/code-corps/code-corps-api/issues/612)

## Common Production Issues

### Issue 1: Missing Idempotency Keys
**Severity**: Critical - Money loss risk

**Problem**: AI-generated or naive implementations often omit idempotency keys, causing:
- Duplicate charges on network errors
- Duplicate refunds
- Duplicate customer records

**Solution**: Production-safe implementations use idempotency guards

**Reference**: [stripe-webhook-idempotency-guard](https://github.com/primeautomation-dev/stripe-webhook-idempotency-guard)

### Issue 2: Webhook Signature Verification Failures
**Severity**: High - Security risk

**Problem**: Signature verification can fail due to:
- Incorrect webhook secret
- Timestamp outside tolerance zone (replay attack prevention)
- Payload tampering

**Solution**: Always verify, log failures, return 400

**GitHub Issue**: [Webhook validate signing error (#1254)](https://github.com/stripe/stripe-node/issues/1254)

### Issue 3: Retry Logic for POST Requests
**Severity**: High - Idempotency risk

**Problem**: Retrying POST requests without idempotency keys can duplicate operations

**Solution**: For non-idempotent methods (POST), ensure retry safety with idempotency keys

### Issue 4: Handling 3D Secure
**Severity**: Medium - Payment completion failure

**Problem**: PaymentIntents may return `status: 'requires_action'` for 3D Secure authentication

**Solution**: Check payment status and present authentication flow to user

**Source**: https://docs.stripe.com/payments/3d-secure

## Security Advisories

**Last Checked**: 2026-02-23

### CVE Statistics
- 2024: 1 security vulnerability
- 2025: 0 vulnerabilities

### Notable Security Issues

**Deprecated API Exploitation (2024-2025)**:
A web skimmer campaign exploited the legacy `api.stripe.com/v1/sources` API (deprecated May 15, 2024) to validate stolen card data. The campaign affected 49 sites since August 2024.

**Recommendation**: Use modern PaymentMethods API, not deprecated Sources API

**Sources**:
- [Legacy Stripe API Exploited](https://thehackernews.com/2025/04/legacy-stripe-api-exploited-to-validate.html)
- [Sophisticated Web Skimmer](https://www.sisainfosec.com/weekly-threat-watch/sophisticated-web-skimmer-exploits-deprecated-stripe-api-to-steal-payment-data/)

**Stripe CLI Vulnerability**:
Vulnerability in stripe-cli >= 1.11.1 with malformed plugin shortnames via `--archive-url`

**Source**: [GHSA-fv4g-gwpj-74gr](https://github.com/stripe/stripe-cli/security/advisories/GHSA-fv4g-gwpj-74gr)

## Best Practices Summary

### 1. Always Use Idempotency Keys
- ✅ Charges, PaymentIntents, Refunds: MUST have idempotency keys
- ✅ Customers: SHOULD have idempotency keys
- ✅ Network errors: Retry with SAME key
- ✅ Generate unique key per logical operation (use request ID, UUID, etc.)

### 2. Error Handling Patterns
```javascript
try {
  const charge = await stripe.charges.create(
    { amount, currency, source },
    { idempotencyKey: requestId }
  );
} catch (err) {
  if (err.type === 'StripeCardError') {
    // Card was declined - show user-friendly message
  } else if (err.type === 'StripeRateLimitError') {
    // Too many requests - exponential backoff
  } else if (err.type === 'StripeAuthenticationError') {
    // Invalid API key - alert ops team, don't retry
  } else if (err.type === 'StripeConnectionError') {
    // Network error - retry with SAME idempotency key
  }
}
```

### 3. Webhook Verification (Required)
```javascript
let event;
try {
  event = stripe.webhooks.constructEvent(
    request.body,
    request.headers['stripe-signature'],
    webhookSecret
  );
} catch (err) {
  // Signature verification failed - possible attack
  return response.status(400).send(`Webhook Error: ${err.message}`);
}

// Process verified event
```

### 4. Query Before Retry
For indeterminate network errors, query payment status before creating new payment:

```javascript
// After network error, check if payment succeeded
const payment = await stripe.paymentIntents.retrieve(paymentId);
if (payment.status === 'succeeded') {
  // Payment went through despite network error
} else {
  // Safe to retry with same idempotency key
}
```

## Verification Date
**Last Verified**: 2026-02-23
**Stripe API Version**: 2024+ (current)
**Documentation Version**: Current as of February 2026
