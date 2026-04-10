# Sources: firebase-admin

**Contract Version:** 1.0.0
**Last Verified:** 2026-02-25
**Package Version:** >=11.0.0 <14.0.0

---

## Official Documentation

### Error Handling
- **Admin SDK Error Handling**
  https://firebase.google.com/docs/reference/admin/error-handling
  *Describes two error categories: programming errors and API errors*

- **Admin Authentication API Errors**
  https://firebase.google.com/docs/auth/admin/errors
  *Complete list of auth error codes and scenarios*

- **FCM Error Codes**
  https://firebase.google.com/docs/cloud-messaging/error-codes
  *Firebase Cloud Messaging error codes and handling*

- **Firestore Error Codes**
  https://cloud.google.com/firestore/docs/understand-error-codes
  *gRPC error codes used by Firestore (PERMISSION_DENIED, DEADLINE_EXCEEDED, etc.)*

### Service-Specific Documentation
- **Verify ID Tokens**
  https://firebase.google.com/docs/auth/admin/verify-id-tokens
  *Token verification patterns and error scenarios*

- **Manage Users**
  https://firebase.google.com/docs/auth/admin/manage-users
  *User management operations: create, get, update, delete*

- **Custom Claims**
  https://firebase.google.com/docs/auth/admin/custom-claims
  *Setting custom claims with size and key restrictions*

- **Get Firestore Data**
  https://firebase.google.com/docs/firestore/query-data/get-data
  *Reading documents and checking existence*

- **Add Firestore Data**
  https://firebase.google.com/docs/firestore/manage-data/add-data
  *Writing, updating, and deleting documents*

- **Firestore Best Practices**
  https://firebase.google.com/docs/firestore/best-practices
  *Rate limiting, hot spots, quota management*

- **Send FCM Messages**
  https://firebase.google.com/docs/cloud-messaging/send-message
  *Sending to devices, topics, and batches*

- **Send to Topics**
  https://firebase.google.com/docs/cloud-messaging/send-message#send-messages-to-topics
  *Topic naming format and restrictions*

- **Realtime Database Admin**
  https://firebase.google.com/docs/database/admin/start
  *Admin SDK setup and authentication*

- **Save Realtime Database Data**
  https://firebase.google.com/docs/database/admin/save-data
  *Writing, updating, and deleting data*

---

## Security Vulnerabilities (CVEs)

### CVE-2018-1000025 (PHP SDK Only)
**Package:** firebase-admin-php
**Affected Versions:** 3.2.0 - 3.8.0
**Fixed In:** 3.8.1
**Severity:** HIGH
**Issue:** Token signature verification bypass in IdTokenVerifier.php
**Impact:** Allows forged JWTs with fake email addresses and user IDs
**Reference:** https://www.cvedetails.com/cve/CVE-2018-1000025/
**Relevance:** Node.js SDK not affected, but highlights importance of proper token verification

### CVE-2023-26115 (Node.js SDK)
**Package:** firebase-admin (via @google-cloud/firestore dependency)
**Affected Versions:** firebase-admin@11.11.0
**Fixed In:** firebase-admin with @google-cloud/firestore@7.1.0
**Severity:** MEDIUM
**Issue:** Dependency vulnerability in word-wrap package
**Reference:** https://github.com/firebase/firebase-admin-node/discussions/2352
**Reference:** https://security.snyk.io/package/npm/firebase-admin
**Relevance:** Indirect dependency issue, resolved by updating Firestore dependency

### Other Vulnerabilities
- **CVE-2023-36665:** Critical vulnerability in protobufjs (CVSS 9.8) affecting firebase-admin@11.11.0
- **CVE-2024-41818:** High severity in fast-xml-parser (CVSS 7.5), fixed in 11.11.1
- **Status:** firebase-admin@13.6.0 (latest) is non-vulnerable

---

## Community Resources

### GitHub Issues & Discussions
- **FCM Error Handling Feature Request**
  https://github.com/firebase/firebase-admin-node/issues/1192
  *Discussion about improved error handling for Cloud Messaging*

- **FirebaseError Type Definition**
  https://github.com/firebase/firebase-admin-node/issues/403
  *Issue about FirebaseError being interface vs class*

- **Firestore Error Checking**
  https://github.com/firebase/firebase-admin-node/issues/2257
  *Recommended way to check for Firestore errors*

- **Error Handling Inconsistency (Python)**
  https://github.com/firebase/firebase-admin-python/issues/347
  *Discussion about FirebaseError structure across SDKs*

