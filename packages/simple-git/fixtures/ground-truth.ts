/**
 * simple-git Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the simple-git contract spec (contract.yaml).
 *
 * Key contract rules:
 *   - git.push(), git.pull(), git.clone(), git.merge() throw GitError / GitResponseError
 *   - git.fetch(), git.commit(), git.checkout(), git.rebase(), git.raw(), git.clean() too
 *   - git.stash(), git.reset(), git.revert(), git.pushTags(), git.deleteLocalBranch() too
 *   - git.submoduleAdd(), git.submoduleUpdate() too (network calls)
 *   - git.init() throws GitError on permission denied or invalid template directory
 *   - git.checkoutLatestTag() throws GitError when no tags exist (tags.latest===undefined)
 *   - All async git calls MUST be wrapped in try-catch
 *   - merge() is special: throws GitResponseError<MergeSummary> even when git exits 0
 *   - rebase() throws GitError (not GitResponseError) on conflict — always abort in catch
 *   - clean() requires FORCE or DRY_RUN mode or throws TaskConfigurationError before git runs
 *   - deleteLocalBranch() throws GitResponseError<BranchSingleDeleteResult> on unmerged branches
 *   - reset(ResetMode.HARD) is destructive — permanently discards uncommitted changes
 */

import simpleGit, { SimpleGit, ResetMode } from 'simple-git';

// ─────────────────────────────────────────────────────────────────────────────
// 1. push() — bare calls without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function pushNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-push-missing-try-catch — git.push throws GitError, no try-catch
  await git.push('origin', 'main');
}

export async function pushVariantNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-push-missing-try-catch — git.push with options, no try-catch
  await git.push(['--force-with-lease']);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. push() — with try-catch (should not fire)
// ─────────────────────────────────────────────────────────────────────────────

export async function pushWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.push('origin', 'main');
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. pull() — bare calls without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function pullNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-pull-missing-try-catch — git.pull throws GitError, no try-catch
  await git.pull('origin', 'main');
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. pull() — with try-catch (should not fire)
// ─────────────────────────────────────────────────────────────────────────────

export async function pullWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.pull('origin', 'main');
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. clone() — bare calls without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function cloneNoCatch(repoUrl: string, localPath: string) {
  const git = simpleGit();
  // SHOULD_FIRE: simple-git-clone-missing-try-catch — git.clone throws GitError, no try-catch
  await git.clone(repoUrl, localPath);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. clone() — with try-catch (should not fire)
// ─────────────────────────────────────────────────────────────────────────────

export async function cloneWithCatch(repoUrl: string, localPath: string) {
  const git = simpleGit();
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.clone(repoUrl, localPath);
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. merge() — bare calls without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function mergeNoCatch(cwd: string, branch: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-merge-missing-try-catch — git.merge throws even on exit 0, no try-catch
  await git.merge([branch, '--no-edit']);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. merge() — with try-catch (should not fire)
// ─────────────────────────────────────────────────────────────────────────────

export async function mergeWithCatch(cwd: string, branch: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.merge([branch, '--no-edit']);
  } catch (err: any) {
    if (err.git?.conflicts?.length > 0) {
      // git.merge(['--abort']) in catch context — not flagged by scanner
      console.error('Merge conflicts:', err.git.conflicts);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. push() inside a catch {} block — should NOT fire (catch is error context)
// Evidence: concern-2026-04-02-simple-git-catch-block-fp
//           Vinzent03/obsidian-git src/gitManager/simpleGit.ts:1024
// ─────────────────────────────────────────────────────────────────────────────

export async function pushFallbackInCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    await git.pull('origin', 'main');
  } catch (err) {
    // SHOULD_NOT_FIRE: git.push() is a fallback inside a catch block — the enclosing
    // error is already being handled; no separate try-catch required.
    await git.push('origin', 'main');
  }
}

export async function instancePushInCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    await git.pull();
  } catch (err) {
    // SHOULD_NOT_FIRE: catch block is a valid error-handling context for simple-git ops
    await git.push(['--force-with-lease']);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. Instance usage — class with this.git
// ─────────────────────────────────────────────────────────────────────────────

export class GitCli {
  private git: SimpleGit;

  constructor(cwd: string) {
    this.git = simpleGit(cwd);
  }

  async pushNoCatch(branch: string) {
    // SHOULD_FIRE: simple-git-push-missing-try-catch — this.git.push, no try-catch
    return this.git.push('origin', branch);
  }

  async pushWithCatch(branch: string) {
    try {
      // SHOULD_NOT_FIRE: wrapped in try-catch
      return await this.git.push('origin', branch);
    } catch (err) {
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Depth pass 2026-04-16: fetch(), commit(), checkout(), rebase(), raw(), clean()
// ─────────────────────────────────────────────────────────────────────────────

// 12. fetch() — no try-catch
// @expect-violation: simple-git-fetch-missing-try-catch
export async function fetchNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-fetch-missing-try-catch — git.fetch throws GitError on network/auth failure
  await git.fetch('origin', 'main');
}

// @expect-clean
export async function fetchWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.fetch('origin', 'main');
  } catch (err) {
    throw err;
  }
}

// 13. commit() — no try-catch
// @expect-violation: simple-git-commit-missing-try-catch
export async function commitNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-commit-missing-try-catch — fails when nothing staged or no identity
  await git.commit('chore: automated update');
}

// @expect-clean
export async function commitWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    const result = await git.commit('chore: automated update');
    console.log('Committed:', result.commit);
  } catch (err: any) {
    if (err.message?.includes('nothing to commit')) {
      return; // idempotent
    }
    throw err;
  }
}

