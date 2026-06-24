# CHANGELOG — simple-git

All notable verification, deepen, and fork events for this profile. Newest first.


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
