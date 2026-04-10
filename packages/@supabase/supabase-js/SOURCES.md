# Supabase Behavioral Contract - Sources

## Official Documentation

### Supabase Client Documentation
- **JavaScript API Reference**: https://supabase.com/docs/reference/javascript/v1
- **Auth Error Codes**: https://supabase.com/docs/guides/auth/debugging/error-codes
- **Auth Troubleshooting**: https://supabase.com/docs/guides/auth/troubleshooting
- **Row Level Security**: https://supabase.com/docs/guides/database/postgres/row-level-security

### Error Handling Guides
- **Error Codes Reference**: https://supabase.com/docs/guides/auth/debugging/error-codes
- **HTTP Status Codes**: https://supabase.com/docs/guides/troubleshooting/http-status-codes
- **Database 42501 Errors**: https://supabase.com/docs/guides/troubleshooting/database-api-42501-errors
- **500 Authentication Errors**: https://supabase.com/docs/guides/troubleshooting/resolving-500-status-authentication-errors-7bU5U8
- **RLS Troubleshooting**: https://supabase.com/docs/guides/troubleshooting/why-is-my-service-role-key-client-getting-rls-errors-or-not-returning-data-7_1K9z

### Security Best Practices
- **RLS Performance**: https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv
- **Security Best Practices (2026)**: https://supaexplorer.com/guides/supabase-security-best-practices
- **Realtime Authorization**: https://supabase.com/docs/guides/realtime/authorization

## Error Types

### Auth Errors

Supabase Auth errors are categorized into two main types:

1. **AuthApiError**: Errors originating from the Supabase Auth API
2. **CustomAuthError**: Errors originating from the client library's state

**Critical Best Practice**: Use `isAuthApiError` instead of `instanceof` checks.

```javascript
import { isAuthApiError } from '@supabase/supabase-js';

try {
  const { data, error } = await supabase.auth.signIn({ email, password });
  if (error) throw error;
} catch (error) {
  if (isAuthApiError(error)) {
    // Handle API error
    console.error('Auth API error:', error.code, error.message);
  } else {
    // Handle client error
    console.error('Client error:', error.name, error.message);
  }
}
```

**Always check `error.code` and `error.name`**, not string matching on `error.message`.

**Source**: https://supabase.com/docs/guides/auth/debugging/error-codes

### Common HTTP Status Codes

**429 - Rate Limit Exceeded**
- Occurs frequently in auth flows (signup, login, password reset)
- MUST handle gracefully with user-friendly messaging
- Implement exponential backoff
- Consider CAPTCHA for repeated failures

**500 - Internal Server Error**
- Usually indicates issues with database or SMTP provider
- NOT an Auth service issue - external dependency failure
- Check logs for database triggers or email delivery issues
- Implement retry with exponential backoff

**403 / 42501 - Permission Denied**
- Row Level Security (RLS) policy violation
- User doesn't have permission to access data
- Most common cause: RLS policies not configured or too restrictive

**Source**: https://supabase.com/docs/guides/troubleshooting/http-status-codes

### Database Error Codes

Supabase uses PostgreSQL error codes (SQLSTATE):

**42501 - Insufficient Privilege**
- RLS policy denies access (SELECT, INSERT, UPDATE, DELETE)
- Column-level RLS denies access to specific columns
- User doesn't have EXECUTE permission on RPC function

**23505 - Unique Violation**
- Duplicate key constraint violation
- Check for existing records before inserting

**23503 - Foreign Key Violation**
- Referenced record doesn't exist
- Verify foreign key references before operations

**42883 - Undefined Function**
- PostgreSQL function (RPC) doesn't exist
- Check function name spelling

**42P01 - Undefined Table**
- Table doesn't exist
- May indicate schema mismatch or missing migration

**Source**: https://www.postgresql.org/docs/current/errcodes-appendix.html

## Row Level Security (RLS)

### Critical Security Requirement

**RLS is NOT enabled by default** on new tables. This is the #1 security misconfiguration in Supabase applications.

**ALWAYS**:
1. Enable RLS on every table: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Create policies for each operation (SELECT, INSERT, UPDATE, DELETE)
3. Test policies with different user roles

