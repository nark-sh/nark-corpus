# Sources — @google/genai

## Fetched URLs (2026-04-02)

| URL | Summary |
|---|---|
| https://raw.githubusercontent.com/googleapis/js-genai/main/README.md | Main README with error handling examples showing ApiError class |
| https://raw.githubusercontent.com/googleapis/js-genai/main/src/errors.ts | Source for ApiError class — extends Error, has status and message properties |
| https://raw.githubusercontent.com/googleapis/js-genai/main/src/models.ts | Source for all model methods — generateContent, generateContentStream, generateImages, embedContent |
| https://ai.google.dev/api/generate-content | Gemini API generate content reference |

## Key Evidence

1. `ApiError` is the single error type thrown by all `ai.models.*` async methods
2. `ApiError.status` exposes HTTP status code (401, 403, 429, 400, 500, 503)
3. SDK README explicitly shows try-catch pattern for generateContent
4. Real-world usage in cline/cline (59k stars) shows proper ApiError handling with 429 detection
5. Real-world antipattern in CherryHQ/cherry-studio-app: embedContent and models.list() called without try-catch
