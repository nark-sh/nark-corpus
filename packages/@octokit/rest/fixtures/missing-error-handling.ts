/**
 * Missing Error Handling for @octokit/rest
 *
 * This fixture demonstrates INCORRECT error handling patterns.
 * Should trigger ERROR violations.
 */

import { Octokit } from '@octokit/rest';

// Initialize Octokit instance
const octokit = new Octokit({
  auth: 'ghp_example_token_12345678901234567890'
});

/**
 * ❌ VIOLATION: Repository get without try-catch
 * Should trigger: github-repo-get-no-try-catch
 */
async function getRepositoryMissingErrorHandling() {
  const response = await octokit.repos.get({
    owner: 'octocat',
    repo: 'hello-world'
  });
  return response.data;
}

/**
 * ❌ VIOLATION: Create repository without try-catch
 * Should trigger: github-repo-create-no-try-catch
 */
async function createRepositoryMissingErrorHandling() {
  const response = await octokit.repos.create({
    name: 'my-new-repo',
    description: 'A test repository',
    private: false
  });
  return response.data;
}

/**
 * ❌ VIOLATION: Update repository without try-catch
 * Should trigger: github-repo-update-no-try-catch
 */
async function updateRepositoryMissingErrorHandling() {
  const response = await octokit.repos.update({
    owner: 'octocat',
    repo: 'hello-world',
    description: 'Updated description',
    private: true
  });
  return response.data;
}

/**
 * ❌ VIOLATION: Delete repository without try-catch
 * Should trigger: github-repo-delete-no-try-catch
 */
async function deleteRepositoryMissingErrorHandling() {
  await octokit.repos.delete({
    owner: 'octocat',
    repo: 'hello-world'
  });
}

/**
 * ❌ VIOLATION: Get git reference without try-catch
 * Should trigger: github-git-getref-no-try-catch
 */
async function getGitReferenceMissingErrorHandling() {
  const response = await octokit.git.getRef({
    owner: 'octocat',
    repo: 'hello-world',
    ref: 'heads/main'
  });
  return response.data;
}

/**
 * ❌ VIOLATION: Create git reference without try-catch
 * Should trigger: github-git-createref-no-try-catch
 */
async function createGitReferenceMissingErrorHandling() {
  const response = await octokit.git.createRef({
    owner: 'octocat',
    repo: 'hello-world',
    ref: 'refs/heads/feature-branch',
    sha: 'abc123def456'
  });
  return response.data;
}

/**
 * ❌ VIOLATION: Create pull request without try-catch
 * Should trigger: github-pull-create-no-try-catch
 */
async function createPullRequestMissingErrorHandling() {
  const response = await octokit.pulls.create({
    owner: 'octocat',
    repo: 'hello-world',
    title: 'Amazing new feature',
    head: 'feature-branch',
    base: 'main',
    body: 'Please pull these awesome changes'
  });
  return response.data;
}

/**
 * ❌ VIOLATION: Merge pull request without try-catch
 * Should trigger: github-pull-merge-no-try-catch
 */
async function mergePullRequestMissingErrorHandling() {
  const response = await octokit.pulls.merge({
    owner: 'octocat',
    repo: 'hello-world',
    pull_number: 42,
    commit_title: 'Merge feature branch',
    merge_method: 'squash'
  });
  return response.data;
}

/**
 * ❌ VIOLATION: List pull requests without try-catch
 * Should trigger: github-pull-list-no-try-catch (warning level)
 */
async function listPullRequestsMissingErrorHandling() {
  const response = await octokit.pulls.list({
    owner: 'octocat',
    repo: 'hello-world',
    state: 'open',
    per_page: 50
  });
  return response.data;
}

/**
 * ❌ VIOLATION: Create issue without try-catch
 * Should trigger: github-issue-create-no-try-catch
 */
async function createIssueMissingErrorHandling() {
  const response = await octokit.issues.create({
    owner: 'octocat',
    repo: 'hello-world',
    title: 'Found a bug',
    body: 'There is a problem with...',
    labels: ['bug']
  });
  return response.data;
}

/**
 * ❌ VIOLATION: Update issue without try-catch
 * Should trigger: github-issue-update-no-try-catch
 */
