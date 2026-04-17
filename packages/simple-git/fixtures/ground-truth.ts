/**
 * simple-git Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the simple-git contract spec (contract.yaml).
 *
 * Key contract rules:
 *   - git.push(), git.pull(), git.clone(), git.merge() throw GitError / GitResponseError
 *   - git.fetch(), git.commit(), git.checkout(), git.rebase(), git.raw(), git.clean() too
 *   - All async git calls MUST be wrapped in try-catch
 *   - merge() is special: throws GitResponseError<MergeSummary> even when git exits 0
 *   - rebase() throws GitError (not GitResponseError) on conflict — always abort in catch
 *   - clean() requires FORCE or DRY_RUN mode or throws TaskConfigurationError before git runs
 */

import simpleGit, { SimpleGit } from 'simple-git';

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