**Example Policy**:
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);
```

**Source**: https://supabase.com/docs/guides/database/postgres/row-level-security

### Common RLS Issues

**Issue 1: Missing RLS Policies**
- **Symptom**: 42501 error or no data returned
- **Cause**: RLS enabled but no policies created
- **Solution**: Create policies for each role (anon, authenticated, service_role)

**Issue 2: Service Role Bypassing RLS**
- **Symptom**: Expected RLS errors not occurring
- **Cause**: Client initialized with service_role key
- **Solution**: NEVER use service_role key in client-side code
- **Note**: service_role ALWAYS bypasses RLS by design

**Source**: https://supabase.com/docs/guides/troubleshooting/why-is-my-service-role-key-client-getting-rls-errors-or-not-returning-data-7_1K9z

**Issue 3: Column-Level RLS**
- **Symptom**: 42501 error when using `select *`
- **Cause**: RLS restricts access to some columns
- **Solution**: Select only accessible columns explicitly

**Issue 4: SELECT Policy on INSERT/UPDATE**
- **Symptom**: 42501 error after successful insert/update
- **Cause**: No SELECT policy to return inserted/updated data
- **Solutions**:
  1. Add SELECT policy
  2. Use `returning: 'minimal'` option

**Source**: https://supabase.com/docs/guides/troubleshooting/why-is-my-service-role-key-client-getting-rls-errors-or-not-returning-data-7_1K9z

### RLS Performance

**Best Practices**:
- Keep policies simple
- Avoid complex joins in policies
- Use indexed columns in policies
- Test policy performance with EXPLAIN ANALYZE
- Consider `SECURITY DEFINER` functions for complex logic

**Source**: https://supabase.com/docs/guides/troubleshooting/rls-performance-and-best-practices-Z5Jjwv

## Common Production Issues

### Issue 1: Missing RLS Policies (CRITICAL)
**Severity**: Critical - Data exposure risk

**Problem**: RLS not enabled or policies missing, exposing all data

**Statistics**:
- 170+ applications exposed in 2025 due to missing RLS
- Thousands of misconfigured Supabase instances globally
- #1 cause of Supabase data breaches

**Solutions**:
1. Enable RLS on ALL tables
2. Create policies for every operation
3. Use security checklist before deployment
4. Audit RLS configuration regularly

**Sources**:
- [Supabase Security Flaw: 170+ Apps Exposed](https://byteiota.com/supabase-security-flaw-170-apps-exposed-by-missing-rls/)
- [Hacking Misconfigured Supabase Instances](https://deepstrike.io/blog/hacking-thousands-of-misconfigured-supabase-instances-at-scale)

### Issue 2: Service Role Key in Client Code
**Severity**: Critical - Complete security bypass

**Problem**: Using service_role key in client-side JavaScript

**Impact**:
- Bypasses ALL RLS policies
- Full database access from client
- Equivalent to giving users superuser access

**Solution**:
- ONLY use service_role on server-side (API routes, serverless functions)
- Use anon key for client-side code
- Implement proper RLS policies for anon/authenticated roles

**Source**: https://supabase.com/docs/guides/troubleshooting/why-is-my-service-role-key-client-getting-rls-errors-or-not-returning-data-7_1K9z

### Issue 3: Auth Rate Limiting (429 Errors)
**Severity**: High - Service degradation

**Problem**: Hitting auth rate limits during login/signup

**Causes**:
- Brute force attempts
- Excessive retry logic
- Missing client-side validation
- Automated testing without mocking

**Solutions**:
1. Implement client-side validation before API calls
2. Add CAPTCHA for repeated failures
3. Use exponential backoff for retries
4. Mock auth in tests, don't hit real API

**Source**: https://supabase.com/docs/guides/auth/troubleshooting

### Issue 4: Auth 500 Errors
**Severity**: High - Authentication failures

**Problem**: 500 errors during signup/login

**Common Causes**:
1. **Database triggers failing**: Error in custom trigger logic
2. **SMTP provider issues**: Email delivery failures (look for "gomail" in logs)
3. **Database connection issues**: Pool exhaustion or connectivity

**Solutions**:
- Check database logs for trigger errors
- Verify SMTP configuration
- Test triggers in isolation
- Monitor database health

**Source**: https://supabase.com/docs/guides/troubleshooting/resolving-500-status-authentication-errors-7bU5U8

### Issue 5: Not Checking Error.code
**Severity**: Medium - Poor error handling

**Problem**: String matching on error messages instead of using error codes

**Example of bad practice**:
```javascript
// ❌ WRONG - fragile, message may change
if (error.message.includes('already exists')) {
  // Handle duplicate
}
```

**Correct approach**:
```javascript
// ✅ CORRECT - stable, documented codes
if (error.code === '23505') {
  // Handle unique violation
}
```

**Source**: https://supabase.com/docs/guides/auth/debugging/error-codes

## Security Advisories

**Last Checked**: 2026-02-24

### Major CVEs and Vulnerabilities

**CVE-2025-48757 - Lovable AI Generator Missing RLS**
- **Severity**: Critical
- **Impact**: 170+ applications affected, 13,000 users exposed in one leak
- **Cause**: AI-generated code didn't include RLS policies
- **Lesson**: Always audit generated code for security

**Source**: [Supabase Security Flaw: 170+ Apps Exposed](https://byteiota.com/supabase-security-flaw-170-apps-exposed-by-missing-rls/)

**Supabase MCP Vulnerability (July 2025)**
- **Severity**: Critical
- **Impact**: AI coding assistants with service_role can bypass RLS via prompt injection
- **Attack**: Embedded instructions in prompts leak sensitive data
- **Mitigation**: Never give AI assistants service_role access

**Source**: [Supabase MCP Leak](https://simonwillison.net/2025/Jul/6/supabase-mcp-lethal-trifecta/)

**CVE-2025-57164 - Flowise RCE**
- **Severity**: Critical
- **Impact**: Remote code execution via unsanitized "Supabase RPC Filter" field
- **Affected**: Flowise through v3.0.4
- **Discovered**: September 2025

**Source**: [CVE-2025-57164](https://www.wiz.io/vulnerability-database/cve/cve-2025-57164)

### Systemic Configuration Issues (2025-2026)

**Major audit findings**:
- Hundreds to thousands of misconfigured instances globally
- Missing RLS policies on production databases
- Hardcoded secrets in client-side code
- Service role keys exposed in frontend

**Root causes**:
- RLS not enabled by default
- Insufficient security guidance in tutorials
- AI-generated code missing security best practices

**Sources**:
- [Every AI App Data Breach Since January 2025](https://blog.barrack.ai/every-ai-app-data-breach-2025-2026/)
- [Supabase Security Retro 2025](https://supabase.com/blog/supabase-security-2025-retro)

### Supabase Security Improvements (2026)

**Current measures**:
- Continuous security testing with red team and purple team
- Active vulnerability disclosure program on HackerOne
- Improved RLS guidance and tooling
- Security audit templates for developers

**Source**: [Supabase Security Retro 2025-2026](https://supaexplorer.com/dev-notes/supabase-security-2025-whats-new-and-how-to-stay-secure.html)

## Best Practices Summary

### 1. Always Enable RLS
```sql
-- REQUIRED for every table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);
```

### 2. Proper Error Handling
```javascript
const { data, error } = await supabase
  .from('users')
  .select('*');

