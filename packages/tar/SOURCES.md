# Sources — tar

## Documentation

| URL | Fetched | Summary |
|-----|---------|---------|
| https://github.com/isaacs/node-tar#readme | 2026-04-02 | README with full API, error codes, and Warnings & Errors section |

## Package inspection

- Types inspected from `tar@7.5.13` npm package at `/private/tmp/claude/tar-inspect/node_modules/tar/dist/esm/`
- `cwd-error.d.ts`: CwdError class (code: filesystem error, syscall: "chdir")
- `symlink-error.d.ts`: SymlinkError class (code: "TAR_SYMLINK_ERROR", syscall: "symlink")
- `warn-method.d.ts`: TarError type with code, tarCode, recoverable fields
- `make-command.d.ts`: TarCommand type — async file mode returns `Promise<void>`

## Error codes documented in README

From `### Warnings and Errors` section:
- `TAR_ENTRY_INFO` — informative, not an error
- `TAR_ENTRY_INVALID` — invalid entry (checksum, linkpath issues)
- `TAR_ENTRY_ERROR` — unrecoverable fs error during unpack
- `TAR_ENTRY_UNSUPPORTED` — valid but unsupported entry type
- `TAR_ABORT` — zlib decompression error
- `TAR_BAD_ARCHIVE` — completely invalid archive

## CVE History

Historical CVEs in versions < 6.x (path traversal, symlink attacks):
- CVE-2021-32803, CVE-2021-32804 (symlink/hardlink protection)
- CVE-2021-37701, CVE-2021-37712, CVE-2021-37713 (Windows junction bypass)
All fixed in current 7.x release.
