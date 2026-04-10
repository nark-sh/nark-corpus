# Sources — uploadthing

## Documentation Sources

| URL | Fetched | Summary |
|-----|---------|---------|
| https://docs.uploadthing.com/errors | 2026-04-02 | Error codes: BAD_REQUEST, NOT_FOUND, FORBIDDEN, UPLOAD_FAILED, TOO_LARGE, MISSING_ENV, etc. UploadThingError class. |
| https://docs.uploadthing.com/api-reference/ut-api | 2026-04-02 | UTApi methods: uploadFiles, uploadFilesFromUrl, deleteFiles, getFileUrls, listFiles, renameFiles, getSignedURL, updateACL |

## Key Error Type

`UploadThingError` (from `uploadthing/server` or `@uploadthing/shared`):
- Error codes: `BAD_REQUEST` (400), `NOT_FOUND` (404), `FORBIDDEN` (403), `UPLOAD_FAILED` (500), `TOO_LARGE` (413), `TOO_MANY_FILES` (400), `MISSING_ENV` (500), `FILE_LIMIT_EXCEEDED` (500)
- Has `.cause` property for underlying error

## Real-World Usage

- sadmann7/tablecn: `utapi.deleteFiles()` in `src/app/api/uploadthing/delete/route.ts` — wrapped in try/catch ✅
- sadmann7/skateshop: `uploadFiles()` used via client-side hook
