# CHANGELOG — winston

## 2026-06-25 — re-verified clean

- **Latest published:** winston@3.19.0
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-24 — deepen pass — coverage 86% → 90%

- **Profile:** `packages/winston/contract.yaml`
- **Functions added:** cli, exceptions.handle, rejections.handle (3 total)
- **Postconditions added:** 4 (cli-throws-unconditionally; exceptions-handle-installs-process-exit; exception-handler-constructor-requires-logger; rejections-handle-installs-process-exit)
- **Functions intentionally omitted this pass:**
  - Container.add/get/has/close — delegates to createLogger + close, no novel contract
  - transports.Console — writes synchronously to stdout/stderr, no throw contract
  - transports.Stream — delegates to caller-supplied stream
  - handleExceptions/unhandleExceptions — deprecated wrappers around exceptions.handle/unhandle
- **Scanner concerns queued:** 3 (`concern-20260624-winston-deepen-1`, `concern-20260624-winston-deepen-2`, `concern-20260624-winston-deepen-3`)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:**
  - https://github.com/winstonjs/winston/blob/master/lib/winston/logger.js (logger.cli, configure throws)
  - https://github.com/winstonjs/winston/blob/master/lib/winston/exception-handler.js (ExceptionHandler constructor + process.exit timeout)
  - https://github.com/winstonjs/winston/blob/master/lib/winston/rejection-handler.js (RejectionHandler process.exit semantics)
  - https://github.com/winstonjs/winston/blob/master/UPGRADE-3.0.md (v2→v3 migration traps)
  - https://github.com/winstonjs/winston#exceptions
  - https://github.com/winstonjs/winston#rejections
- **Inspected:** winston@3.19.0 declarations (`node_modules/winston/index.d.ts`) and source under `lib/winston/`.
- **Verified by:** bc-deepen-contract pass 56 (deepen-stream-2 on 2026-06-24T06:55:49Z)

## 2026-06-18 — re-verified clean

- **Latest published:** winston@3.19.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** winston@3.19.0
- **Profile semver:** >=3.0.0 <4.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** winston@3.19.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** winston@3.19.0
- **Profile semver:** `>=3.0.0 <4.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** winston@3.19.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** winston@>=3.0.0 <4.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
