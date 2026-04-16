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

// ── New functions added in depth pass 2026-04-16 ──

/**
 * @expect-violation: search-repos-rate-limit
 * @expect-violation: search-repos-validation-error
 * ❌ VIOLATION: Search repos without try-catch (rate limit + validation error risk)
 */
async function searchReposMissingErrorHandling() {
  const response = await octokit.search.repos({
    q: 'language:typescript stars:>1000',
    sort: 'stars',
    per_page: 100
  });
  return response.data;
}

/**
 * @expect-violation: search-code-auth-required
 * ❌ VIOLATION: Search code without try-catch (auth required, 9/min rate limit)
 */
async function searchCodeMissingErrorHandling() {
  const response = await octokit.search.code({
    q: 'addClass in:file language:js repo:jquery/jquery'
  });
  return response.data;
}

/**
 * @expect-violation: search-issues-rate-limit
 * ❌ VIOLATION: Search issues without try-catch
 */
async function searchIssuesMissingErrorHandling() {
  const response = await octokit.search.issuesAndPullRequests({
    q: 'type:issue state:open label:bug',
    sort: 'created',
    per_page: 50
  });
  return response.data;
}

/**
 * @expect-violation: git-create-commit-not-found
 * ❌ VIOLATION: Create commit without try-catch (409 on non-fast-forward)
 */
async function createCommitMissingErrorHandling() {
  const response = await octokit.git.createCommit({
    owner: 'octocat',
    repo: 'hello-world',
    message: 'automated commit',
    tree: 'abc123treeshaabc123treeshaabc123treeshaa',
    parents: ['abc123parentshaabc123parentshaabc1234ab']
  });
  return response.data;
}

/**
 * @expect-violation: git-create-tree-invalid-sha
 * ❌ VIOLATION: Create tree without try-catch (422 on invalid blob SHAs)
 */
async function createTreeMissingErrorHandling() {
  const response = await octokit.git.createTree({
    owner: 'octocat',
    repo: 'hello-world',
    tree: [
      {
        path: 'README.md',
        mode: '100644',
        type: 'blob',
        sha: 'abc123blobshaabc123blobshaabc123blobsha1'
      }
    ]
  });
  return response.data;
}

/**
 * @expect-violation: git-create-blob-error
 * ❌ VIOLATION: Create blob without try-catch (403/404 on permissions/not found)
 */
async function createBlobMissingErrorHandling() {
  const response = await octokit.git.createBlob({
    owner: 'octocat',
    repo: 'hello-world',
    content: Buffer.from('Hello, World!').toString('base64'),
    encoding: 'base64'
  });
  return response.data;
}

/**
 * @expect-violation: git-update-ref-non-fast-forward
 * ❌ VIOLATION: Update ref without try-catch (422 on non-fast-forward — DATA LOSS risk)
 */
async function updateRefMissingErrorHandling() {
  await octokit.git.updateRef({
    owner: 'octocat',
    repo: 'hello-world',
    ref: 'heads/main',
    sha: 'newcommitshaabc123newcommitshaabc1234567'
  });
}

/**
 * @expect-violation: checks-create-not-github-app
 * ❌ VIOLATION: Create check run without try-catch (403 if not GitHub App)
 */
async function createCheckRunMissingErrorHandling() {
  const response = await octokit.checks.create({
    owner: 'octocat',
    repo: 'hello-world',
    name: 'my-ci',
    head_sha: 'abc123headshaabc123headshaabc123headsha'
  });
  return response.data;
}

/**
 * @expect-violation: checks-update-invalid-transition
 * ❌ VIOLATION: Update check run without try-catch (422 on invalid status)
 */
async function updateCheckRunMissingErrorHandling() {
  const response = await octokit.checks.update({
    owner: 'octocat',
    repo: 'hello-world',
    check_run_id: 12345,
    status: 'completed',
    conclusion: 'success'
  });
  return response.data;
}

/**
 * @expect-violation: workflow-dispatch-no-trigger
 * ❌ VIOLATION: Trigger workflow without try-catch (404 if no workflow_dispatch trigger)
 */
async function triggerWorkflowMissingErrorHandling() {
  await octokit.actions.createWorkflowDispatch({
    owner: 'octocat',
    repo: 'hello-world',
    workflow_id: 'deploy.yml',
    ref: 'main'
  });
}

/**
 * @expect-violation: create-release-tag-not-found
 * ❌ VIOLATION: Create release without try-catch (404/422/rate-limit)
 */
async function createReleaseMissingErrorHandling() {
  const response = await octokit.repos.createRelease({
    owner: 'octocat',
    repo: 'hello-world',
    tag_name: 'v1.0.0',
    name: 'Version 1.0.0',
    body: 'Release notes here'
  });
  return response.data;
}

/**
 * @expect-violation: create-deployment-conflict
 * ❌ VIOLATION: Create deployment without try-catch (409 when status checks fail)
 */