// 14. checkout() — no try-catch
// @expect-violation: simple-git-checkout-missing-try-catch
export async function checkoutNoCatch(cwd: string, branch: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-checkout-missing-try-catch — fails if dirty or branch not found
  await git.checkout(branch);
}

// @expect-clean
export async function checkoutWithCatch(cwd: string, branch: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.checkout(branch);
  } catch (err) {
    throw err;
  }
}

// 15. rebase() — no try-catch (most dangerous pattern)
// @expect-violation: simple-git-rebase-missing-try-catch
export async function rebaseNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-rebase-missing-try-catch — leaves repo in rebasing state on conflict
  await git.rebase(['origin/main']);
}

// @expect-clean
export async function rebaseWithAbortOnFail(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch with abort
    await git.rebase(['origin/main']);
  } catch (err) {
    try {
      await git.rebase(['--abort']);
    } catch (abortErr) {
      console.error('Rebase abort failed:', abortErr);
    }
    throw err;
  }
}

// 16. raw() — no try-catch
// @expect-violation: simple-git-raw-missing-try-catch
export async function rawNoCatch(cwd: string, commitHash: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-raw-missing-try-catch — cherry-pick can fail with conflicts
  await git.raw(['cherry-pick', commitHash]);
}

// @expect-clean
export async function rawWithCatch(cwd: string, commitHash: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.raw(['cherry-pick', commitHash]);
  } catch (err) {
    throw err;
  }
}

// 17. clean() — no try-catch (also: missing FORCE mode throws TaskConfigurationError)
// NOTE: No @expect-violation annotation — scanner does not yet have a detection rule for clean().
// Violation pattern documented in contract.yaml (simple-git-clean-missing-try-catch).
// Scanner concern queued: concern-20260416-simple-git-deepen-6 (bc-scanner-upgrade to implement)
// SHOULD_FIRE once scanner supports clean() detection: simple-git-clean-missing-try-catch
export async function cleanNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // destructive, deletes untracked files — no try-catch
  await git.clean('f' as any);
}

// @expect-clean
export async function cleanWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch, using proper CleanOptions
    // Note: In production, use CleanOptions.DRY_RUN first to preview
    await git.clean('f');
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Depth pass 2026-04-17: stash(), reset(), revert(), pushTags(),
//   deleteLocalBranch(), submoduleAdd(), submoduleUpdate()
// ─────────────────────────────────────────────────────────────────────────────

// 18. stash() — no try-catch (save variant)
// @expect-violation: simple-git-stash-missing-try-catch
export async function stashNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-stash-missing-try-catch — throws "No local changes to save" on clean tree
  await git.stash();
}