async function updateIssueMissingErrorHandling() {
  const response = await octokit.issues.update({
    owner: 'octocat',
    repo: 'hello-world',
    issue_number: 42,
    state: 'closed',
    labels: ['fixed']
  });
  return response.data;
}

/**
 * ❌ VIOLATION: List issues without try-catch
 * Should trigger: github-issue-list-no-try-catch (warning level)
 */
async function listIssuesMissingErrorHandling() {
  const response = await octokit.issues.list({
    filter: 'all',
    state: 'open',
    per_page: 50
  });
  return response.data;
}

/**
 * ❌ VIOLATION: Create or update file without try-catch
 * Should trigger: github-file-update-no-try-catch
 */
async function updateFileMissingErrorHandling() {
  const response = await octokit.repos.createOrUpdateFileContents({
    owner: 'octocat',
    repo: 'hello-world',
    path: 'README.md',
    message: 'Update README',
    content: Buffer.from('# Hello World').toString('base64'),
    branch: 'main'
  });
  return response.data;
}

/**
 * ❌ VIOLATION: Get file content without try-catch
 * Should trigger: github-get-content-no-try-catch
 */
async function getFileContentMissingErrorHandling() {
  const response = await octokit.repos.getContent({
    owner: 'octocat',
    repo: 'hello-world',
    path: 'README.md'
  });
  return response.data;
}

/**
 * ❌ VIOLATION: Multiple operations without error handling
 */
async function createBranchAndPullRequestMissingErrorHandling() {
  // All of these should trigger violations
  const defaultBranch = await octokit.repos.get({
    owner: 'octocat',
    repo: 'hello-world'
  });

  const baseRef = await octokit.git.getRef({
    owner: 'octocat',
    repo: 'hello-world',
    ref: `heads/${defaultBranch.data.default_branch}`
  });

  await octokit.git.createRef({
    owner: 'octocat',
    repo: 'hello-world',
    ref: 'refs/heads/new-feature',
    sha: baseRef.data.object.sha
  });

  const pr = await octokit.pulls.create({
    owner: 'octocat',
    repo: 'hello-world',
    title: 'New feature',
    head: 'new-feature',
    base: defaultBranch.data.default_branch
  });

  return pr.data;
}

/**
 * ❌ VIOLATION: Nested async operations without error handling
 */
async function nestedOperationsMissingErrorHandling() {
  const repos = await octokit.repos.listForAuthenticatedUser();

  // Even nested calls should be caught
  for (const repo of repos.data) {
    const issues = await octokit.issues.listForRepo({
      owner: repo.owner.login,
      repo: repo.name
    });

    for (const issue of issues.data) {
      await octokit.issues.update({
        owner: repo.owner.login,
        repo: repo.name,
        issue_number: issue.number,
        labels: ['processed']
      });
    }
  }
}

/**
 * ❌ VIOLATION: Promise chain without .catch()
 */
function promiseChainMissingErrorHandling() {
  return octokit.repos.get({
    owner: 'octocat',
    repo: 'hello-world'
  }).then(response => {
    return response.data;
  });
  // Missing .catch() handler
}

/**
 * ❌ VIOLATION: Fire and forget (no await, no error handling)
 */
function fireAndForgetMissingErrorHandling() {
  // Not awaiting the promise, so error can't be caught
  octokit.issues.create({
    owner: 'octocat',
    repo: 'hello-world',
    title: 'New issue'
  });
}

// Export functions for testing
export {
  getRepositoryMissingErrorHandling,
  createRepositoryMissingErrorHandling,
  updateRepositoryMissingErrorHandling,
  deleteRepositoryMissingErrorHandling,
  getGitReferenceMissingErrorHandling,
  createGitReferenceMissingErrorHandling,
  createPullRequestMissingErrorHandling,
  mergePullRequestMissingErrorHandling,
  listPullRequestsMissingErrorHandling,
  createIssueMissingErrorHandling,
  updateIssueMissingErrorHandling,
  listIssuesMissingErrorHandling,
  updateFileMissingErrorHandling,
  getFileContentMissingErrorHandling,
  createBranchAndPullRequestMissingErrorHandling,
  nestedOperationsMissingErrorHandling,
  promiseChainMissingErrorHandling,
  fireAndForgetMissingErrorHandling
};
