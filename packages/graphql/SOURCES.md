# Sources: graphql

**Package:** `graphql`
**Version:** 16.x
**Category:** api (GraphQL implementation)
**Status:** ✅ Complete

---

## Official Documentation

- **Main Docs:** https://graphql.org/graphql-js/
- **Execution:** https://graphql.org/graphql-js/execution/#execute
- **Language:** https://graphql.org/graphql-js/language/#parse
- **Validation:** https://graphql.org/graphql-js/validation/#validate
- **Error Handling:** https://graphql.org/learn/execution/#handling-errors
- **npm:** https://www.npmjs.com/package/graphql

## Behavioral Requirements

**Parse Errors:** Invalid query syntax throws GraphQLError
**Validation Errors:** Returns array of validation errors
**Execution Errors:** Resolver failures in errors array
**Must wrap parse()** in try-catch
**Must check execute() result** for errors array
**Must check validate() return** value for errors

## Contract Rationale

**parse() throws on syntax errors:** Invalid GraphQL syntax
**execute() returns {errors, data}:** Errors array contains resolver failures
**validate() returns error array:** Empty means valid
**Unhandled resolver errors expose internal details**

**Created:** 2026-02-26
**Status:** ✅ COMPLETE
