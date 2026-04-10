# Sources — handlebars

Last verified: 2026-04-02

## Documentation

| URL | Fetched | Summary |
|-----|---------|---------|
| https://handlebarsjs.com/api-reference/compilation.html | 2026-04-02 | API reference — compile() and precompile() documented; no explicit error docs |
| Package source lib/handlebars/compiler/compiler.js | 2026-04-02 (extracted from v4.7.9 tarball) | Source shows `throw new Exception(...)` for syntax errors, unknown nodes |
| Package source lib/handlebars/runtime.js | 2026-04-02 (extracted from v4.7.9 tarball) | Runtime throws for missing partials, missing helpers, blocked proto access |

## Security History

| CVE | Description | Fixed Version |
|-----|-------------|---------------|
| CVE-2019-19919 | Prototype pollution via compile/render | >=4.3.0 |
| CVE-2021-23369 | RCE via lookup helper in template execution | >=4.7.7 |
| CVE-2019-20920 | Prototype pollution via opt.allowedProtoProperties | >=4.7.1 |

Source: https://security.snyk.io/package/npm/handlebars

Contract semver set to >=4.7.7 (patches all known critical CVEs).

## Real-World Usage

- yamadashy/repomix (⭐ 22k): Uses Handlebars.compile(staticTemplate) without try-catch
- gristlabs/grist-core (⭐ 10k): Uses handlebars.Utils.escapeExpression only
- 99 runtime-dep repos total in corpus
