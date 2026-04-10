# Sources — mammoth

Last verified: 2026-04-02

## Documentation

| URL | Fetched | Summary |
|-----|---------|---------|
| https://raw.githubusercontent.com/mwilliamson/mammoth.js/master/README.md | 2026-04-02 | Official README; shows `.catch()` usage for both convertToHtml and extractRawText; confirms promise rejection on errors |
| https://github.com/mwilliamson/mammoth.js/blob/master/lib/unzip.js | 2026-04-02 | Source confirms `promises.reject(new Error("Could not find file in options"))` for invalid input |

## Security

| CVE | Description | Fixed Version |
|-----|-------------|---------------|
| CVE-2025-11849 | Directory traversal via crafted docx image links | >=1.11.0 |

Source: https://security.snyk.io/vuln/SNYK-JS-MAMMOTH-13554470

## Real-World Usage

- outline/outline (⭐ 37k): Uses `mammoth.convertToHtml({ buffer })` for Word document import
- 55 runtime-dep repos total in corpus
