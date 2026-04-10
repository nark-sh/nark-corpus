# Sources for react-hook-form Contract

**Package:** react-hook-form
**Contract Version:** 1.0.0
**Research Date:** 2026-02-24

---

## Official Documentation

- [handleSubmit API](https://react-hook-form.com/docs/useform/handlesubmit) - Official documentation on handleSubmit behavior
- [useForm API](https://react-hook-form.com/docs/useform) - Main hook documentation
- [setError API](https://react-hook-form.com/docs/useform/seterror) - Server error handling documentation
- [useFormContext API](https://react-hook-form.com/docs/useformcontext) - Context hook documentation
- [Advanced Usage](https://react-hook-form.com/advanced-usage) - Advanced patterns and error handling
- [useFieldArray API](https://react-hook-form.com/docs/usefieldarray) - Dynamic field arrays documentation
- [ErrorMessage Component](https://react-hook-form.com/docs/useformstate/errormessage) - Error display documentation
- [FAQs](https://react-hook-form.com/faqs) - Common questions and issues

---

## Error Handling Patterns

### Async Submission Errors
- [handleSubmit - React Hook Form](https://www.react-hook-form.com/api/useform/handlesubmit/) - "handleSubmit will not swallow errors that occurred inside your onSubmit callback, so it's recommended to try and catch inside async request"
- [Best Practices for Error Handling](https://tillitsdone.com/blogs/react-hook-form-error-handling/) - Error handling patterns and best practices
- [React Hook Form Errors Not Working: Troubleshooting Tips](https://daily.dev/blog/react-hook-form-errors-not-working-troubleshooting-tips) - Common error scenarios and solutions

### Server Validation Errors
- [setError Documentation](https://react-hook-form.com/docs/useform/seterror) - "setError can be useful in the handleSubmit method when you want to give error feedback to a user after async validation"
- [Async Submit Validation Discussion](https://github.com/orgs/react-hook-form/discussions/9694) - Community discussion on async validation patterns

### Context Errors
- [useFormContext Returns Null Discussion](https://github.com/orgs/react-hook-form/discussions/3894) - Common issue when FormProvider is missing
- [Missing FormContext Warning Issue](https://github.com/react-hook-form/react-hook-form/issues/1261) - GitHub issue about missing context warnings
- [useFormContext Type Error](https://github.com/orgs/react-hook-form/discussions/9991) - Discussion about null return type

---

## CVE Analysis

### React Hook Form Specific
- [react-hook-form vulnerabilities | Snyk](https://security.snyk.io/package/npm/react-hook-form) - No direct CVEs found for react-hook-form package as of 2026-02-24
- [SECURITY.md](https://github.com/react-hook-form/react-hook-form/blob/master/SECURITY.md) - Security policy for the project

### Related React Security Issues (2026)
- [CVE-2025-55182 (React2Shell)](https://www.microsoft.com/en-us/security/blog/2025/12/15/defending-against-the-cve-2025-55182-react2shell-vulnerability-in-react-server-components/) - React Server Components RCE vulnerability (not affecting react-hook-form)
- [CVE-2026-23864](https://www.sentinelone.com/vulnerability-database/cve-2026-23864/) - React Server Components DoS vulnerability (not affecting react-hook-form)

### Security Best Practices
- [Protecting React Hook Form from Spam](https://blog.arcjet.com/protecting-a-react-hook-form-from-spam/) - Client-side validation can be bypassed; server-side validation required
- [React Hook Form Validation Security](https://www.abstractapi.com/guides/email-validation/react-hook-form-email-validation) - "Client-side validation has limitations and can be bypassed by disabling JavaScript"

---

## Real-World Usage Analysis

### jake-tennis-ai-collections Repository
Analyzed 19 files using react-hook-form:

**Files with proper error handling:**
- `src/features/customers/components/users-action-dialog.tsx` (lines 211-419)
  - Uses try-catch in onSubmit
  - Provides user feedback with toast notifications
  - Calls setError for validation errors

- `src/features/auth/sign-in/components/user-auth-form.tsx` (lines 118-171)
  - Comprehensive try-catch error handling
  - Specific error message handling
  - User feedback via setFormError state

**Files with problematic error handling:**
- `src/features/settings/profile/profile-form.tsx` (lines 80-86)
  - **Anti-pattern:** Empty catch block
  - Comment: "Error handling intentionally left blank for production"
  - ❌ Silent failure - users don't know if submission failed

- `src/features/customers/components/users-action-dialog.tsx` (lines 397-399)
  - **Anti-pattern:** Silent catch on fetch call
  - Comment: "Silent fail - status update succeeded, AI details update is non-critical"
  - ⚠️ Partial silent failure

- `src/features/tasks/components/tasks-mutate-drawer.tsx` (lines 55-60)
  - **Anti-pattern:** No try-catch around showSubmittedData
  - onSubmit has no error handling at all

**Common patterns observed:**
1. `useForm` with `zodResolver` for validation (18/19 files)
2. `form.handleSubmit(onSubmit)` pattern (all files)
3. Mixed error handling quality:
   - 5 files: Good error handling with try-catch + user feedback
   - 8 files: Partial error handling (try-catch but limited feedback)
   - 6 files: No error handling in async onSubmit

**Key insights:**
- Empty catch blocks are common anti-pattern
- Silent failures on non-critical operations
- Inconsistent error handling across forms
- Some forms properly use toast notifications
- Some rely on framework error boundaries

---

## Validation Patterns

### Integration with Zod
- [Zod Validation with React Hook Form](https://www.contentful.com/blog/react-hook-form-validation-zod/) - Common integration pattern
- Most jake-tennis forms use `@hookform/resolvers/zod` for schema validation

### Async Validation
- [Advanced Usage - Async Validation](https://react-hook-form.com/advanced-usage) - Resolver-based async validation
- Server-side validation errors should be set via `setError()`

---

## Community Issues and Patterns

### Common Problems
- [Errors Object Not Updating](https://github.com/react-hook-form/react-hook-form/issues/2893) - formState.errors not updating properly
- [How to Trigger Action on Error](https://github.com/orgs/react-hook-form/discussions/9165) - Using onError callback in handleSubmit
- [handleSubmit Error Callback Behavior](https://github.com/react-hook-form/react-hook-form/issues/12170) - Both success and error callbacks being invoked

### Best Practices from Community
- Always wrap async operations in try-catch
- Use toast/notification libraries for user feedback
- Server validation requires explicit setError calls
- FormProvider required when using useFormContext

---

## Testing Resources

### Test Fixtures Location
- `corpus/packages/react-hook-form/fixtures/proper-error-handling.tsx` - Correct patterns
- `corpus/packages/react-hook-form/fixtures/missing-error-handling.tsx` - Anti-patterns to detect
- `corpus/packages/react-hook-form/fixtures/instance-usage.tsx` - Context usage patterns

### Validation Repository
- **jake-tennis-ai-collections** - Primary validation codebase
  - 19 files using react-hook-form
  - Multiple error handling patterns
  - Real-world production code

---

## Key Behavioral Findings

### Critical Behaviors
1. **handleSubmit does NOT catch onSubmit errors**
   - Source: [Official handleSubmit docs](https://react-hook-form.com/docs/useform/handlesubmit)
   - Async errors must be handled with try-catch
   - Unhandled errors become UnhandledPromiseRejections

2. **useFormContext returns null without FormProvider**
   - Source: [useFormContext discussion](https://github.com/orgs/react-hook-form/discussions/3894)
   - Causes TypeError when destructuring properties
   - Must wrap form with FormProvider

3. **Server errors require manual setError**
   - Source: [setError documentation](https://react-hook-form.com/docs/useform/seterror)
   - API validation errors not automatically displayed
   - Developer must loop through errors and call setError

4. **Client-side validation can be bypassed**
   - Source: [Security best practices](https://blog.arcjet.com/protecting-a-react-hook-form-from-spam/)
   - JavaScript can be disabled
   - Browser DevTools can manipulate form state
   - Server-side validation is mandatory

---

## Notes

### Contract Design Rationale
This contract focuses on the most common and critical error handling issues found in real-world usage:

1. **Async submission errors** (ERROR severity)
   - Highest frequency issue in jake-tennis codebase
   - Leads to unhandled promise rejections
   - Poor user experience

2. **Empty catch blocks** (WARNING severity)
   - Silent failures confuse users
   - Found in multiple production files
   - Intentional in some cases but still problematic

3. **Missing context provider** (ERROR severity)
   - Causes crashes at runtime
   - Common mistake when refactoring components
   - Easy to prevent with proper setup

4. **Server validation errors** (WARNING severity)
   - API errors not displayed to users
   - Requires explicit setError calls
   - Common oversight in implementations

### Future Considerations
- Monitor for v8.x API changes
- Watch for new error handling patterns in community
- Consider adding contracts for:
  - `useWatch` error handling
  - `useController` validation errors
  - Custom resolver error handling
