# Sources for zod Contract

**Contract Version:** 1.0.0
**Last Verified:** 2026-02-24

---

## Official Documentation

- [Zod GitHub Repository](https://github.com/colinhacks/zod) - Main repository with comprehensive README
- [Zod Official Website](https://zod.dev) - Official documentation site
- [Parse Methods](https://github.com/colinhacks/zod#parse) - Documentation on parse() vs safeParse()
- [Async Validation](https://github.com/colinhacks/zod#parse) - parseAsync() and safeParseAsync() documentation
- [Error Handling](https://github.com/colinhacks/zod#error-handling) - ZodError structure and handling
- [Refinements](https://github.com/colinhacks/zod#refine) - Custom validation with .refine()
- [Type Coercion](https://github.com/colinhacks/zod#coercion-for-primitives) - z.coerce.* documentation

---

## CVE Analysis

### CVE-2023-4316 - ReDoS in Email Validation

- **Severity:** Medium (CVSS score not provided)
- **Affected Versions:** zod 3.22.2 and earlier
- **Fixed In:** zod 3.22.3+
- **Description:** Regular Expression Denial of Service (ReDoS) vulnerability in email validation using insecure regex pattern
- **Impact:** Attackers can cause denial of service by providing maliciously crafted email strings
- **Mitigation:** Upgrade to zod >= 3.22.3

**References:**
- [GHSA-m95q-7qp3-xv42](https://github.com/advisories/GHSA-m95q-7qp3-xv42) - GitHub Security Advisory
- [Snyk Vulnerability](https://security.snyk.io/vuln/SNYK-JS-ZOD-5925617) - Snyk advisory
- [GitHub Issue #2828](https://github.com/colinhacks/zod/issues/2828) - Discussion thread
- [Fluid Attacks Advisory](https://fluidattacks.com/advisories/swift) - Detailed analysis
- [fast-check Blog Post](https://fast-check.dev/blog/2023/10/05/finding-back-a-redos-vulnerability-in-zod/) - How the vulnerability was discovered

### CVE-2024-32866 - Prototype Pollution in @conform-to/zod

- **Note:** This affects the @conform-to/zod integration package, not zod itself
- **Severity:** High (CVSS 8.6)
- **Affected Versions:** @conform-to/zod <= 1.1.0
- **Fixed In:** @conform-to/zod 1.1.1 and 0.9.2
- **Not directly applicable to zod core library**

**Reference:**
- [CVE-2024-32866](https://security.snyk.io/vuln/SNYK-JS-CONFORMTOZOD-6673141)

---

## Source Code References

### ZodError Class
- [src/ZodError.ts](https://github.com/colinhacks/zod/blob/main/src/ZodError.ts) - Error class implementation
- Error structure includes:
  - `issues: ZodIssue[]` - Array of validation failures
  - Each issue contains: `code`, `path`, `message`, `expected`, `received`

### Parse Methods Implementation
- [src/types.ts](https://github.com/colinhacks/zod/blob/main/src/types.ts) - Core type implementations
- `parse()` - Throws ZodError on failure
- `safeParse()` - Returns discriminated union `{success: boolean}`
- `parseAsync()` - Async parse with ZodError throwing
- `safeParseAsync()` - Async with discriminated union

### Common Error Codes
- `invalid_type` - Expected type doesn't match received type
- `too_small` - Value below minimum (strings, arrays, numbers)
- `too_big` - Value above maximum
- `invalid_string` - String-specific validation failures (email, url, uuid, etc.)
- `custom` - Custom refinement failures
- `invalid_union` - Union validation failures
- `invalid_date` - Date coercion failures

---

## Real-World Usage Analysis

### jake-tennis-ai-collections Repository

**Total zod imports found:** 20+ files

#### Usage Patterns:

1. **Schema Definition** - Most common pattern
   ```typescript
   const formSchema = z.object({
     email: z.string().email(),
     password: z.string().min(7)
   });
   ```

2. **react-hook-form Integration**
   ```typescript
   import { zodResolver } from '@hookform/resolvers/zod';

   const form = useForm<z.infer<typeof formSchema>>({
     resolver: zodResolver(formSchema),
   });
   ```
   - **Files:** 15+ form components
   - **Pattern:** Never directly call parse(), let zodResolver handle it

3. **Custom Validation Helper** (src/lib/validations.ts:409-422)
   ```typescript
   export function validateData<T>(
     schema: z.ZodSchema<T>,
     data: unknown
   ): { success: true; data: T } | { success: false; error: z.ZodError } {
     try {
       const result = schema.parse(data);
       return { success: true, data: result };
     } catch (error) {
       if (error instanceof z.ZodError) {
         return { success: false, error };
       }
       throw error;
     }
   }
   ```
   - **Anti-pattern detected:** This helper mimics safeParse() - should just use safeParse() directly
   - **Files using parse():** 11 files call `.parse()` directly
   - **Files using safeParse():** 0 files (!)

4. **Complex Validation with Refinements**
   ```typescript
   const schema = z.object({...}).refine(
     (data) => data.amount_due >= data.amount_paid,
     { message: 'Amount due must be >= amount paid', path: ['amount_due'] }
   );
   ```
   - **Files:** validations.ts (multiple schemas)
   - **Pattern:** Heavy use of custom refinements for business logic

5. **Type Coercion**
   ```typescript
   z.coerce.date() // Convert string to Date
   ```
   - **Files:** src/features/customers/data/schema.ts:77

#### Key Findings:

- ✅ **Good:** All schemas well-typed with TypeScript inference
- ✅ **Good:** Extensive use of custom refinements for business validation
- ❌ **Anti-pattern:** Using parse() wrapped in try-catch instead of safeParse()
- ❌ **Anti-pattern:** No error handling for direct parse() calls
- ℹ️ **Note:** react-hook-form integration handles all validation errors automatically

---

## Community References

### GitHub Issues

- [Issue #2828](https://github.com/colinhacks/zod/issues/2828) - CVE-2023-4316 security vulnerability discussion
- Common questions:
  - Error formatting and custom error messages
  - Async validation patterns
  - Integration with form libraries

### Stack Overflow

- Common questions about zod:
  - "How to handle ZodError?" - Most answered with safeParse() recommendation
  - "Async validation with zod" - Use parseAsync() or safeParseAsync()
  - "Custom error messages" - Use second parameter of refine() or custom errorMap

---

## Integration Patterns

### react-hook-form + zod

The most common integration in production apps:

```typescript
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({ ... });

const form = useForm({
  resolver: zodResolver(formSchema),
});
```

**Key behavior:** zodResolver internally uses safeParse() and maps errors to form fields. Developers never directly handle ZodError in this pattern.

---

## Behavioral Contract Rationale

### Why parse() and parseAsync() are contracted:

1. **Throws exceptions** - Requires explicit error handling or crashes
2. **Common anti-pattern** - Frequently used without try-catch in real codebases
3. **Silent failures** - Unhandled ZodError can crash applications or servers
4. **Security implications** - Invalid input should be handled gracefully (fail-safe)

### Why safeParse() and safeParseAsync() are WARNING severity:

1. **Never throws** - Returns discriminated union instead
2. **Type-safe** - TypeScript enforces checking result.success
3. **Less critical** - Still important to check success, but won't crash if forgotten
4. **Best practice** - Recommended approach in documentation

---

## Testing Strategy

### Test Coverage Needed:

1. ✅ **parse() without try-catch** → Should detect violation
2. ✅ **parseAsync() without try-catch** → Should detect violation
3. ✅ **parse() with proper try-catch** → Should NOT detect violation
4. ✅ **safeParse() usage** → Should warn if success not checked (lower priority)
5. ✅ **Coercion failures** → Should detect when z.coerce.* used with parse()
6. ✅ **Async refinements** → Should detect when parse() used instead of parseAsync()

---

## Contract Maintenance Notes

### Version Coverage

- **Semver:** `>=3.0.0`
- **Rationale:** API has been stable since v3. parse() behavior consistent across all v3.x versions.
- **CVE Note:** Recommend >= 3.22.3 to avoid ReDoS vulnerability

### Future Considerations

1. **v4.x breaking changes** - Monitor for API changes to parse methods
2. **New validation methods** - Check if new methods throw exceptions
3. **Error structure changes** - Monitor ZodError.issues format
4. **Performance improvements** - Newer versions may have different performance characteristics

---

## Related Contracts

- **react-hook-form** - Often used together (zodResolver integration)
- **@conform-to/zod** - Form validation integration (has separate CVE)

---

## Notes

- Zod is heavily influenced by Yup but has better TypeScript support
- The library emphasizes type inference with `z.infer<typeof schema>`
- Zod schemas are composable with `.merge()`, `.extend()`, `.pick()`, `.omit()`
- The `superRefine()` method provides lower-level refinement control for complex validations
