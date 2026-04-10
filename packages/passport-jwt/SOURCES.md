# Sources: passport-jwt

## Official Documentation

- **npm Package**: [passport-jwt](https://www.npmjs.com/package/passport-jwt)
- **Official Website**: [passport-jwt](https://www.passportjs.org/packages/passport-jwt/)
- **Code Examples**: [Snyk Advisor](https://snyk.io/advisor/npm-package/passport-jwt/example)
- **Medium Tutorial**: [JWT Authentication with Passport](https://medium.com/@mukarramjavid/jwt-authentication-with-passport-passport-jwt-in-nodejs-ec177cb49655)

## Error Handling Patterns

The verify callback uses the done callback with three parameters:
- **done(error, user, info)** format
- **Success**: `done(null, user)` - token valid, user found
- **Failure**: `done(null, false)` - token invalid or user not found
- **Error**: `done(err)` - database or system error occurred

Common errors include:
- Database connection failures during user lookup
- JWT payload extraction errors
- User not found errors
- Token expired or invalid

## Contract Rationale

**Postcondition passport-jwt-001**: The verify callback performs database operations that can fail during user lookup. Unhandled errors in the callback will crash the Node.js application. The done callback provides the standard Passport error handling mechanism.

## Research Date

2026-02-26
