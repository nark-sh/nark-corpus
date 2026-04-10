# Sources: @nestjs/common

**Package:** `@nestjs/common`
**Version:** 10.x, 11.x
**Category:** framework (NestJS core)
**Status:** ✅ Complete

---

## Official Documentation

- **Main Docs:** https://docs.nestjs.com/
- **Providers:** https://docs.nestjs.com/providers
- **Exception Filters:** https://docs.nestjs.com/exception-filters
- **Controllers:** https://docs.nestjs.com/controllers
- **npm:** https://www.npmjs.com/package/@nestjs/common

## Behavioral Requirements

**DI Errors:** Constructor failures during dependency injection
**Route Handler Errors:** Unhandled async errors in controllers
**Injectable constructors should handle** initialization errors
**Controller route handlers must handle** async errors
**Use ExceptionFilter** for centralized error handling

## Contract Rationale

**DI errors crash application startup:** Constructor failures prevent boot
**Unhandled route errors crash application**
**Exception filters provide consistent error handling**

**Created:** 2026-02-26
**Status:** ✅ COMPLETE
