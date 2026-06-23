# CHANGELOG — typescript

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-23 — deepen pass — coverage 70% → 90%

- **Profile:** `packages/typescript/contract.yaml`
- **Functions added:** transform, findConfigFile, getParsedCommandLineOfConfigFile, convertCompilerOptionsFromJson (4 total)
- **Postconditions added:** 7
  - transform: transform-custom-transformer-throws, transform-hooks-set-after-init-throws, transform-result-not-disposed
  - findConfigFile: findconfigfile-undefined-result-not-checked
  - getParsedCommandLineOfConfigFile: getparsedcommandline-undefined-not-checked, getparsedcommandline-host-missing-callback
  - convertCompilerOptionsFromJson: convertcompileroptions-errors-not-checked
- **Functions intentionally omitted this pass:** parseCommandLine (CLI utility, no distinct throw), formatDiagnostics + formatDiagnosticsWithColorAndContext (pure formatters, no I/O), resolveModuleName + nodeModuleNameResolver + resolveTypeReferenceDirective (return `{resolvedModule: undefined}` for misses, no unique throw beyond Debug.fail on unknown moduleResolution), preProcessFile (stateless scan utility, no throw), createIncrementalProgram (same diagnostic model as createProgram), createWatchProgram + createWatchCompilerHost (IDE/watch APIs, no unique error contract)
- **Scanner concerns queued:** 7 (`concern-20260623-typescript-deepen-1` through `concern-20260623-typescript-deepen-7`)
- **Scanner version used:** nark@3.1.0
- **Package version verified:** typescript@6.0.3 (latest)
- **Sources fetched:**
  - https://raw.githubusercontent.com/microsoft/TypeScript-wiki/main/Using-the-Compiler-API.md
  - https://github.com/microsoft/TypeScript/blob/main/src/compiler/transformer.ts
  - https://github.com/microsoft/TypeScript/blob/main/src/compiler/program.ts
  - https://github.com/microsoft/TypeScript/blob/main/src/compiler/commandLineParser.ts
  - node_modules/typescript@6.0.3/lib/typescript.js (lines 154826, 120794, 120841, 126738, 42600, 43815) — direct source inspection
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 11 on 2026-06-23T21:23:17Z)


## 2026-06-18 — re-verified clean

- **Latest published:** typescript@6.0.3
- **Profile semver:** `>=4.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** typescript@6.0.3
- **Profile semver:** >=4.0.0 <7.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** typescript@6.0.3
- **Profile semver:** `>=4.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** typescript@6.0.3
- **Profile semver:** `>=4.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** typescript@6.0.3
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-11 — semver range extended

- **Latest published:** typescript@6.0.3
- **Profile semver:** `>=4.0.0 <6.0.0` → `>=4.0.0 <7.0.0`
- **Verdict:** no error-handling-relevant changes — TypeScript 6 is a stepping-stone release; ts.sys file I/O error behavior (ENOENT, etc.) is stable across 4.x–6.x; compiler API error surfacing unchanged
- **Changelog evidence:** TypeScript 6.0 announcement: "stepping-stone release aligning with upcoming native-speed 7.0" — no changes to ts.sys APIs or Node.js filesystem error propagation
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-18 — backfilled

- **Verified against:** typescript@>=4.0.0 <6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