// 18b. stash(['pop']) — no try-catch (most dangerous: can produce conflicts)
// @expect-violation: simple-git-stash-missing-try-catch
export async function stashPopNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-stash-missing-try-catch — stash pop can produce conflicts
  await git.stash(['pop']);
}

// @expect-clean
export async function stashWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.stash();
  } catch (err: any) {
    if (err.message?.includes('No local changes to save')) {
      return; // clean tree, not a fatal error
    }
    throw err;
  }
}

// @expect-clean
export async function stashPopWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch with conflict handling
    await git.stash(['pop']);
  } catch (err: any) {
    if (err.message?.includes('CONFLICT')) {
      console.error('Stash pop produced conflicts:', err.message);
    }
    throw err;
  }
}

// 19. reset() — no try-catch
// @expect-violation: simple-git-reset-missing-try-catch
export async function resetNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-reset-missing-try-catch — throws on bad ref or merge in progress
  await git.reset(ResetMode.HARD);
}

// 19b. reset(ResetMode.SOFT) — no try-catch
// @expect-violation: simple-git-reset-missing-try-catch
export async function resetSoftNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-reset-missing-try-catch — soft reset can also fail (bad ref, empty repo)
  await git.reset(ResetMode.SOFT, ['HEAD~1']);
}

// @expect-clean
export async function resetWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.reset(ResetMode.HARD);
  } catch (err) {
    throw err;
  }
}

// 20. revert() — no try-catch
// @expect-violation: simple-git-revert-missing-try-catch
export async function revertNoCatch(cwd: string, commitHash: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-revert-missing-try-catch — can produce conflicts, leaves reverting state
  await git.revert(commitHash as any);
}

// @expect-clean
export async function revertWithAbortOnFail(cwd: string, commitHash: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch with abort on conflict
    await git.revert(commitHash as any);
  } catch (err: any) {
    if (err.message?.includes('CONFLICT')) {
      try {
        await git.revert(['--abort'] as any);
      } catch (abortErr) {
        console.error('Revert abort failed:', abortErr);
      }
    }
    throw err;
  }
}

// 21. pushTags() — no try-catch
// @expect-violation: simple-git-push-tags-missing-try-catch
export async function pushTagsNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-push-tags-missing-try-catch — network/auth failures like push()
  await git.pushTags('origin');
}

// @expect-clean
export async function pushTagsWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.pushTags('origin');
  } catch (err) {
    throw err;
  }
}

// 22. deleteLocalBranch() — no try-catch
// @expect-violation: simple-git-delete-local-branch-missing-try-catch
export async function deleteLocalBranchNoCatch(cwd: string, branchName: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-delete-local-branch-missing-try-catch
  //   throws GitResponseError<BranchSingleDeleteResult> when branch has unmerged commits
  await git.deleteLocalBranch(branchName);
}

// @expect-clean
export async function deleteLocalBranchWithCatch(cwd: string, branchName: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    const result = await git.deleteLocalBranch(branchName);
    console.log('Deleted branch:', result.branch);
  } catch (err: any) {
    if (err.git) {
      // GitResponseError — unmerged branch
      console.warn('Branch not fully merged:', err.git.branch);
    }
    throw err;
  }
}

// 23. submoduleAdd() — no try-catch
// @expect-violation: simple-git-submodule-add-missing-try-catch
export async function submoduleAddNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-submodule-add-missing-try-catch — network call, auth/URL failures
  await git.submoduleAdd('https://github.com/user/repo.git', 'vendor/repo');
}

// @expect-clean
export async function submoduleAddWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.submoduleAdd('https://github.com/user/repo.git', 'vendor/repo');
    await git.add('.gitmodules');
    await git.commit('Add vendor/repo submodule');
  } catch (err) {
    throw err;
  }
}

// 24. submoduleUpdate() — no try-catch
// @expect-violation: simple-git-submodule-update-missing-try-catch
export async function submoduleUpdateNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-submodule-update-missing-try-catch — fetches submodule remotes
  await git.submoduleUpdate(['--init', '--recursive']);
}

