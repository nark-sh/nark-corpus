# Sources: mongoose

**Package:** mongoose
**Contract Created:** 2026-02-25
**Contract Version:** 1.0.0

---

## Official Documentation

### Error Handling
- **Mongoose Error Handling Documentation**
  URL: https://mongoosejs.com/docs/2.7.x/docs/errors.html
  Key concepts: ValidationError, errors object, ValidatorError properties

- **MongoDB Mongoose Error Handling Best Practices**
  URL: https://codezup.com/mongodb-mongoose-error-handling/
  Key concepts: Try-catch blocks, error types, retry mechanisms

- **GeeksforGeeks: Handling Errors in MongoDB Operations using NodeJS**
  URL: https://www.geeksforgeeks.org/node-js/how-to-handle-errors-in-mongodb-operations-using-nodejs/
  Key concepts: Connection errors, validation errors, duplicate key errors

### API Documentation
- **Mongoose ODM v9.2.2**
  URL: https://mongoosejs.com/
  Official homepage and primary documentation

### Query Error Handling
- **GeeksforGeeks: Query.prototype.orFail() API**
  URL: https://www.geeksforgeeks.org/mongodb/mongoose-query-prototype-orfail-api/
  Key concepts: DocumentNotFoundError, custom error messages

---

## Security Vulnerabilities

### CVE-2023-3696: Prototype Pollution
- **Snyk Advisory**
  URL: https://security.snyk.io/vuln/SNYK-JS-MONGOOSE-5777721
  **Severity:** High
  **Affected:** Update functions (findByIdAndUpdate, findOneAndUpdate)
  **Impact:** Prototype pollution leading to potential RCE
  **Mitigation:** Upgrade to patched version

### CVE-2024-53900: $where Exploitation
- **NSFOCUS Advisory**
  URL: https://nsfocusglobal.com/mongodb-mongoose-search-injection-vulnerability-cve-2025-23061/
  **Severity:** Critical
  **Affected:** Query operations using $where
  **Impact:** Remote Code Execution (RCE)
  **Patched In:** v8.8.3
  **Mitigation:** Upgrade to v8.8.3 or later

### CVE-2025-23061: Bypass of CVE-2024-53900 Patch
- **OPSWAT Technical Discovery**
  URL: https://www.opswat.com/blog/technical-discovery-mongoose-cve-2025-23061-cve-2024-53900
  **Severity:** Critical
  **Affected:** Query operations (bypass of previous fix)
  **Impact:** Remote Code Execution (RCE)
  **Patched In:** v8.9.5
  **Mitigation:** Upgrade to v8.9.5 or later

### General Security Database
- **Snyk: mongoose vulnerabilities**
  URL: https://security.snyk.io/package/npm/mongoose
  Comprehensive list of all known vulnerabilities

---

## Error Types Reference

### Common Mongoose Errors

1. **ValidationError**
   - Thrown when document validation fails
   - Contains `errors` object with field-specific ValidatorError instances
   - Each ValidatorError has: `type`, `path`, `message`

2. **CastError**
   - Thrown when type casting fails (e.g., invalid ObjectId)
   - Common with `findById` when ID format is invalid

3. **E11000 Duplicate Key Error**
   - MongoDB error code for unique constraint violations
   - Not a Mongoose validation error - comes from MongoDB driver
   - Must be caught explicitly

4. **DocumentNotFoundError**
   - Thrown by `Query.orFail()` when no documents match
   - Can provide custom error messages

5. **Connection Errors**
   - Network failures
   - Authentication errors
   - Invalid connection strings

---

## Rationale for Contract

### Why Error Handling is Critical

1. **Network Operations**: All mongoose operations involve network I/O to MongoDB, which can fail
2. **Validation Failures**: Schema validation can reject documents at runtime
3. **Type Casting**: Automatic type casting can fail with invalid data
4. **Duplicate Keys**: Unique constraints cause E11000 errors
5. **Connection Issues**: Database connection can drop during operations

