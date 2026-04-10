# Sources: passport

**Package:** `passport`
**Version:** 0.7.x
**Category:** authentication (Authentication middleware)
**Status:** ✅ Complete

---

## Official Documentation

- **Main Docs:** http://www.passportjs.org/docs/
- **Authenticate:** http://www.passportjs.org/docs/authenticate/
- **Configure:** http://www.passportjs.org/docs/configure/
- **Strategies:** http://www.passportjs.org/packages/passport-strategy/
- **npm:** https://www.npmjs.com/package/passport

## Behavioral Requirements

**Authentication Failures:** Invalid credentials, network errors, database issues
**Must handle authentication failures** in callback
**Strategy errors must be propagated properly**
**Custom strategies must handle errors** correctly

## Contract Rationale

**Authentication can fail for many reasons:** Invalid credentials, database down, network issues
**Unhandled auth errors crash application**
**Strategy errors need explicit handling:** Done callback must be called with error
**Callback errors must be handled:** (err, user, info) pattern

**Created:** 2026-02-26
**Status:** ✅ COMPLETE
