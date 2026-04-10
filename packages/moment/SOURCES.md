# Sources: moment

**Package:** moment
**Contract Version:** 1.0.0
**Last Verified:** 2026-02-26

---

## Primary Sources

### Official Documentation
- **Parsing Strings**: https://momentjs.com/docs/#/parsing/string/
  - Documents that moment() can return invalid moment objects
  - Invalid dates do not throw errors
  - Must use isValid() to check

- **UTC Parsing**: https://momentjs.com/docs/#/parsing/utc/
  - Same behavior for UTC parsing
  - Returns invalid moment on bad input

- **Validation**: https://momentjs.com/docs/#/parsing/is-valid/
  - isValid() returns boolean indicating if moment is valid
  - Invalid moments are created for bad input

### NPM Package
- **Package Page**: https://www.npmjs.com/package/moment
  - Installation and basic usage
  - Note: In maintenance mode

### Repository
- **GitHub**: https://github.com/moment/moment
  - Source code and documentation
  - Maintenance mode since 2020

### Security
- **CVE-2022-24785**: https://nvd.nist.gov/vuln/detail/CVE-2022-24785
  - Path traversal in locale switching (versions 1.0.1-2.29.1)
  - Patched in version 2.29.2
  - Advisory: https://github.com/moment/moment/security/advisories/GHSA-8hfj-j24r-96c4

- **CVE-2022-31129**: https://nvd.nist.gov/vuln/detail/CVE-2022-31129
  - ReDoS vulnerability in RFC2822 parsing (versions 2.18.0-2.29.3)
  - Patched in version 2.29.4
  - Advisory: https://github.com/moment/moment/security/advisories/GHSA-wc69-rhjr-hc9g

---

## Behavioral Claims

### Invalid Date Parsing Returns Invalid Moment
**Claim:** moment() and moment.utc() return invalid moment objects for bad input instead of throwing.

**Evidence:**
- Documentation states invalid input creates invalid moment objects
- isValid() method exists specifically to check validity
- No exceptions are thrown for invalid dates
- Source: https://momentjs.com/docs/#/parsing/

**Severity:** Error (invalid dates cause calculation errors and data corruption)

### Path Traversal via Locale Switching
**Claim:** moment.locale() with user input allows path traversal attacks in versions 1.0.1-2.29.1.

**Evidence:**
- CVE-2022-24785 documents path traversal vulnerability
- Attackers can use dot-dot sequences (/../) in locale strings
- Allows loading arbitrary locale files
- Patched in version 2.29.2
- Source: https://nvd.nist.gov/vuln/detail/CVE-2022-24785

**Severity:** Error (path traversal security vulnerability)

### ReDoS in RFC2822 Parsing
**Claim:** moment() with RFC_2822 format is vulnerable to ReDoS in versions 2.18.0-2.29.3.

**Evidence:**
- CVE-2022-31129 documents ReDoS vulnerability
- preprocessRFC2822 function causes excessive backtracking
- Long crafted inputs cause exponential response times
- Can lead to system slowdowns or crashes
- Patched in version 2.29.4
- Source: https://nvd.nist.gov/vuln/detail/CVE-2022-31129

**Severity:** Warning (denial of service vulnerability)

---

## Notes

- Moment.js is in maintenance mode (no new features)
- Recommended alternatives: day.js, luxon, date-fns
- Still widely used in legacy codebases
- Does NOT throw on invalid input - returns invalid object instead
- This is different from newer libraries like luxon which are more explicit
