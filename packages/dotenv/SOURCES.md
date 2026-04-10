# Sources: dotenv

**Package:** dotenv
**Version:** 16.x (latest)
**Type:** Configuration utility - .env file parsing and environment variable loading
**Weekly Downloads:** 50M+
**Last Updated:** 2026-02-27

---

## Official Documentation

### Primary Documentation
- **npm Package:** https://www.npmjs.com/package/dotenv
- **GitHub Repository:** https://github.com/motdotla/dotenv
- **GitHub Issues:** https://github.com/motdotla/dotenv/issues

### Package Characteristics
dotenv is a zero-dependency module that loads environment variables from a `.env` file into `process.env`. It follows the Twelve-Factor App methodology for storing configuration in the environment separate from code.

**Core Purpose:**
- Parse `.env` files into key-value pairs
- Load environment variables into `process.env`
- Support secure configuration management
- Enable environment-specific settings

---

## API Reference

### 1. config() Method

**Signature:**
```typescript
function config(options?: DotenvConfigOptions): DotenvConfigOutput

interface DotenvConfigOptions {
  path?: string;         // Path to .env file (default: ".env")
  encoding?: string;     // File encoding (default: "utf8")
  debug?: boolean;       // Enable debug output
  override?: boolean;    // Override existing process.env values
  processEnv?: object;   // Target object (default: process.env)
}

interface DotenvConfigOutput {
  parsed?: DotenvParseOutput;  // Parsed key-value pairs
  error?: Error;               // Error if loading failed
}
```

**Purpose:** Reads `.env` file, parses contents, and assigns values to `process.env`.

**Return Value:**
- On success: `{ parsed: { KEY: 'value', ... } }`
- On failure: `{ error: Error }`

**Source:** https://github.com/motdotla/dotenv#config

**Usage Example:**
```typescript
// Basic usage
require('dotenv').config();

// With options
const result = require('dotenv').config({
  path: '/custom/path/to/.env',
  encoding: 'utf8',
  debug: true,
  override: true
});

// Error handling
if (result.error) {
  throw result.error;
}
```

**Behavioral Claims:**

**POSTCONDITION 1: File Not Found Errors**
- **Claim:** If the `.env` file is not found, `config()` returns an object with an `error` property containing the file system error.
- **Severity:** ERROR
- **Source:** https://github.com/motdotla/dotenv - README "File not found: Check that `.env` exists in the correct directory"
- **Evidence:** Return value structure: `{ error: Error }` when file doesn't exist
- **Common Bug:** Developers call `config()` without checking the `error` property, causing app to run with missing environment variables

**POSTCONDITION 2: Parse Errors**
- **Claim:** If the `.env` file contains invalid syntax, `config()` returns an object with an `error` property containing the parse error.
- **Severity:** ERROR
- **Source:** https://github.com/motdotla/dotenv - README "Parse errors: Enable `debug: true` for console output"
- **Evidence:** Parse engine throws errors for invalid syntax
- **Common Bug:** Invalid `.env` syntax silently fails, causing undefined variables

**POSTCONDITION 3: Missing Required Variables**
- **Claim:** `config()` does not validate that required environment variables are present - developers must check `process.env` manually.
- **Severity:** ERROR
- **Source:** Related package dotenv-safe exists specifically to validate required variables
- **Evidence:** https://www.npmjs.com/package/dotenv-safe - "MissingEnvVarsError will be thrown if any variables are missing"
- **Common Bug:** App uses `process.env.API_KEY` without checking if it's defined, causing runtime errors or undefined behavior

**POSTCONDITION 4: Encoding Errors**
- **Claim:** If the `.env` file uses non-UTF-8 encoding and encoding option is not set, parse errors may occur.
- **Severity:** WARNING
- **Source:** https://github.com/motdotla/dotenv - config options include `encoding` parameter
- **Evidence:** Default encoding is 'utf8', other encodings must be specified
- **Common Bug:** Files with special characters fail to parse correctly

---

### 2. parse() Method

**Signature:**
```typescript
function parse(src: string | Buffer, options?: DotenvParseOptions): DotenvParseOutput

interface DotenvParseOutput {
  [key: string]: string;
}
```

**Purpose:** Parses `.env` format string or Buffer into key-value object. Does NOT modify `process.env`.

**Source:** https://github.com/motdotla/dotenv#parse

**Usage Example:**
```typescript
const dotenv = require('dotenv');
const buf = Buffer.from('BASIC=basic');
const config = dotenv.parse(buf);
// Returns: { BASIC: 'basic' }
```

