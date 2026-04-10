# Sources: unzipper

## Official Documentation

- **npm Package**: [unzipper](https://www.npmjs.com/package/unzipper)
- **GitHub Repository**: [ZJONSSON/node-unzipper](https://github.com/ZJONSSON/node-unzipper)
- **LogRocket Tutorial**: [Best methods for unzipping files](https://blog.logrocket.com/best-methods-unzipping-files-node-js/)
- **Code Examples**: [Snyk Advisor](https://snyk.io/advisor/npm-package/unzipper/functions/unzipper.Extract)

## Error Handling Patterns

Unzipper supports both event-based and promise-based error handling:
- **Event-based**: `.on('error', callback)`
- **Promise-based**: `.promise().catch(callback)`
- **Autodrain**: `.autodrain().catch(callback)` or `.autodrain().on('error', callback)`

Common errors include:
- Corrupt ZIP files
- I/O errors during extraction
- Invalid ZIP structure
- Permission errors

## Contract Rationale

**Postcondition unzipper-001**: ZIP extraction involves file I/O and parsing operations that can fail due to corrupt files, invalid data, or file system errors. Without error handlers, these errors will crash Node.js applications. The official documentation provides error handling examples for all extraction methods.

## Research Date

2026-02-26