if (error) {
  if (error.code === '42501') {
    // RLS policy violation
    return { error: 'Access denied' };
  } else if (error.code === '23505') {
    // Unique violation
    return { error: 'Record already exists' };
  }
  throw error; // Unexpected error
}
```

### 3. Check isAuthApiError
```javascript
import { isAuthApiError } from '@supabase/supabase-js';

const { data, error } = await supabase.auth.signUp({ email, password });

if (error) {
  if (isAuthApiError(error)) {
    // API error - check error.code
    if (error.status === 429) {
      return { error: 'Too many attempts. Please try again later.' };
    }
  }
}
```

### 4. NEVER Use service_role in Client
```javascript
// ❌ WRONG - CRITICAL SECURITY RISK
const supabase = createClient(url, serviceRoleKey); // In browser code

// ✅ CORRECT - Use anon key in browser
const supabase = createClient(url, anonKey);
```

### 5. Handle returning: 'minimal' for RLS
```javascript
// If SELECT policy missing after INSERT
const { data, error } = await supabase
  .from('users')
  .insert({ name: 'Alice' })
  .select('*', { returning: 'minimal' });
```

### 6. Security Checklist Before Deploy
- [ ] RLS enabled on all tables
- [ ] Policies created for all operations
- [ ] Service role key only in server code
- [ ] Anon key only in client code
- [ ] Auth rate limit handling
- [ ] Error code checking (not string matching)
- [ ] SMTP provider configured
- [ ] Database triggers tested

## Verification Date
**Last Verified**: 2026-02-24
**Supabase JS Client Version**: 2.x
**Documentation Version**: Current as of February 2026