**Behavioral Claims:**

**POSTCONDITION 5: Parse Method Errors**
- **Claim:** `parse()` throws errors for invalid syntax (unlike `config()` which returns errors).
- **Severity:** ERROR
- **Source:** https://github.com/motdotla/dotenv - parse method throws exceptions
- **Evidence:** Function signature does not include error return value
- **Common Bug:** Developers call `parse()` without try-catch, causing unhandled exceptions

---

### 3. populate() Method

**Signature:**
```typescript
function populate(processEnv: object, parsed: DotenvParseOutput, options?: DotenvPopulateOptions): void
```

**Purpose:** Assigns parsed values to target object. Advanced usage for custom implementations.

**Source:** https://github.com/motdotla/dotenv#populate

---

## Parsing Rules

### Syntax Specification

**Source:** https://github.com/motdotla/dotenv#rules

The dotenv parser follows these rules:

1. **Basic Assignment:**
   ```bash
   BASIC=basic
   ```
   Results in: `{ BASIC: 'basic' }`

2. **Empty Lines:**
   - Empty lines are skipped

3. **Comments:**
   ```bash
   # This is a comment
   KEY=value  # Inline comment
   ```
   - Lines beginning with `#` are comments
   - `#` marks comment start unless value is quoted

4. **Empty Values:**
   ```bash
   EMPTY=
   ```
   Results in: `{ EMPTY: '' }`

5. **Whitespace Trimming:**
   ```bash
   FOO= value
   ```
   Results in: `{ FOO: 'value' }` (trimmed)

6. **Quoted Values:**
   ```bash
   SINGLE='single quoted'
   DOUBLE="double quoted"
   ```
   - Inner quotes are preserved
   - Whitespace inside quotes is preserved

7. **JSON Values:**
   ```bash
   JSON={"foo": "bar"}
   ```
   Results in: `{ JSON: '{"foo": "bar"}' }`

8. **Multiline Values:**
   ```bash
   MULTILINE="new\nline"
   ```
   - Double-quoted values expand `\n` to newlines
   - Can use literal line breaks in quoted strings

9. **Backticks:**
   ```bash
   BACKTICK=`mixed "quotes"`
   ```
   - Supported for values with mixed quotes

### Multiline Variables

**Source:** https://github.com/motdotla/dotenv#multiline-values

For multiline content like private keys:

```bash
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
Kh9NV...
-----END RSA PRIVATE KEY-----"
```

Or with escape sequences:
```bash
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nKh9NV...\n-----END RSA PRIVATE KEY-----\n"
```

---

## Error Handling Patterns

### Standard Error Handling

**Source:** https://github.com/motdotla/dotenv/issues/705 - "dotenv import error handling seems not ideal"

**Recommended Pattern:**
```typescript
const result = dotenv.config();
if (result.error) {
  throw result.error;
}
console.log(result.parsed);
```

**Common Mistakes:**

1. **No Error Checking:**
   ```typescript
   // ❌ BAD - Silent failure
   dotenv.config();
   const apiKey = process.env.API_KEY; // undefined if .env missing
   ```

2. **Missing Variable Validation:**
   ```typescript
   // ❌ BAD - No validation
   dotenv.config();
   const apiKey = process.env.API_KEY;
   // App crashes later when apiKey is undefined
   ```

3. **Correct Pattern:**
   ```typescript
   // ✅ GOOD - Check for errors
   const result = dotenv.config();
   if (result.error) {
     throw new Error(`Failed to load .env: ${result.error.message}`);
   }

   // ✅ GOOD - Validate required variables
   const apiKey = process.env.API_KEY;
   if (!apiKey) {
     throw new Error('API_KEY environment variable is required');
   }
   ```

### Environment Variable Injection Vulnerability

**Source:** https://github.com/google/zx/security/advisories/GHSA-qwp8-x4ff-5h87

**Vulnerability:** Environment Variable Injection in dotenv.stringify

An attacker with control over environment variable values can inject unintended environment variables into `process.env`, potentially leading to arbitrary command execution.

**Mitigation:**
- Avoid using quotes and backticks in environment variable values
- Enforce strict validation of environment variables before usage
- Use dotenvx for encrypted environment files

---

## Security Best Practices

### Source: https://github.com/motdotla/dotenv#security-issues

**Critical Security Guidelines:**

1. **Never Commit `.env` Files:**
   ```bash
   # ✅ Add to .gitignore
   echo ".env" >> .gitignore
   ```
   - `.env` files should NEVER be committed to version control
   - Use `.env.example` as template (without secrets)

