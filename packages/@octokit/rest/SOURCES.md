# Sources for @octokit/rest Contract

This document lists all sources used to create the behavioral contract for `@octokit/rest`.

## Official Documentation

### Error Handling
- **How to handle errors · octokit/octokit.js · Discussion #2039**
  - URL: https://github.com/octokit/octokit.js/discussions/2039
  - Key Info: Official guidance on error handling patterns, RequestError properties
  - Date Accessed: 2026-02-25
  - Relevance: Primary source for error handling requirements

- **GitHub - octokit/request-error.js**
  - URL: https://github.com/octokit/request-error.js/
  - Key Info: RequestError class documentation, properties (status, message, request, response)
  - Date Accessed: 2026-02-25
  - Relevance: Defines the error object structure returned by all @octokit/rest methods

### API Documentation
- **@octokit/rest - npm**
  - URL: https://www.npmjs.com/package/@octokit/rest
  - Key Info: Package overview, installation, basic usage
  - Date Accessed: 2026-02-25
  - Relevance: Official package documentation

- **GitHub REST API - Repositories**
  - URL: https://docs.github.com/en/rest/repos/repos
  - Key Info: Repository operations (get, create, update, delete)
  - Date Accessed: 2026-02-25
  - Relevance: Documents expected status codes and error scenarios

- **GitHub REST API - Git References**
  - URL: https://docs.github.com/en/rest/git/refs
  - Key Info: Git reference operations (getRef, createRef)
  - Date Accessed: 2026-02-25
  - Relevance: Documents ref operations and error cases

- **GitHub REST API - Pull Requests**
  - URL: https://docs.github.com/en/rest/pulls/pulls
  - Key Info: Pull request operations (create, list, merge)
  - Date Accessed: 2026-02-25
  - Relevance: Documents PR operations and mergeable state errors

- **GitHub REST API - Issues**
  - URL: https://docs.github.com/en/rest/issues/issues
  - Key Info: Issue operations (create, update, list)
  - Date Accessed: 2026-02-25
  - Relevance: Documents issue operations and error codes (410 for disabled issues)

- **GitHub REST API - Repository Contents**
  - URL: https://docs.github.com/en/rest/repos/contents
  - Key Info: File content operations (getContent, createOrUpdateFileContents)
  - Date Accessed: 2026-02-25
  - Relevance: Documents file size limits, SHA conflicts, error scenarios

## Real-World Usage

### Backstage
- **File**: `test-repos/backstage/plugins/catalog-import/src/api/GitHub.ts`
- **Pattern**: Uses `.catch(e => throw new Error())` on each API call
- **Key Methods**: repos.get(), git.getRef(), git.createRef(), repos.createOrUpdateFileContents(), pulls.create()
- **Error Handling**: Expects `error.status` and `error.message` properties
- **Date Analyzed**: 2026-02-25

## Security Analysis

### CVE Search Results
- **Search Date**: 2026-02-25
- **Finding**: No major CVEs found for @octokit/rest
- **Package Health**:
  - 5.6M+ weekly downloads
  - Actively maintained (4 maintainers)
  - Regular version updates
  - Versions analyzed: v19-22

## Key Behavioral Patterns

### Error Object Structure
All errors thrown by @octokit/rest are instances of `RequestError` with:
- `status`: HTTP status code (404, 403, 422, etc.)
- `message`: Error message from GitHub API
- `request`: Request details (method, url, headers, body)
- `response`: Response details (url, status, headers, data)

### Common Error Codes
- **404 Not Found**: Resource doesn't exist, or repo is private with insufficient access
- **403 Forbidden**: Rate limit exceeded, or insufficient permissions
- **401 Unauthorized**: Invalid or missing authentication token
- **422 Unprocessable Entity**: Validation errors (duplicate name, ref already exists, invalid params)
- **409 Conflict**: SHA mismatch on file updates (concurrent modification)
- **405 Method Not Allowed**: Operation not permitted (e.g., PR not mergeable)
- **410 Gone**: Feature disabled (e.g., issues disabled for repository)

### Rate Limiting
- GitHub API has rate limits (5000/hour authenticated, 60/hour unauthenticated)
- Rate limit errors return 403 status with specific headers
- Recommendation: Use `@octokit/plugin-throttling` for automatic retry handling

### Authentication Patterns
- Instance created with auth token: `new Octokit({ auth: token })`
- 404 errors can indicate private repos (authentication ambiguity)
- 401 errors indicate invalid/missing authentication

## Contract Design Decisions

### Severity Levels
- **ERROR**: All write operations (create, update, delete) and critical read operations (get, getRef, getContent)
- **WARNING**: List operations (pulls.list, issues.list) - less critical but should still handle errors

### Detector Strategy
- Pattern: `octokit.<resource>.<method>()` or `instance.<resource>.<method>()`
- Requires: `await` without surrounding `try-catch` block
- Instance detection: Need to track variable assignments from `new Octokit()`

### Coverage
Contract covers most common operations:
- Repository operations (6 methods)
- Git operations (2 methods)
- Pull request operations (3 methods)
- Issue operations (3 methods)
- File operations (2 methods)

### Out of Scope
Not covered in v1.0.0 (may add in future versions):
- Gist operations
- User operations
- Organization operations
- Team operations
- Webhook operations
- Search operations
- Rate limit checking

## Validation Notes

### Fixture Requirements
1. **proper-error-handling.ts**: Demonstrate correct try-catch usage
2. **missing-error-handling.ts**: Show violations (no try-catch)
3. **instance-usage.ts**: Test instance-based detection

### Expected Analyzer Behavior
- Must detect instance methods: `octokit.repos.get()`
- Must detect 2-level property chains: `<instance>.repos.get()`
- Must verify try-catch wrapping
- Must handle both direct imports and instance assignments

## Related Packages
- `@octokit/request-error`: Error class used by @octokit/rest
- `@octokit/plugin-throttling`: Plugin for automatic rate limit handling
- `@octokit/core`: Core Octokit functionality

## Changelog

### v1.0.0 (2026-02-25)
- Initial contract covering 16 common API methods
- Focus on repository, git, pull request, issue, and file operations
- Severity: ERROR for write operations, WARNING for list operations
- Sources: Official docs, real-world usage (backstage), no major CVEs found