### Severity Justification

All operations are marked **ERROR** severity because:
- Unhandled promise rejections crash Node.js applications
- Database errors are common in production (network issues, validation failures)
- Recent CVEs (2023-2025) show security implications of improper handling
- Silent failures can lead to data inconsistency

---

## Real-World Impact

### Common Failure Scenarios

1. **Network Timeout**
   ```typescript
   // ❌ No error handling - crashes app
   const user = await User.findById(id);
   ```

2. **Validation Error**
   ```typescript
   // ❌ No error handling - crashes app
   const user = await User.create({ email: 'invalid' });
   ```

3. **Duplicate Key Error**
   ```typescript
   // ❌ No error handling - crashes app
   const user = await User.create({ email: 'exists@example.com' });
   ```

4. **Cast Error**
   ```typescript
   // ❌ No error handling - crashes app
   const user = await User.findById('invalid-id-format');
   ```

### Proper Error Handling

```typescript
// ✅ Proper error handling
try {
  const user = await User.findById(id);
  return user;
} catch (error) {
  if (error.name === 'CastError') {
    throw new BadRequestError('Invalid user ID format');
  }
  throw error;
}
```

---

## Contract Coverage

### Functions Covered: 30

**Model Static Methods (20):**
- Query: find, findOne, findById, exists, distinct
- Create: create, insertMany
- Update: updateOne, updateMany, findByIdAndUpdate, findOneAndUpdate, replaceOne, findOneAndReplace
- Delete: deleteOne, deleteMany, findByIdAndDelete, findOneAndDelete, findByIdAndRemove
- Aggregation: aggregate, countDocuments, estimatedDocumentCount
- Bulk: bulkWrite

**Document Instance Methods (4):**
- save, validate, remove, deleteOne

**Query Methods (2):**
- exec, orFail

**Connection Methods (2):**
- mongoose.connect, Connection.close

### Version Support

**Version Range:** >=5.0.0

Rationale:
- Mongoose 5.x introduced significant API changes
- Covers Mongoose 5, 6, 7, 8, and 9
- All modern production applications use 5.x+

---

## Best Practices

### Recommended Error Handling Patterns

1. **Try-Catch with Async/Await**
   ```typescript
   try {
     const user = await User.findById(id);
   } catch (error) {
     // Handle error
   }
   ```

2. **Promise .catch() Handler**
   ```typescript
   User.findById(id)
     .then(user => { /* ... */ })
     .catch(error => { /* Handle error */ });
   ```

3. **Error Type Discrimination**
   ```typescript
   try {
     const user = await User.create(data);
   } catch (error) {
     if (error.name === 'ValidationError') {
       // Handle validation error
     } else if (error.code === 11000) {
       // Handle duplicate key error
     } else {
       // Handle other errors
     }
   }
   ```

4. **orFail() for Required Queries**
   ```typescript
   try {
     const user = await User.findById(id).orFail();
     // user is guaranteed to exist
   } catch (error) {
     // Handle DocumentNotFoundError or other errors
   }
   ```

---

## Additional Resources

- **Mongoose ODM Best Practices Part One**
  URL: https://dev.to/elhamnajeebullah/mongoose-odm-best-practices-part-one-e6e
  Community guide on Mongoose patterns

- **CoreUI: How to use Mongoose in Node.js**
  URL: https://coreui.io/answers/how-to-use-mongoose-in-nodejs/
  Tutorial covering basic usage and error handling

- **Mongoose Unique Error Messages and Custom Validation Guide**
  URL: https://copyprogramming.com/howto/mongoosejs-how-to-set-a-custom-error-message-for-required-unique-index-and-enum-failure
  Guide for handling unique constraint errors

---

## Changelog

### v1.0.0 (2026-02-25)
- Initial contract creation
- Covers 30 core mongoose functions
- All functions marked ERROR severity
- Version range: >=5.0.0
- Documented CVEs: CVE-2023-3696, CVE-2024-53900, CVE-2025-23061
