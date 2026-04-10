# Sources: @anthropic-ai/sdk Behavioral Contract

**Package:** @anthropic-ai/sdk
**Version:** >=0.18.0 <1.0.0
**Research Date:** 2026-02-24

---

## Official Documentation

### API Error Documentation
- **URL:** https://platform.claude.com/docs/en/api/errors
- **Key Points:**
  - 8 HTTP error codes: 400, 401, 403, 404, 413, 429, 500, 529
  - Error shapes include type, message, and request_id
  - Rate limit errors include retry-after header
  - Streaming can fail mid-response after 200 status
  - Request size limits: 32MB (Messages), 256MB (Batch), 500MB (Files)

### npm Package
- **URL:** https://www.npmjs.com/package/@anthropic-ai/sdk
- **Key Points:**
  - TypeScript definitions included
  - Comprehensive error hierarchy
  - Support for streaming and batch processing
  - MCP (Model Context Protocol) helpers

### GitHub SDK Repository
- **URL:** https://github.com/anthropics/anthropic-sdk-typescript
- **Key Points:**
  - Error classes: APIError, RateLimitError, AuthenticationError
  - ToolError for structured tool error reporting
  - UnsupportedMCPValueError for MCP helpers
  - Streaming cancellation via stream.controller.abort()

---

## HTTP Error Codes

### 400 - invalid_request_error
- **Cause:** Malformed request, missing required fields, invalid parameters
- **Solution:** Validate request structure before sending
- **Example:** Prefill not supported on Opus 4.6, invalid message format

### 401 - authentication_error
- **Cause:** Invalid or missing API key
- **Solution:** Validate ANTHROPIC_API_KEY environment variable
- **Prevention:** Check API key exists before client initialization

### 403 - permission_error
- **Cause:** API key lacks permission for requested resource
- **Solution:** Verify account permissions and model access
- **Prevention:** Use appropriate API key for resource

### 404 - not_found_error
- **Cause:** Requested resource doesn't exist
- **Solution:** Verify resource IDs and model names
- **Example:** Invalid model name, missing batch ID

### 413 - request_too_large
- **Cause:** Request exceeds maximum size (32MB for messages API)
- **Solution:** Split large requests or use Batch API (256MB limit)
- **Prevention:** Validate payload size before sending

### 429 - rate_limit_error
- **Cause:** Exceeded rate limits (RPM, ITPM, OTPM)
- **Solution:** Implement retry with retry-after header
- **Prevention:** Rate limit requests, implement queuing
- **Tiers:**
  - Tier 1: 50 RPM (requires $5 credit)
  - Tier 2: 60 RPM (requires $40)
  - Tier 3: 300 RPM (requires $200)
  - Tier 4: 4000 RPM (requires $400)

### 500 - api_error
- **Cause:** Unexpected internal error on Anthropic's servers
- **Solution:** Retry with exponential backoff
- **Prevention:** Implement robust error handling and retry logic

### 529 - overloaded_error
- **Cause:** API temporarily overloaded (high traffic)
- **Solution:** Implement exponential backoff and retry
- **Prevention:** Gradual traffic ramp-up, avoid sudden spikes

---

## SDK Error Classes

### APIError (Base Class)
```typescript
if (error instanceof Anthropic.APIError) {
  console.error('API Error:', error.message);
  console.error('Status:', error.status);
  console.error('Request ID:', error.headers['request-id']);
}
```

### RateLimitError
```typescript
if (error instanceof Anthropic.RateLimitError) {
  const retryAfter = error.headers['retry-after'];
  console.log(`Rate limited. Retry after ${retryAfter} seconds`);
  // Implement exponential backoff
}
```

### AuthenticationError
```typescript
if (error instanceof Anthropic.AuthenticationError) {
  throw new Error('Invalid ANTHROPIC_API_KEY. Check environment variable.');
}
```