// @expect-clean
export async function submoduleUpdateWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.submoduleUpdate(['--init', '--recursive']);
  } catch (err) {
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Depth pass 2026-06-24 (pass 69): applyPatch(), mirror(), mergeFromTo(),
//   deleteLocalBranches(), checkoutLocalBranch()
// ─────────────────────────────────────────────────────────────────────────────

// 25. applyPatch() — no try-catch
// @expect-violation: simple-git-apply-patch-missing-try-catch
export async function applyPatchNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-apply-patch-missing-try-catch
  await git.applyPatch(['security-fix.patch']);
}

// @expect-clean
export async function applyPatchWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.applyPatch(['security-fix.patch']);
  } catch (err) {
    throw err;
  }
}

// 26. mirror() — no try-catch (backup/replication clone)
// @expect-violation: simple-git-mirror-missing-try-catch
export async function mirrorNoCatch(repoUrl: string, localPath: string) {
  const git = simpleGit();
  // SHOULD_FIRE: simple-git-mirror-missing-try-catch
  await git.mirror(repoUrl, localPath);
}

// @expect-clean
export async function mirrorWithCatch(repoUrl: string, localPath: string) {
  const git = simpleGit();
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.mirror(repoUrl, localPath);
  } catch (err) {
    throw err;
  }
}

// 27. mergeFromTo() — no try-catch (variant of merge)
// @expect-violation: simple-git-merge-from-to-missing-try-catch
export async function mergeFromToNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-merge-from-to-missing-try-catch
  await git.mergeFromTo('origin', 'feature-branch');
}

// @expect-clean
export async function mergeFromToWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch with conflict handling
    await git.mergeFromTo('origin', 'feature-branch');
  } catch (err: any) {
    if (err.git?.conflicts?.length > 0) {
      console.error('Merge conflicts:', err.git.conflicts);
    }
    throw err;
  }
}

// 28. deleteLocalBranches() — no try-catch (bulk delete)
// @expect-violation: simple-git-delete-local-branches-missing-try-catch
export async function deleteLocalBranchesNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-delete-local-branches-missing-try-catch
  await git.deleteLocalBranches(['old-feature-1', 'old-feature-2']);
}

// @expect-clean
export async function deleteLocalBranchesWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch, also checks result.errors
    const result = await git.deleteLocalBranches(['old-feature-1', 'old-feature-2']);
    if (result.errors.length > 0) {
      console.warn('Some branches not deleted:', result.errors);
    }
  } catch (err) {
    throw err;
  }
}

// 29. checkoutLocalBranch() — no try-catch (create + checkout new branch)
// @expect-violation: simple-git-checkout-local-branch-missing-try-catch
export async function checkoutLocalBranchNoCatch(cwd: string, branchName: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-checkout-local-branch-missing-try-catch
  await git.checkoutLocalBranch(branchName);
}