async function createDeploymentMissingErrorHandling() {
  const response = await octokit.repos.createDeployment({
    owner: 'octocat',
    repo: 'hello-world',
    ref: 'main',
    environment: 'production'
  });
  return response.data;
}

/**
 * @expect-violation: create-deployment-status-not-found
 * ❌ VIOLATION: Create deployment status without try-catch (404 if deployment deleted)
 */
async function createDeploymentStatusMissingErrorHandling() {
  const response = await octokit.repos.createDeploymentStatus({
    owner: 'octocat',
    repo: 'hello-world',
    deployment_id: 99999,
    state: 'success'
  });
  return response.data;
}

/**
 * @expect-violation: create-commit-status-not-found
 * ❌ VIOLATION: Create commit status without try-catch (404 on invalid SHA)
 */
async function createCommitStatusMissingErrorHandling() {
  const response = await octokit.repos.createCommitStatus({
    owner: 'octocat',
    repo: 'hello-world',
    sha: 'abc123invalidshaabc123invalidshaabc12345',
    state: 'success',
    context: 'my-ci'
  });
  return response.data;
}

/**
 * @expect-violation: pulls-get-not-found
 * ❌ VIOLATION: Get pull request without try-catch (404 on deleted PR)
 */
async function getPullRequestMissingErrorHandling() {
  const response = await octokit.pulls.get({
    owner: 'octocat',
    repo: 'hello-world',
    pull_number: 42
  });
  return response.data;
}

/**
 * @expect-violation: pulls-request-reviewers-invalid
 * ❌ VIOLATION: Request reviewers without try-catch (422 on non-collaborator)
 */
async function requestReviewersMissingErrorHandling() {
  const response = await octokit.pulls.requestReviewers({
    owner: 'octocat',
    repo: 'hello-world',
    pull_number: 42,
    reviewers: ['non-collaborator-user']
  });
  return response.data;
}

/**
 * @expect-violation: issues-create-comment-not-found
 * ❌ VIOLATION: Create issue comment without try-catch (403 on locked issue)
 */
async function createIssueCommentMissingErrorHandling() {
  const response = await octokit.issues.createComment({
    owner: 'octocat',
    repo: 'hello-world',
    issue_number: 42,
    body: 'Automated comment from bot'
  });
  return response.data;
}

/**
 * @expect-violation: issues-add-labels-not-found
 * ❌ VIOLATION: Add labels without try-catch (404 if label not in repo)
 */
async function addLabelsMissingErrorHandling() {
  const response = await octokit.issues.addLabels({
    owner: 'octocat',
    repo: 'hello-world',
    issue_number: 42,
    labels: ['nonexistent-label', 'another-missing-label']
  });
  return response.data;
}

/**
 * @expect-violation: users-get-authenticated-no-auth
 * ❌ VIOLATION: Get authenticated user without try-catch (401 on invalid token)
 */
async function getAuthenticatedUserMissingErrorHandling() {
  const response = await octokit.users.getAuthenticated();
  return response.data;
}

/**
 * @expect-violation: org-membership-not-found
 * ❌ VIOLATION: Get org membership without try-catch (404 = not a member, not an error)
 */
async function getOrgMembershipMissingErrorHandling() {
  const response = await octokit.orgs.getMembershipForUser({
    org: 'my-organization',
    username: 'some-user'
  });
  return response.data;
}

/**
 * @expect-violation: paginate-rate-limit
 * ❌ VIOLATION: Paginate without try-catch (rate limit mid-pagination for large orgs)
 */
async function paginateMissingErrorHandling() {
  const allRepos = await octokit.paginate(octokit.repos.listForOrg, {
    org: 'large-organization-with-many-repos',
    per_page: 100
  });
  return allRepos;
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
  fireAndForgetMissingErrorHandling,
  // New functions from depth pass 2026-04-16
  searchReposMissingErrorHandling,
  searchCodeMissingErrorHandling,
  searchIssuesMissingErrorHandling,
  createCommitMissingErrorHandling,
  createTreeMissingErrorHandling,
  createBlobMissingErrorHandling,
  updateRefMissingErrorHandling,
  createCheckRunMissingErrorHandling,
  updateCheckRunMissingErrorHandling,
  triggerWorkflowMissingErrorHandling,
  createReleaseMissingErrorHandling,
  createDeploymentMissingErrorHandling,
  createDeploymentStatusMissingErrorHandling,
  createCommitStatusMissingErrorHandling,
  getPullRequestMissingErrorHandling,
  requestReviewersMissingErrorHandling,
  createIssueCommentMissingErrorHandling,
  addLabelsMissingErrorHandling,
  getAuthenticatedUserMissingErrorHandling,
  getOrgMembershipMissingErrorHandling,
  paginateMissingErrorHandling
};
