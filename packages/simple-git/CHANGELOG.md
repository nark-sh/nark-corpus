# CHANGELOG — simple-git

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-26 — deepen pass — coverage 96% → 100%

- **Profile:** `packages/simple-git/contract.yaml`
- **Functions added:** `checkoutBranch` (1 total)
- **Postconditions added:** 1 (`simple-git-checkout-branch-missing-try-catch`)
- **Key finding:** `checkoutBranch(branchName, startPoint)` was the 26th "worth-contracting" function that had been deferred as "transitively covered" by the `checkout` postcondition. Promoted to its own entry because the startPoint-validation failure is a distinct, common CI/CD production pattern: after `git fetch --prune`, stale remote tracking branches are removed from the local ref database, causing `git.checkoutBranch('feature', 'origin/feature')` to throw "fatal: 'origin/feature' is not a valid object." The required_handling pattern (always `fetch` before `checkoutBranch` when startPoint is a remote tracking ref) is specific to this method signature and not highlighted by the generic checkout postcondition. Source: `dist/cjs/index.js` lines 2067-2071 — `checkoutTask(["-b", branchName, startPoint, ...])` using `straightThroughStringTask`.
- **Functions intentionally omitted this pass:** none (all 24 omissions carried forward)
- **Scanner concerns queued:** 1 (`concern-20260626-simple-git-deepen-1` — verify scanner's checkoutBranch detection coverage)
- **Fixture changes:** `ground-truth.ts` — added section for checkoutBranch with SHOULD_FIRE (missing try-catch on pruned startPoint) and @expect-clean (wrapped with fetch + try-catch)
- **Sources fetched:**
  - `simple-git@3.36.0 dist/cjs/index.js` lines 2067-2071 (checkoutBranch implementation)
  - `https://raw.githubusercontent.com/steveukx/git-js/refs/heads/main/simple-git/readme.md`
  - `https://git-scm.com/docs/git-checkout`
- **Verified by:** bc-deepen-contract deepen-stream-6 pass 1 (2026-06-26T17:21:00Z)

## 2026-06-25 — deepen pass — coverage 88% → 96%

- **Profile:** `packages/simple-git/contract.yaml`
- **Functions added:** `init`, `checkoutLatestTag` (2 total)
- **Postconditions added:** 2 (`simple-git-init-missing-try-catch`, `simple-git-checkout-latest-tag-missing-try-catch`)
- **Key findings:**
  - `init()` throws GitError on permission denied ("fatal: cannot mkdir <path>/.git: Permission denied") and on invalid template directory ("fatal: template directory '<dir>' does not exist or is not a directory"). Source: `initTask` in `dist/cjs/index.js` line 2315 uses `straightThroughStringTask` — no custom `onError`, relies on default GitError.
  - `checkoutLatestTag()` is a legacy callback-style method (not in readme). Composes `pull()` + `tags()` + `checkout(tags.latest)`. When repo has no tags, `tags.latest` is `undefined` — `checkout(undefined)` throws GitError: "error: pathspec 'undefined' did not match any file(s) known to git". Source: `dist/cjs/index.js` line 4412-4420.
- **Functions intentionally omitted this pass:** none (checkoutBranch remains covered transitively)
- **Scanner concerns queued:** none (both functions detected via existing InstanceTrackerPlugin await_patterns)
- **Fixture changes:** `ground-truth.ts` — added sections 24 (init) and 25 (checkoutLatestTag) with @expect-violation and @expect-clean variants
- **Sources fetched:**
  - `simple-git@3.36.0 dist/cjs/index.js` lines 2315 (initTask), 4412-4420 (checkoutLatestTag legacy)
  - `https://github.com/steveukx/git-js/blob/simple-git%403.36.0/simple-git/src/lib/tasks/init.ts`
  - `https://git-scm.com/docs/git-init`
- **Verified by:** bc-deepen-contract (deepen-stream-1 pass 1 on 2026-06-25)


## 2026-06-25 — deepen pass — coverage 85% → 88%

- **Profile:** `packages/simple-git/contract.yaml`
- **Functions added:** `simpleGit` factory — GitConstructError on invalid baseDir (1 total)
- **Postconditions added:** 1 (`simple-git-construct-missing-try-catch`)
- **Functions intentionally omitted this pass:** none
- **Key finding:** Phase 1.5 sweep (pattern 3 — sync-factory-with-error) discovered that the `simpleGit()` factory throws `GitConstructError` SYNCHRONOUSLY when `baseDir` doesn't exist. A prior note in the contract incorrectly stated "errors occur on first async call, not at construction" — this has been corrected.
- **Scanner concerns queued:** 1 (`concern-20260625-simple-git-deepen-1`)
  - New scanner pattern needed: detect `simpleGit(dynamicDir)` factory calls not wrapped in try-catch. The current `await_patterns` approach only catches async call sites — sync factory detection requires a new pattern.
- **Fixture changes:** `ground-truth.ts` — added `createGitNoCatch`, `operateOnGitNoCatch` (NO_DETECTOR_YET), `createGitWithCatch` (clean). `missing-error-handling.ts` — added `createGitWithoutCatch`.
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `simple-git@3.36.0 dist/cjs/index.js` lines 4719-4722 (GitConstructError throw site)
  - `simple-git@3.36.0 dist/src/lib/errors/git-construct-error.d.ts` (JSDoc)
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 70 on 2026-06-25)


## 2026-06-24 — deepen pass — coverage 81% → 85%

- **Profile:** `packages/simple-git/contract.yaml`
- **Functions added:** applyPatch, mirror, mergeFromTo, deleteLocalBranches, checkoutLocalBranch (5 total)
- **Postconditions added:** 5 (one per new function)
- **Functions intentionally omitted this pass:**
  - `checkoutBranch` — thin wrapper over `checkout(['-b', name, startPoint])`; covered transitively by `checkout` + `checkoutLocalBranch`.
  - `checkoutLatestTag` — composes `pull()` + `tags()` + `checkout()`, all already contracted.
  - `init` — rarely error-checked in real corpora; runs in fresh directories by tooling that has already validated permissions.
- **Scanner concerns queued:** 5 (`concern-20260624-simple-git-deepen-14` through `concern-20260624-simple-git-deepen-18`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://raw.githubusercontent.com/steveukx/git-js/refs/heads/main/simple-git/readme.md
  - simple-git@3.36.0 `dist/cjs/index.js` (applyPatchTask L3671, cloneMirrorTask L3456, mergeFromTo L3550, deleteBranchesTask L3854, checkoutLocalBranch L2073)
  - https://git-scm.com/docs/git-apply
  - https://git-scm.com/docs/git-clone
  - https://git-scm.com/docs/git-merge
  - https://git-scm.com/docs/git-branch
  - https://git-scm.com/docs/git-checkout
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T08:55:40Z, deepen-stream-2)

## 2026-06-18 — re-verified clean

- **Latest published:** simple-git@3.36.0
- **Profile semver:** `>=3.32.3` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** simple-git@3.36.0
- **Profile semver:** >=3.32.3 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** simple-git@3.36.0
- **Profile semver:** `>=3.32.3` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** simple-git@3.36.0
- **Profile semver:** `>=3.32.3` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** simple-git@3.36.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** simple-git@>=3.32.3
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
