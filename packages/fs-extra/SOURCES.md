# fs-extra Contract Sources

## Package

- **npm:** https://www.npmjs.com/package/fs-extra
- **GitHub:** https://github.com/jprichardson/node-fs-extra
- **Version range contracted:** >=9.0.0 <12.0.0

## Official Documentation

- **readJson:** https://github.com/jprichardson/node-fs-extra/blob/master/docs/readJson.md
- **copy:** https://github.com/jprichardson/node-fs-extra/blob/master/docs/copy.md
- **move:** https://github.com/jprichardson/node-fs-extra/blob/master/docs/move.md
- **outputJson:** https://github.com/jprichardson/node-fs-extra/blob/master/docs/outputJson.md
- **ensureDir:** https://github.com/jprichardson/node-fs-extra/blob/master/docs/ensureDir.md

## Error Behavior Evidence

### readJson — ENOENT and SyntaxError

The readJson documentation explicitly states that it reads and parses a JSON file, and will throw
if the file does not exist (ENOENT from the underlying fs.readFile) or if the content is not
valid JSON (SyntaxError from JSON.parse).

Source: https://github.com/jprichardson/node-fs-extra/blob/master/docs/readJson.md

### copy — ENOENT

The copy documentation states that source path must exist; if it does not, an ENOENT error is thrown.
Permission errors (EACCES) are inherited from the underlying fs operations.

Source: https://github.com/jprichardson/node-fs-extra/blob/master/docs/copy.md

### move — ENOENT and dest-already-exists

The move documentation explicitly states that by default (overwrite: false), it will throw if the
destination already exists. The error message is "dest already exists." The source must also exist.

Source: https://github.com/jprichardson/node-fs-extra/blob/master/docs/move.md

## Real-World Usage Evidence

### payload/packages/create-payload-app

Confirmed real-world true positives: `fse.copy()` called without try-catch in CLI project creation.
`fse.readJson()` called WITH try-catch showing developers are aware of JSON parse errors but often
miss the async FS errors in copy/move.

File: `packages/create-payload-app/src/lib/create-project.ts`

## Changelog / Version Notes

- **v9.0.0:** Dropped Node.js 10 support. Added TypeScript types natively.
- **v10.0.0:** Minor updates to graceful-fs dependency.
- **v11.0.0:** Minimum Node.js version bumped to 14.14.
- No breaking changes to error behavior in the 9.x-11.x range.
