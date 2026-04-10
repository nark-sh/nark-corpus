# Sources — pdfjs-dist

All URLs fetched on 2026-04-02.

## Package Metadata
- https://www.npmjs.com/package/pdfjs-dist — v5.6.205, ~2.8M weekly downloads
- https://github.com/mozilla/pdf.js — GitHub repository

## Source Code (fetched directly)
- https://raw.githubusercontent.com/mozilla/pdf.js/master/src/shared/util.js — Exception class definitions (PasswordException, InvalidPDFException, ResponseException, FormatError, AbortException)
- https://raw.githubusercontent.com/mozilla/pdf.js/master/src/display/api.js — getDocument() implementation, PDFDocumentLoadingTask

## Security Advisories
- https://github.com/mozilla/pdf.js/security/advisories/GHSA-wgrm-67xf-hhpq — CVE-2024-4367: Arbitrary JS execution via malicious PDF (affects pdfjs-dist <= 4.1.392, patched in 4.2.67)

## Key Findings
- `getDocument().promise` can throw: `InvalidPDFException` (corrupted PDF), `PasswordException` (encrypted), `ResponseException` (HTTP error), `Error` (worker destroyed)
- Real-world antipattern: awaiting `.promise` without try-catch is common (openclaw, open-resume, break-into-data)
- CVE-2024-4367: High severity, patched in 4.2.67+
