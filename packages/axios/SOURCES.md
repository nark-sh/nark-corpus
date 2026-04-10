# Axios Behavioral Contract Sources

This document lists all authoritative sources consulted when creating the axios behavioral contract.

**Package:** axios
**Versions Covered:** 1.0.0 - 1.x.x
**Contract Version:** 1.0.0
**Last Verified:** 2026-02-23

---

## Official Documentation

### Core Documentation
- **Request Config**: https://axios-http.com/docs/req_config
  - Documents URL requirements (absolute vs relative)
  - Documents timeout defaults (0 = no timeout)
  - Documents request configuration options

- **Response Schema**: https://axios-http.com/docs/res_schema
  - Documents AxiosResponse structure
  - Fields: data, status, statusText, headers, config, request

- **Handling Errors**: https://axios-http.com/docs/handling_errors
  - Documents AxiosError structure
  - Documents error.response, error.request, error.message patterns
  - Documents error status codes (4xx, 5xx)
  - Documents network failure cases (no error.response)

- **Cancellation**: https://axios-http.com/docs/cancellation
  - Documents AbortController integration
  - Documents ERR_CANCELED error code

---

## GitHub Issues (Known Behavioral Edge Cases)

### Relative URLs in Node.js
- **Issue**: https://github.com/axios/axios/issues/1212
- **Summary**: Relative URLs throw errors in Node.js environments but work in browsers
- **Status**: Working as intended (Node.js doesn't have a base URL context)
- **Relevance**: Encoded as `edge_cases: relative-url-node` with severity warning

### Rate Limiting (429 Responses)
- **HTTP Spec**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429
- **Summary**: 429 responses indicate rate limiting and SHOULD include Retry-After header
- **Relevance**: Encoded as critical postcondition requiring explicit handling or retry logic

---

## HTTP Specifications Referenced

### DELETE Idempotency
- **Spec**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/DELETE
- **Summary**: DELETE is defined as idempotent by HTTP spec
- **Relevance**: Encoded as edge case noting that API implementations may vary

### Status Code Semantics
- **4xx Client Errors**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses
- **5xx Server Errors**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses
- **Relevance**: Contract distinguishes between client and server error handling

---

## Testing Against Real Codebases

The following open-source TypeScript projects were examined to validate this contract:

### Verified to catch real violations:
1. **Project**: (TBD - manual testing required)
   - **Violation Found**: axios.get() called without checking error.response exists
   - **Location**: (TBD)

2. **Project**: (TBD - manual testing required)
   - **Violation Found**: catch block ignores 429 status
   - **Location**: (TBD)

### Verified zero false positives:
1. **Project**: (TBD - manual testing required)
   - **Result**: No false positives on correct error handling patterns

---

## Known CVEs and Security Issues

### None Currently Documented
As of 2026-02-23, there are no open CVEs related to behavioral contracts.

If security issues are discovered that relate to behavioral misuse (e.g., algorithm confusion), they will be documented here.

---

## Version History

### 1.0.0 (2026-02-23)
- Initial contract covering axios 1.x
- Covers: get, post, put, delete, request methods
- Error states: 4xx, 5xx, 429, network failures, setup errors
- Edge cases: relative URLs, timeout defaults, cancellation

---

## Maintenance Notes

### Next Review: 2026-05-23 (3 months)

Review triggers:
- [ ] axios releases 1.x major/minor version
- [ ] New GitHub issues document behavioral edge cases
- [ ] False positives reported in real codebases
- [ ] New CVEs related to error handling

---

## Questions or Corrections

If you find:
- Incorrect behavioral claims
- Missing error states
- Broken documentation links
- Behavioral changes in newer axios versions

Please open an issue with label `package:axios`.
