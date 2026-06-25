# CHANGELOG — @nestjs/common

## 2026-06-25 — re-verified clean

- **Latest published:** @nestjs/common@11.1.27
- **Profile semver:** >=10.0.0 <12.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% -> 100% (API surface grew from 8 to 9)

- **Profile:** `packages/@nestjs/common/contract.yaml`
- **Mode:** drift-by-staleness re-verification against latest npm publish (oldest `last_deepened` in public-tier index, was 2026-04-17)
- **Package version inspected:** `@nestjs/common@11.1.27` (was 11.1.19 at prior deepen)
- **Functions added:** `StandardSchemaValidationPipe.transform` (1 total)
- **Postconditions added:** 1 (`standard-schema-validation-pipe-validation-error`)
- **Surface drift detected:** new async pipe `StandardSchemaValidationPipe` shipped in `pipes/standard-schema-validation.pipe.js` since prior pass; marked `@publicApi` in JSDoc; accessible via deep import only (`@nestjs/common/pipes/standard-schema-validation.pipe`), not re-exported from `pipes/index.d.ts` as of 11.1.27. Existing 8 pipe transforms still async, ParseDatePipe and DefaultValuePipe still synchronous (sanity-rechecked .d.ts return types).
- **Functions intentionally omitted this pass:** none (re-confirmed prior omissions: ParseDatePipe/DefaultValuePipe sync transforms; decorators; Logger; HttpException constructors)
- **Scanner concerns queued:** 1 (`concern-20260624-nestjs-common-deepen-1` — detection of deep-import `@nestjs/common/pipes/standard-schema-validation.pipe` call site without try-catch)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:** `@nestjs/common@11.1.27` source (`pipes/standard-schema-validation.pipe.{js,d.ts}` — read directly via local install), https://github.com/standard-schema/standard-schema (spec reference)
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 73)

## 2026-06-18 — re-verified clean

- **Latest published:** @nestjs/common@11.1.27
- **Profile semver:** `>=10.0.0 <12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @nestjs/common@11.1.27
- **Profile semver:** >=10.0.0 <12.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @nestjs/common@11.1.27
- **Profile semver:** `>=10.0.0 <12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @nestjs/common@11.1.27
- **Profile semver:** `>=10.0.0 <12.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @nestjs/common@11.1.26
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** @nestjs/common@>=10.0.0 <12.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
