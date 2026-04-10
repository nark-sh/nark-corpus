# @tanstack/react-router Behavioral Contract Sources

This document lists all authoritative sources consulted when creating the @tanstack/react-router behavioral contract.

**Package:** @tanstack/react-router
**Versions Covered:** 1.0.0 - 1.x.x
**Contract Version:** 1.0.0
**Last Verified:** 2026-03-12

---

## Official Documentation

### Core Documentation

- **Type Safety Guide**: https://tanstack.com/router/latest/docs/framework/react/guide/type-safety
  - Documents strict mode behavior and runtime type validation
  - Documents when route mismatch errors are thrown
  - Documents param type validation at runtime

- **Error Boundaries Guide**: https://tanstack.com/router/latest/docs/framework/react/guide/error-boundaries
  - Documents how loader errors propagate
  - Documents ErrorComponent for route-level error handling
  - Documents lazy route loading failure handling

- **Not Found Errors Guide**: https://tanstack.com/router/v1/docs/framework/react/guide/not-found-errors
  - Documents behavior when routes are not found
  - Documents Navigate component errors on invalid routes

- **Route Options API**: https://tanstack.com/router/latest/docs/framework/react/api/router/RouteOptionsType
  - Documents loader function error propagation
  - Documents validateSearch option behavior
  - Documents context and beforeLoad options

- **Router Options API**: https://tanstack.com/router/latest/docs/framework/react/api/router/RouterOptionsType
  - Documents router creation error conditions
  - Documents duplicate route path errors
  - Documents invalid route hierarchy errors

---

## GitHub Issues (Known Behavioral Edge Cases)

### Navigation During Component Unmount

- **Issue**: https://github.com/TanStack/router/issues/1181
- **Summary**: Navigation triggered after component unmounts causes errors; requires cleanup or error boundary
- **Relevance**: Encoded as postcondition `navigation-during-unmount` with severity warning

### Navigate Component Infinite Loop

- **Issue**: https://github.com/TanStack/router/issues/1181
- **Summary**: Navigate component can cause infinite navigation loops exceeding max depth
- **Relevance**: Encoded as postcondition `navigate-infinite-loop` with severity error

---

## Testing Against Real Codebases

The following patterns were examined to validate this contract:

### Verified error conditions:
1. **Route mismatch with strict: true** — confirmed throws at runtime when `from` param doesn't match current route
2. **Missing loader** — confirmed `useLoaderData` throws when no loader is defined
3. **Search param validation** — confirmed `validateSearch` errors surface as route errors

### Known limitations:
- Many error conditions are TypeScript compile-time safety features, not runtime errors
- Some errors only surface with strict: true (default)

---

## Known CVEs and Security Issues

### None Currently Documented

As of 2026-03-12, there are no open CVEs related to @tanstack/react-router behavioral contracts.

---

## Version History

### 1.0.0 (2026-03-06)
- Initial contract covering @tanstack/react-router 1.x
- Covers: useNavigate, useMatch, useLoaderData, useParams, useSearch, useRouteContext, createRouter, Navigate, Link, createRoute
- Error states: route mismatch, loader errors, search param validation, invalid route hierarchy

---

## Maintenance Notes

### Next Review: 2026-06-12 (3 months)

Review triggers:
- [ ] @tanstack/react-router releases a major/minor version
- [ ] New GitHub issues document behavioral edge cases
- [ ] False positives reported in real codebases
- [ ] TypeScript strict mode behavior changes

---

## Questions or Corrections

If you find:
- Incorrect behavioral claims
- Missing error states
- Broken documentation links
- Behavioral changes in newer versions

Please open an issue with label `package:@tanstack/react-router`.
