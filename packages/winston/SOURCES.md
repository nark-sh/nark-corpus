# Sources: winston

**Package:** `winston`
**Version:** 3.x
**Category:** logging (Logging library)
**Status:** ✅ Complete

---

## Official Documentation

- **Main Docs:** https://github.com/winstonjs/winston#readme
- **Transports:** https://github.com/winstonjs/winston#transports
- **Exceptions:** https://github.com/winstonjs/winston#handling-uncaught-exceptions-with-winston
- **Awaiting Logs:** https://github.com/winstonjs/winston#awaiting-logs-to-be-written-in-winston
- **npm:** https://www.npmjs.com/package/winston

## Behavioral Requirements

**Transport Errors:** File write failures, network issues
**Should add error event listeners** to logger and transports
**Transport failures should not crash application**
**handleExceptions option can mask errors** if not configured properly

## Contract Rationale

**Logger errors are silent by default:** Transport failures go unnoticed
**File transports can fail:** Disk full, permissions, path issues
**Network transports can fail:** Connection issues, timeouts
**handleExceptions requires careful configuration:** Can prevent proper error handling

## Real-World Evidence (2026-04-02)

- santiq/bulletproof-nodejs (⭐5k): createLogger without .on('error') — TP violation
- getmaxun/maxun (⭐15k): createLogger with File transports, no .on('error') — TP violation
- whyour/qinglong (⭐19k): createLogger with .on('error') — correct, no violation
- 2/4 repos scanned have the antipattern = 50% prevalence in real world

**Created:** 2026-02-26
**Updated:** 2026-04-02
**Status:** ✅ COMPLETE (evidence_quality upgraded from stub to confirmed)