### ToolError
```typescript
import { ToolError } from '@anthropic-ai/sdk/lib/tools/BetaRunnableTool';

// Report tool execution errors to model
throw new ToolError('Invalid input: URL is malformed');

// Include images in error reports
throw new ToolError([
  { type: 'text', text: 'Failed to load page' },
  { type: 'image', source: { type: 'base64', data: screenshot, media_type: 'image/png' } }
]);
```

### UnsupportedMCPValueError
```typescript
import { UnsupportedMCPValueError, mcpResourceToContent } from '@anthropic-ai/sdk/helpers/beta/mcp';

try {
  const content = mcpResourceToContent(resource);
} catch (error) {
  if (error instanceof UnsupportedMCPValueError) {
    console.error('Unsupported MCP value:', error.message);
  }
}
```

---

## Recommended Error Handling Patterns

### Pattern 1: Basic Try-Catch with Type Checking
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

try {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello, Claude' }],
  });
  console.log(message.content);
} catch (error) {
  if (error instanceof Anthropic.APIError) {
    console.error('API Error:', error.status, error.message);
    console.error('Request ID:', error.headers['request-id']);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Pattern 2: Differentiated Error Handling
```typescript
try {
  const message = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Hello' }],
  });
} catch (error) {
  if (error instanceof Anthropic.RateLimitError) {
    // Rate limit - implement retry
    const retryAfter = parseInt(error.headers['retry-after'] || '60');
    console.log(`Rate limited. Retry in ${retryAfter}s`);
    await delay(retryAfter * 1000);
    // Retry request
  } else if (error instanceof Anthropic.AuthenticationError) {
    // Auth error - fix API key
    throw new Error('Invalid API key. Check ANTHROPIC_API_KEY environment variable.');
  } else if (error instanceof Anthropic.APIError) {
    // Server error or other API issue
    if (error.status === 500 || error.status === 529) {
      console.log('Server error. Implementing backoff...');
      // Exponential backoff
    } else {
      console.error('API Error:', error.status, error.message);
    }
  } else {
    throw error;
  }
}
```

### Pattern 3: Streaming with Error Handling
```typescript
try {
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{ role: 'user', content: 'Write a story' }],
  });

  try {
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        process.stdout.write(chunk.delta.text);
      }
    }
  } catch (streamError) {
    console.error('Stream error:', streamError);
    stream.controller.abort();
  } finally {
    // Cleanup
  }
} catch (error) {
  if (error instanceof Anthropic.APIError) {
    console.error('Failed to start stream:', error.status, error.message);
  }
}
```

### Pattern 4: API Key Validation
```typescript
function createAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  return new Anthropic({ apiKey });
}
```

### Pattern 5: Retry with Exponential Backoff
```typescript
async function createMessageWithRetry(
  anthropic: Anthropic,
  params: any,
  maxRetries = 3
) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await anthropic.messages.create(params);
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        const retryAfter = parseInt(error.headers['retry-after'] || '1');
        const backoff = Math.min(retryAfter * 1000, Math.pow(2, retries) * 1000);

        console.log(`Rate limited. Waiting ${backoff}ms before retry ${retries + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        retries++;
      } else if (error instanceof Anthropic.APIError && (error.status === 500 || error.status === 529)) {
        // Server error - exponential backoff
        const backoff = Math.pow(2, retries) * 1000;
        console.log(`Server error. Waiting ${backoff}ms before retry ${retries + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        retries++;
      } else {
        // Non-retryable error
        throw error;
      }
    }
  }

  throw new Error(`Max retries (${maxRetries}) exceeded`);
}
```

---

## CVE & Security Analysis

### CVE-2025-49596 (MCP Inspector, NOT SDK)
- **URL:** https://www.oligo.security/blog/critical-rce-vulnerability-in-anthropic-mcp-inspector-cve-2025-49596
- **CVSS:** 9.4/10.0 (Critical)
- **Affected:** MCP Inspector versions <0.14.1
- **NOT Affected:** @anthropic-ai/sdk package itself
- **Issue:** Remote code execution via unauthenticated MCP proxy requests
- **Fix:** Upgrade MCP Inspector to 0.14.1+
- **Mitigation:** Session tokens and origin checks added

### SQL Injection in SQLite MCP Server
- **URL:** Trend Micro research (unpatched)
- **Affected:** SQLite MCP server component
- **NOT Affected:** @anthropic-ai/sdk package itself
- **Impact:** Malicious prompt injection, data exfiltration

### SDK Security Status
- **@anthropic-ai/sdk:** No direct CVEs reported
- **Status:** Actively maintained by Anthropic
- **Recommendation:** Keep SDK updated, monitor dependencies

---

## Real-World Usage Analysis

### chatbot-ui Repository
- **File:** `app/api/chat/anthropic/route.ts`
- **Usage:** Edge runtime, streaming responses
- **Patterns Observed:**
  - ✅ Uses try-catch blocks
  - ❌ Uses generic `error: any` catches
  - ❌ Doesn't check error types (APIError, RateLimitError)
  - ❌ No retry logic for rate limits
  - ❌ No specific error status checking
  - ❌ Returns generic 500 for all errors

**Violation Example:**
```typescript
// Current (bad) pattern
try {
  const response = await anthropic.messages.create({...});
} catch (error: any) {
  console.error("Error calling Anthropic API:", error);
  return new NextResponse(
    JSON.stringify({ message: "An error occurred" }),
    { status: 500 }
  );
}
```

**Should be:**
```typescript
try {
  const response = await anthropic.messages.create({...});
} catch (error) {
  if (error instanceof Anthropic.RateLimitError) {
    return new NextResponse(
      JSON.stringify({ message: "Rate limit exceeded", retryAfter: error.headers['retry-after'] }),
      { status: 429 }
    );
  } else if (error instanceof Anthropic.AuthenticationError) {
    return new NextResponse(
      JSON.stringify({ message: "Invalid API key" }),
      { status: 401 }
    );
  } else if (error instanceof Anthropic.APIError) {
    return new NextResponse(
      JSON.stringify({ message: error.message, requestId: error.headers['request-id'] }),
      { status: error.status || 500 }
    );
  }
  throw error;
}
```

---

## Testing Strategy

### Test Scenarios
1. Valid message creation (should succeed)
2. Invalid API key (should throw AuthenticationError, 401)
3. Rate limit exceeded (should throw RateLimitError, 429)
4. Request too large (should throw APIError, 413)
5. Server error (should throw APIError, 500)
6. Overloaded API (should throw APIError, 529)
7. Streaming mid-failure (should handle gracefully)

### Fixture Coverage
- **proper-error-handling.ts:** Demonstrates correct try-catch with error type checking
- **missing-error-handling.ts:** No try-catch (should trigger violations)
- **generic-catch.ts:** Try-catch without error type checking (should warn)

---

## References

**Official Documentation:**
- [API Errors](https://platform.claude.com/docs/en/api/errors)
- [Client SDKs](https://platform.claude.com/docs/en/api/client-sdks)
- [Streaming Messages](https://platform.claude.com/docs/en/build-with-claude/streaming)
- [Batch Processing](https://platform.claude.com/docs/en/api/creating-message-batches)

**SDK Repository:**
- [anthropic-sdk-typescript](https://github.com/anthropics/anthropic-sdk-typescript)
- [npm package](https://www.npmjs.com/package/@anthropic-ai/sdk)

**Security:**
- [CVE-2025-49596 Details](https://www.recordedfuture.com/blog/anthropic-mcp-inspector-cve-2025-49596)
- [Claude Code Security](https://thehackernews.com/2026/02/anthropic-launches-claude-code-security.html)

---

## Research Notes

**Completed:** 2026-02-24
**Researcher:** Claude Sonnet 4.5
**Quality:** High - Official documentation and real-world usage reviewed
**Coverage:** Comprehensive - All major error scenarios identified
