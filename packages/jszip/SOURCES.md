# Sources — jszip

**Package:** jszip@3.10.1
**Research Date:** 2026-04-02

## Documentation URLs (All Fetched 2026-04-02)

| URL | Summary |
|-----|---------|
| https://stuk.github.io/jszip/documentation/api_jszip/load_async.html | loadAsync API reference — documented failure conditions |
| https://stuk.github.io/jszip/documentation/api_jszip/generate_async.html | generateAsync API reference — type availability failures |
| https://stuk.github.io/jszip/documentation/howto/read_zip.html | How to read zip files guide |
| https://stuk.github.io/jszip/documentation/howto/write_zip.html | How to write zip files guide |
| https://raw.githubusercontent.com/Stuk/jszip/master/lib/load.js | Source code — exact error messages confirmed |

## Security Advisories

| Advisory | Description |
|----------|-------------|
| https://github.com/advisories/GHSA-36fh-84j7-cv5h | CVE-2022-48285: Path traversal via loadAsync (< 3.8.0) |
| https://github.com/advisories/GHSA-jg8v-48h5-wgxg | CVE-2021-23413: Prototype pollution (< 3.7.0) |

## Real-World Evidence

Real callsites found via corpus grep on 2026-04-02:
- `corpus-builder/active/allweonedev__presentation-ai/src/lib/presentation/pptx-theme-extractor.ts:1044` — `loadAsync` without try-catch
- `corpus-builder/active/VolodymyrBaydalka__docxjs/src/common/open-xml-package.ts:28` — `loadAsync` without try-catch
