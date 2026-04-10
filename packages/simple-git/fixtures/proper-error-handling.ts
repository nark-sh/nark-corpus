/**
 * Proper error handling for simple-git.
 * All git operations are wrapped in try-catch.
 * Should produce 0 violations.
 */
import simpleGit from 'simple-git';

// Proper: push with try-catch
async function pushWithErrorHandling(cwd: string, remote: string, branch: string) {
  const git = simpleGit(cwd);
  try {
    await git.push(remote, branch);
  } catch (err) {
    console.error('Git push failed:', (err as Error).message);
    throw err;
  }
}

// Proper: pull with try-catch
async function pullWithErrorHandling(cwd: string, remote: string, branch: string) {
  const git = simpleGit(cwd);
  try {
    await git.pull(remote, branch);
  } catch (err) {
    console.error('Git pull failed:', (err as Error).message);
    throw err;
  }
}

// Proper: clone with try-catch
async function cloneWithErrorHandling(repoUrl: string, localPath: string) {
  const git = simpleGit();
  try {
    await git.clone(repoUrl, localPath);
  } catch (err) {
    console.error('Git clone failed:', (err as Error).message);
    throw err;
  }
}

// Proper: merge with try-catch and conflict handling
async function mergeWithErrorHandling(cwd: string, sourceBranch: string) {
  const git = simpleGit(cwd);
  try {
    await git.merge([sourceBranch, '--no-edit']);
  } catch (err: any) {
    if (err.git?.conflicts?.length > 0) {
      console.error('Merge conflicts:', err.git.conflicts);
      // Note: git.merge(['--abort']) inside catch is intentional
      // It is itself in an error-handling context
    }
    throw err;
  }
}

export { pushWithErrorHandling, pullWithErrorHandling, cloneWithErrorHandling, mergeWithErrorHandling };