// @expect-clean
export async function checkoutLocalBranchWithCatch(cwd: string, branchName: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch with reuse-on-collision
    await git.checkoutLocalBranch(branchName);
  } catch (err: any) {
    if (err.message?.includes('already exists')) {
      await git.checkout(branchName); // reuse existing
    } else {
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 23. simpleGit() factory — GitConstructError on invalid baseDir
//     NOTE: This is a SYNCHRONOUS throw (not a Promise rejection).
//     The scanner's current await_patterns approach does NOT detect this —
//     see scanner concern concern-20260625-simple-git-deepen-1.
//     These fixtures document the contract for future detection support.
// ─────────────────────────────────────────────────────────────────────────────

import { GitConstructError } from 'simple-git';

export function createGitNoCatch(repoDir: string): void {
  // SHOULD_FIRE: simple-git-construct-missing-try-catch — simpleGit() without try-catch throws GitConstructError synchronously
  const git = simpleGit(repoDir);
}

export async function operateOnGitNoCatch(repoDir: string): Promise<void> {
  // SHOULD_FIRE: simple-git-construct-missing-try-catch — simpleGit() factory called without try-catch inside async function
  const git = simpleGit(repoDir);
  await git.push('origin', 'main');
}

export function createGitWithCatch(repoDir: string): ReturnType<typeof simpleGit> | null {
  // SHOULD_NOT_FIRE: factory wrapped in try-catch — simpleGit() inside try-catch satisfies error handling
  try {
    return simpleGit(repoDir);
  } catch (err) {
    if (err instanceof GitConstructError) {
      console.error(`Git directory not found: ${repoDir}`);
      return null;
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 24. init() — GitError on permission denied or invalid template directory
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: simple-git-init-missing-try-catch
export async function initNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // "fatal: cannot mkdir <path>/.git: Permission denied" when target dir is read-only
  // SHOULD_FIRE: simple-git-init-missing-try-catch — git.init() throws GitError
  await git.init();
}

// @expect-violation: simple-git-init-missing-try-catch
export async function initBareNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-init-missing-try-catch — git.init(true) for bare repo
  await git.init(true);
}

// @expect-violation: simple-git-init-missing-try-catch
export async function initWithTemplateNoCatch(cwd: string, templateDir: string) {
  const git = simpleGit(cwd);
  // "fatal: template directory '<dir>' does not exist or is not a directory"
  // SHOULD_FIRE: simple-git-init-missing-try-catch — template dir may not exist
  await git.init(false, { '--template': templateDir });
}

// @expect-clean
export async function initWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.init();
  } catch (err) {
    console.error('Failed to init git repo:', (err as Error).message);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 25. checkoutLatestTag() — GitError when no tags or pull/checkout fails
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: simple-git-checkout-latest-tag-missing-try-catch
export async function checkoutLatestTagNoCatch(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-checkout-latest-tag-missing-try-catch
  // Composes pull() + tags() + checkout(tags.latest). If no tags exist,
  // tags.latest === undefined and checkout(undefined) throws GitError:
  // "error: pathspec 'undefined' did not match any file(s) known to git"
  await git.checkoutLatestTag();
}

// @expect-clean
export async function checkoutLatestTagWithCatch(cwd: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.checkoutLatestTag();
  } catch (err) {
    console.error('Checkout latest tag failed:', (err as Error).message);
    throw err;
  }
}

// @expect-clean
export async function checkoutLatestTagWithGuard(cwd: string) {
  const git = simpleGit(cwd);
  // SHOULD_NOT_FIRE: explicit tags check before calling checkoutLatestTag
  const tagList = await git.tags();
  if (!tagList.latest) {
    throw new Error('Repository has no tags to check out');
  }
  try {
    await git.checkoutLatestTag();
  } catch (err) {
    throw err;
  }
}

// checkoutBranch tests — postcondition: simple-git-checkout-branch-missing-try-catch
// Distinct from checkoutLocalBranch: validates the startPoint ref exists at call time.
// Most common failure: origin/<branch> pruned after `git fetch --prune`.

export async function checkoutBranchMissingErrorHandling(cwd: string, newBranch: string, baseBranch: string) {
  const git = simpleGit(cwd);
  // SHOULD_FIRE: simple-git-checkout-branch-missing-try-catch
  // startPoint 'origin/baseBranch' may have been pruned (git fetch --prune).
  // Throws: "fatal: 'origin/<branch>' is not a valid object"
  await git.checkoutBranch(newBranch, `origin/${baseBranch}`);
}

// @expect-clean
export async function checkoutBranchWithErrorHandling(cwd: string, newBranch: string, baseBranch: string) {
  const git = simpleGit(cwd);
  try {
    // SHOULD_NOT_FIRE: wrapped in try-catch
    await git.fetch('origin', baseBranch);
    await git.checkoutBranch(newBranch, `origin/${baseBranch}`);
  } catch (err) {
    const message = (err as Error).message || '';
    if (message.includes('not a valid object') || message.includes('did not match any file')) {
      // startPoint ref was pruned or never fetched
      console.error(`startPoint ref missing — fetch first: ${message}`);
    } else if (message.includes('already exists')) {
      // Branch name collision — switch to existing
      await git.checkout(newBranch);
      return;
    }
    throw err;
  }
}
