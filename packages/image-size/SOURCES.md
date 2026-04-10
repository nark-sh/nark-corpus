# Sources — image-size

Last verified: 2026-04-02

## Documentation

| URL | Fetched | Summary |
|-----|---------|---------|
| https://github.com/image-size/image-size (README) | 2026-04-02 (from npm tarball) | README shows imageSize() and imageSizeFromFile() APIs; no error handling docs |
| Package source dist/fromFile.cjs | 2026-04-02 (extracted from v2.0.2 tarball) | Source shows: imageSizeFromFile rejects on file open errors (ENOENT) and on parsing errors; imageSize throws TypeError on unsupported/corrupt formats |

## Real-World Usage

- kamranahmedse/developer-roadmap (⭐ 351k): Uses `imageSize(buffer)` inside try-catch — compliant
- gristlabs/grist-core (⭐ 10k): Uses imageSize callback API inside try-catch — compliant
- 54 runtime-dep repos total in corpus