2. **Use Encrypted `.env` Files:**
   - dotenvx (recommended successor) encrypts `.env` files before committing
   - https://github.com/dotenvx/dotenvx - "a secure dotenv–from the creator of `dotenv`"

3. **Git Pre-Commit Hooks:**
   - Enable hooks to prevent accidental commits of secrets
   - Use tools like git-secrets or similar

4. **Secret Management in Production:**
   - Use dedicated secret management tools (AWS Secrets Manager, HashiCorp Vault, etc.)
   - Avoid plaintext `.env` files in production

5. **Remove Accidentally Committed Secrets:**
   - If secrets are committed, remove from git history immediately
   - Rotate all compromised credentials

6. **Report Security Issues:**
   - Email: security@dotenv.org
   - Do NOT report through public GitHub issues

### Common Security Mistakes

**Source:** Various GitHub issues and security advisories

1. **Credentials in Git:**
   ```bash
   # ❌ CRITICAL - Never do this
   git add .env
   git commit -m "Add config"
   git push
   ```
   **Impact:** Credentials exposed in git history forever

2. **Logging Parse Errors:**
   ```typescript
   // ❌ BAD - May leak secrets in logs
   const result = dotenv.config();
   if (result.error) {
     console.error('Failed to load .env:', result.error);
   }
   ```
   **Impact:** Sensitive values may appear in error messages

3. **Missing .env in Production:**
   ```typescript
   // ❌ BAD - App crashes
   dotenv.config(); // File not found in production
   const dbUrl = process.env.DATABASE_URL; // undefined
   db.connect(dbUrl); // Crash
   ```
   **Impact:** Application failure, potential exposure

---

## Advanced Usage Patterns

### ES6 Module Import

**Source:** https://github.com/motdotla/dotenv#usage

```javascript
import 'dotenv/config'
```

**Important:** This must be the **first import statement** due to ES6 module execution order.

**Common Mistake:** Importing dotenv after other modules that access `process.env`

### Node CLI Preload

```bash
node -r dotenv/config script.js
```

Loads dotenv before application code runs, avoiding the need to require it in code.

### Custom Configuration via CLI

```bash
node -r dotenv/config script.js \
  dotenv_config_path=/custom/.env \
  dotenv_config_debug=true
```

**Source:** https://github.com/motdotla/dotenv/issues/705

**Known Issue:** When using `dotenv.config()` directly (not via import), the library doesn't read `DOTENV_CONFIG_PATH` environment variable, which can cause silent loading failures.

---

## Related Packages

### dotenv-safe

**Source:** https://www.npmjs.com/package/dotenv-safe

Extends dotenv to validate that required environment variables are defined.

**Usage:**
```javascript
require('dotenv-safe').config({
  allowEmptyValues: false,
  example: './.env.example'
});
```

**Throws:** `MissingEnvVarsError` if variables in `.env.example` are missing from `.env`

**Use Case:** Enforcing required variables at startup

### dotenvx

**Source:** https://github.com/dotenvx/dotenvx

Successor to dotenv with encryption support. Recommended for secure `.env` file management.

**Features:**
- Encrypt `.env` files before committing
- Decrypt at runtime
- Secure by default

### dotenv-parse-variables

**Source:** https://www.npmjs.com/package/dotenv-parse-variables

Parses environment variables into appropriate types (numbers, booleans, arrays, etc.)

---

## Twelve-Factor App Methodology

**Source:** https://github.com/motdotla/dotenv#should-i-commit-my-env-file

