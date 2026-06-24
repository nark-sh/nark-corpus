# CHANGELOG — puppeteer

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 100% → 100% (3 functions added, surface re-baselined for v25.x)

- **Profile:** `packages/puppeteer/contract.yaml`
- **Functions added:** `executablePath`, `defaultArgs`, `trimCache` (3 total)
- **Postconditions added:** 3 (`executablepath-async-rejection`, `defaultargs-async-rejection`, `trimcache-unsupported-platform-error`)
- **Functions intentionally omitted this pass:** unchanged from 2026-04-04 pass (24 methods covered by representative Pareto-equivalents — `$$eval`/`hover`/`tap`/`focus`/`select`/`setViewport`/etc.)
- **Scanner concerns queued:** 1 (`concern-20260623-puppeteer-deepen-1`)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:**
  - https://pptr.dev/api/puppeteer.puppeteernode.executablepath
  - https://pptr.dev/api/puppeteer.puppeteernode.defaultargs
  - https://pptr.dev/api/puppeteer.puppeteernode.trimcache
  - https://github.com/puppeteer/puppeteer/blob/main/packages/puppeteer-core/CHANGELOG.md (v25.0.0 breaking changes)
  - Local inspection of `node_modules/puppeteer/lib/types.d.ts` (puppeteer@25.2.0) and PuppeteerNode source
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 25, 2026-06-24T00:43:23Z)
- **Notes:** Triggered by drift-by-staleness selection — profile had not been deepened since 2026-04-04 yet two major versions (24.x and 25.x) of puppeteer shipped in the intervening 11 weeks. Re-baselined against puppeteer@25.2.0 (current latest). v25.0.0's most important breaking change for the corpus: `executablePath()` and `defaultArgs()` flipped from sync to async (Promise return). Code that previously read the return value directly now silently treats a Promise as the value (Promise spread yields nothing; Promise stringification yields "[object Promise]"). Added both as contracted async functions with `severity: error` and silent-failure business impact. Also added `trimCache()` — was published prior to 2026-04-04 but missed in the original API surface enumeration; it throws on unsupported platform detection and on fs.rm permission errors in containerized cache directories. Coverage stays 100%: contracted count moved from 16 to 19 and total non-omitted moved from 16 to 19 in lockstep. Omission set (24 methods) unchanged — those omissions still hold because their error profiles remain Pareto-identical to contracted methods (`$$eval` ≡ `$eval`, `hover/tap/focus/select` ≡ `click`, `setViewport/emulate/etc.` are configuration with no meaningful contract surface). Added `named_imports: [connect, launch, executablePath, defaultArgs, trimCache]` to detection block — top-level destructured imports like `import { executablePath } from 'puppeteer'` need explicit hooks because there is no qualifying receiver expression. Added 3 await-pattern entries. Bumped `contract_version` 1.1.0 → 1.2.0.


## 2026-06-18 — re-verified clean

- **Latest published:** puppeteer@25.1.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** puppeteer@25.1.0
- **Profile semver:** >=1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** puppeteer@25.1.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** puppeteer@25.1.0
- **Profile semver:** `>=1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** puppeteer@25.1.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-04 — backfilled

- **Verified against:** puppeteer@>=1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