### Code Examples
- **Tabnine: firebase-admin.auth Examples**
  https://www.tabnine.com/code/javascript/functions/firebase-admin/auth
  *Real-world code examples of auth operations*

### Error Code Collections
- **firebase-error-codes Repository**
  https://github.com/maxzaleski/firebase-error-codes
  *Community-maintained collection of Firebase error codes*

---

## NPM Package

- **firebase-admin on NPM**
  https://www.npmjs.com/package/firebase-admin
  *Official package page with version history*

---

## Contract Design Rationale

### Error Categories
Firebase Admin SDK explicitly divides errors into:
1. **Programming Errors** - Bugs in code (null values, missing config, etc.)
2. **API Errors** - Runtime issues (expired tokens, non-existent users, network failures)

**Contract Focus:** API errors only, as these require try-catch handling.

### Error Structure
Every API error contains:
- `code` (string) - Most reliable identifier (e.g., 'auth/invalid-uid', 'auth/user-not-found')
- `message` (string) - Human-readable description
- Service-specific properties (e.g., `error.code` for Firestore returns gRPC numeric codes)

### Method Chain Pattern
Firebase Admin uses chained method calls:
```typescript
// Authentication (2-level chains)
admin.auth().verifyIdToken(token)
admin.auth().createUser(properties)

// Firestore (3-4 level chains)
admin.firestore().collection('users').doc('id').get()
admin.firestore().collection('users').add(data)

// Messaging (2-level chains)
admin.messaging().send(message)

// Database (3-level chains)
admin.database().ref('path').once('value')
```

**Analyzer Requirements:**
- Support for 2-level property chains: `admin.auth().verifyIdToken()`
- Support for 3+ level chains: `admin.firestore().collection().doc().get()`
- Instance variable tracking: `const auth = admin.auth(); auth.verifyIdToken()`

### Function Coverage Priority

**Top 10 Most Critical Functions:**
1. `verifyIdToken()` - Token verification (security-critical)
2. `createUser()` - User creation (duplicate email errors)
3. `getUser()` - User lookup (not-found errors)
4. `get()` (Firestore) - Document reads (permission denied, not found)
5. `add()` (Firestore) - Document creates (quota exceeded)
6. `set()` (Firestore) - Document writes (transaction contention)
7. `send()` (Messaging) - Push notifications (invalid tokens)
8. `updateUser()` - User updates (not-found, duplicate email)
9. `sendMulticast()` - Batch messaging (partial failures)
10. `update()` (Firestore) - Document updates (not found)

### Severity Levels

All postconditions marked as **ERROR** severity because:
- Authentication errors can lead to security vulnerabilities
- Firestore errors can cause data loss or corruption
- Messaging errors result in failed notifications
- Database errors cause application failures

### Testing Strategy

**Fixtures Required:**
1. **proper-error-handling.ts** - Demonstrates correct try-catch with error.code checking
2. **missing-error-handling.ts** - Shows missing error handling (should trigger violations)
3. **instance-usage.ts** - Tests detection via instance variables

**Expected Behavior:**
- Analyzer should detect method calls across all 4 service areas
- Should support 2-4 level method chains
- Should track instance assignments (e.g., `const auth = admin.auth()`)

---

## Verification Notes

### Error Code Format
- **Authentication:** String codes with 'auth/' prefix (e.g., 'auth/user-not-found')
- **Firestore:** gRPC numeric codes (e.g., 5 = NOT_FOUND, 7 = PERMISSION_DENIED)
- **Messaging:** String codes with 'messaging/' prefix
- **Database:** String codes (e.g., 'PERMISSION_DENIED')

### Version Compatibility
Contract covers firebase-admin >=11.0.0 <14.0.0:
- v11.x: Stable API, active LTS
- v12.x: Current stable
- v13.x: Latest stable (as of 2026-02-25)

Major breaking changes between versions primarily affect initialization patterns, not error handling.

---

## Future Enhancements

### Additional Functions to Consider
- `listUsers()` - Pagination errors
- `generatePasswordResetLink()` - Email errors
- `$transaction()` (Firestore) - Transaction-specific errors
- `subscribeToTopic()` (Messaging) - Subscription errors

### Edge Cases to Add
- Token refresh patterns
- Batch operation partial failures
- Transaction retry strategies
- Rate limit header inspection

---

## Changelog

### 1.0.0 (2026-02-25)
- Initial contract creation
- Covers 4 service areas: Auth, Firestore, Messaging, Database
- 25 functions with error handling requirements
- Based on firebase-admin v11-13 API
