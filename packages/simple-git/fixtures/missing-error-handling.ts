/**
 * Missing error handling for simple-git.
 * Git operations are NOT wrapped in try-catch.
 * Should trigger ERROR violations for each unprotected call.
 */
import simpleGit from 'simple-git';

// ❌ Missing try-catch on push
async function pushWithoutErrorHandling(cwd: string, remote: string, branch: string) {
  const git = simpleGit(cwd);
  await git.push(remote, branch); // should trigger violation
}

// ❌ Missing try-catch on pull
async function pullWithoutErrorHandling(cwd: string, remote: string, branch: string) {
  const git = simpleGit(cwd);
  await git.pull(remote, branch); // should trigger violation
}

// ❌ Missing try-catch on clone
async function cloneWithoutErrorHandling(repoUrl: string, localPath: string) {
  const git = simpleGit();
  await git.clone(repoUrl, localPath); // should trigger violation
}

// ❌ Missing try-catch on merge (special case: throws even on git exit 0)
async function mergeWithoutErrorHandling(cwd: string, sourceBranch: string) {
  const git = simpleGit(cwd);
  await git.merge([sourceBranch, '--no-edit']); // should trigger violation
}

export { pushWithoutErrorHandling, pullWithoutErrorHandling, cloneWithoutErrorHandling, mergeWithoutErrorHandling };
