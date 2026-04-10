# @vercel/blob — Sources

## Official Documentation

- [Vercel Blob SDK Usage](https://vercel.com/docs/storage/vercel-blob/using-blob-sdk)
- [Vercel Blob API Reference](https://vercel.com/docs/storage/vercel-blob/api-reference)
- [Vercel Blob Error Reference](https://vercel.com/docs/storage/vercel-blob/api-reference#errors)

## Error Types

| Error Class | Trigger |
|---|---|
| `BlobAccessError` | Missing or invalid `BLOB_READ_WRITE_TOKEN` |
| `BlobUnknownError` | Network failures, Vercel API unavailable |
| `BlobContentTypeNotAllowedError` | Content-type not permitted by store policy |
| `BlobStoreLimitReachedError` | Storage quota exceeded |

All error classes extend `BlobError` which extends `Error`.

## Evidence Quality: partial

Documentation confirms errors are thrown but does not enumerate all edge cases.
All three functions (`put`, `del`, `list`) require `BLOB_READ_WRITE_TOKEN` and will
throw `BlobAccessError` if the env var is missing — very common in dev environments
and CI pipelines that haven't set the token.
