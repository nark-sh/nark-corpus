# Sources: date-fns

**Package:** `date-fns`
**Version:** 3.x, 4.x
**Category:** utility (Date manipulation)
**Status:** ✅ Complete

---

## Official Documentation

- **Main Docs:** https://date-fns.org/
- **parse:** https://date-fns.org/docs/parse
- **format:** https://date-fns.org/docs/format
- **isValid:** https://date-fns.org/docs/isValid
- **npm:** https://www.npmjs.com/package/date-fns

## Behavioral Requirements

**Invalid Date Parsing:** parse() returns Invalid Date for malformed input
**Invalid Date in calculations:** Results in NaN
**Must validate with isValid()** after parsing user input
**format() on Invalid Date** produces 'Invalid Date' string

## Contract Rationale

**Invalid Date objects propagate silently:** NaN in calculations
**User input dates are often malformed:** Timezone issues, format mismatches
**isValid() catches Invalid Date** before calculations
**'Invalid Date' string appears in output** if not validated

**Created:** 2026-02-26
**Status:** ✅ COMPLETE
