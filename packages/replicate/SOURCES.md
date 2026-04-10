# Sources: replicate

## Official Documentation

- https://github.com/replicate/replicate-javascript — Official JavaScript SDK README (primary reference)
- https://replicate.com/docs/reference/http#create-a-prediction — HTTP API reference for predictions
- https://replicate.com/docs/reference/http#run-a-model — HTTP reference for run endpoint
- https://replicate.com/docs/topics/predictions/create-a-prediction — Prediction lifecycle docs

## Error Handling Evidence

- https://github.com/replicate/replicate-javascript/blob/main/lib/error.ts — Error class definitions
- The SDK throws plain `Error` objects with HTTP status codes on failure
- 401/402/404/422/429 are the primary error codes callers must handle

## Real-World Usage

- https://github.com/nbonami/witsy — witsy (1.9k★) uses `client.run()` without try-catch in image.ts
- https://github.com/steven-tey/extrapolate — extrapolate (695★) wraps `predictions.create()` in try-catch

## Version Notes

- v0.16.0: Added `replicate.run()` convenience method
- v1.x (2024+): Same API surface, additional streaming support
- Contract covers >=0.16.0 (when run() was introduced)