dotenv implements principles from [The Twelve-Factor App](https://12factor.net/config):

> "Store config in the environment separate from code"

**Benefits:**
- Environment-specific settings stay outside codebase
- Consistency across deployments
- No config changes in version control
- Easy environment switching (dev/staging/prod)

---

## Common Error Scenarios

### 1. File Not Found

**Scenario:** `.env` file missing

**Error:**
```
{ error: Error: ENOENT: no such file or directory, open '.env' }
```

**Detection:**
```typescript
const result = dotenv.config();
if (result.error && result.error.code === 'ENOENT') {
  console.error('.env file not found');
}
```

### 2. Parse Error

**Scenario:** Invalid syntax in `.env` file

**Example Invalid Syntax:**
```bash
BROKEN KEY=value  # Space in key name
```

**Error:**
```
{ error: SyntaxError: Unexpected token in .env file }
```

### 3. Missing Required Variable

**Scenario:** App expects variable that isn't defined

```typescript
dotenv.config();
const apiKey = process.env.API_KEY; // undefined
apiService.connect(apiKey); // TypeError: Cannot read property of undefined
```

**Solution:**
```typescript
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error('API_KEY environment variable is required');
}
```

### 4. Called Too Late

**Scenario:** dotenv called after variables accessed

```typescript
// ❌ BAD - dbUrl is undefined
const dbUrl = process.env.DATABASE_URL;
dotenv.config();
```

**Solution:**
```typescript
// ✅ GOOD - config() called first
dotenv.config();
const dbUrl = process.env.DATABASE_URL;
```

### 5. Override Not Set

**Scenario:** Environment variable already exists, `.env` value ignored

```bash
# Shell
export API_URL=https://prod.example.com

# .env file
API_URL=https://dev.example.com
```

```typescript
dotenv.config();
console.log(process.env.API_URL); // https://prod.example.com (not overridden)
```

**Solution:**
```typescript
dotenv.config({ override: true });
console.log(process.env.API_URL); // https://dev.example.com (overridden)
```

---

## Detection Patterns

### Pattern 1: Unhandled config() Errors

**Bad Pattern:**
```typescript
dotenv.config();
// No error checking
```

**Detection Rule:** `dotenv.config()` call without checking return value's `error` property

### Pattern 2: Missing Variable Validation

**Bad Pattern:**
```typescript
dotenv.config();
const apiKey = process.env.API_KEY;
// No validation that apiKey is defined
```

**Detection Rule:** `process.env` access without subsequent undefined check

### Pattern 3: parse() Without Try-Catch

**Bad Pattern:**
```typescript
const config = dotenv.parse(envString);
// parse() throws on error, no try-catch
```

**Detection Rule:** `dotenv.parse()` call not wrapped in try-catch block

---

## TypeScript Support

**Source:** https://github.com/motdotla/dotenv - TypeScript definitions included

```typescript
import * as dotenv from 'dotenv';

const result: dotenv.DotenvConfigOutput = dotenv.config();

if (result.error) {
  throw result.error;
}

const parsed: dotenv.DotenvParseOutput | undefined = result.parsed;
```

**Type Definitions:**
- `DotenvConfigOptions`
- `DotenvConfigOutput`
- `DotenvParseOptions`
- `DotenvParseOutput`
- `DotenvPopulateOptions`

---

## Real-World Impact

### Issue #705: Error Handling Concerns

**Source:** https://github.com/motdotla/dotenv/issues/705

Community feedback indicates the current error handling pattern is "not ideal" because:
- The `error` property is not prominently documented in types
- Easy to miss checking for errors
- Silent failures are common

**Recommendation:** Use dotenv-safe for stricter validation

### Issue #291: Variables Not Loading

**Source:** https://github.com/motdotla/dotenv/issues/291

Common issue: "dotenv won't load parsed env variables into process.env"

**Causes:**
- File path incorrect
- Called after variables accessed
- Override not set when variables already exist
- File encoding issues

---

## Summary of Behavioral Contracts

### High-Priority Postconditions

1. **File not found errors MUST be handled** (ERROR severity)
2. **Parse errors MUST be handled** (ERROR severity)
3. **Missing required variables MUST be validated** (ERROR severity)
4. **parse() calls MUST be wrapped in try-catch** (ERROR severity)

### Medium-Priority Postconditions

5. **Encoding errors should be handled** (WARNING severity)
6. **dotenv.config() should be called before accessing process.env** (WARNING severity)
7. **Credentials should never be committed to git** (SECURITY severity)

### Security Postconditions

8. **.env files MUST be in .gitignore** (SECURITY severity)
9. **Environment variable injection vulnerabilities MUST be mitigated** (SECURITY severity)
10. **Production deployments should use secret management tools** (INFO severity)

---

## References

1. Official Documentation: https://github.com/motdotla/dotenv
2. npm Package: https://www.npmjs.com/package/dotenv
3. Snyk Security: https://snyk.io/advisor/npm-package/dotenv
4. GitHub Issues: https://github.com/motdotla/dotenv/issues
5. dotenv-safe: https://www.npmjs.com/package/dotenv-safe
6. dotenvx (secure successor): https://github.com/dotenvx/dotenvx
7. Twelve-Factor App: https://12factor.net/config
8. Environment Variable Injection: https://github.com/google/zx/security/advisories/GHSA-qwp8-x4ff-5h87

---

**Total Lines:** 586
**Last Updated:** 2026-02-27
**Confidence:** HIGH (official documentation, security advisories, community issues)
