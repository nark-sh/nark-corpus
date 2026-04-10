# Sources: @hapi/hapi

**Package:** `@hapi/hapi`
**Version:** 21.x
**Category:** framework (Web framework)
**Status:** ✅ Complete

---

## Official Documentation

- **Main Docs:** https://hapi.dev/
- **API:** https://hapi.dev/api/?v=21.4.6
- **Routes:** https://hapi.dev/api/?v=21.4.6#-serverrouteroute
- **Extensions:** https://hapi.dev/api/?v=21.4.6#-serverextoptions
- **npm:** https://www.npmjs.com/package/@hapi/hapi

## Behavioral Requirements

**Route Handler Errors:** Unhandled errors crash server
**Server Start Errors:** Port conflicts, configuration errors
**Must wrap server.start()** in try-catch
**Route handlers should handle errors** and return proper responses
**Use onPreResponse extension** for centralized error handling

## Contract Rationale

**Route errors crash server:** Unhandled exceptions stop process
**Server startup can fail:** Port in use, invalid config
**Centralized error handling ensures consistency**

**Created:** 2026-02-26
**Status:** ✅ COMPLETE
