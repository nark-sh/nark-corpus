/**
 * Proper Error Handling for @octokit/rest
 *
 * This fixture demonstrates CORRECT error handling patterns.
 * Should NOT trigger any violations.
 */

import { Octokit } from '@octokit/rest';

// Initialize Octokit instance
const octokit = new Octokit({
  auth: 'ghp_example_token_12345678901234567890'
});

/**
 * Proper: Repository get with try-catch
 */
async function getRepositoryWithErrorHandling() {
  try {
    const response = await octokit.repos.get({
      owner: 'octocat',
      repo: 'hello-world'
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 404) {
      console.error('Repository not found or private');
    } else if (error.status === 403) {
      console.error('Rate limit or permission denied');
    } else if (error.status === 401) {
      console.error('Authentication failed');
    }
    throw error;
  }
}

/**
 * Proper: Create repository with try-catch
 */
async function createRepositoryWithErrorHandling() {
  try {
    const response = await octokit.repos.create({
      name: 'my-new-repo',
      description: 'A test repository',
      private: false
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 422) {
      console.error('Validation error:', error.message);
    } else if (error.status === 403) {
      console.error('Quota or permission issue');
    } else if (error.status === 401) {
      console.error('Authentication failed');
    }
    throw error;
  }
}

/**
 * Proper: Get git reference with try-catch
 */
async function getGitReferenceWithErrorHandling() {
  try {
    const response = await octokit.git.getRef({
      owner: 'octocat',
      repo: 'hello-world',
      ref: 'heads/main'
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 404) {
      console.log('Reference not found');
      return null; // This is often expected behavior
    } else if (error.status === 403) {
      console.error('Access denied or rate limited');
    }
    throw error;
  }
}

/**
 * Proper: Create git reference with try-catch
 */
async function createGitReferenceWithErrorHandling() {
  try {
    const response = await octokit.git.createRef({
      owner: 'octocat',
      repo: 'hello-world',
      ref: 'refs/heads/feature-branch',
      sha: 'abc123def456'
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 422) {
      console.error('Reference already exists or invalid SHA');
    } else if (error.status === 404) {
      console.error('Repository not found');
    } else if (error.status === 403) {
      console.error('No write access');
    }
    throw error;
  }
}

/**
 * Proper: Create pull request with try-catch
 */
async function createPullRequestWithErrorHandling() {
  try {
    const response = await octokit.pulls.create({
      owner: 'octocat',
      repo: 'hello-world',
      title: 'Amazing new feature',
      head: 'feature-branch',
      base: 'main',
      body: 'Please pull these awesome changes'
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 422) {
      if (error.message.includes('No commits between')) {
        console.error('No commits between base and head');
      } else if (error.message.includes('already exists')) {
        console.error('Pull request already exists');
      } else {
        console.error('Validation error:', error.message);
      }
    } else if (error.status === 404) {
      console.error('Repository not found');
    } else if (error.status === 403) {
      console.error('No write access');
    }
    throw error;
  }
}

/**
 * Proper: Merge pull request with try-catch
 */
async function mergePullRequestWithErrorHandling() {
  try {
    const response = await octokit.pulls.merge({
      owner: 'octocat',
      repo: 'hello-world',
      pull_number: 42,
      commit_title: 'Merge feature branch',
      merge_method: 'squash'
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 405) {
      console.error('Pull request not mergeable:', error.message);
      // Could be: has conflicts, checks not passed, already merged
    } else if (error.status === 404) {
      console.error('Pull request not found');
    } else if (error.status === 403) {
      console.error('No write access');
    }
    throw error;
  }
}

/**
 * Proper: Create issue with try-catch
 */
async function createIssueWithErrorHandling() {
  try {
    const response = await octokit.issues.create({
      owner: 'octocat',
      repo: 'hello-world',
      title: 'Found a bug',
      body: 'There is a problem with...',
      labels: ['bug']
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 422) {
      console.error('Validation error:', error.message);
    } else if (error.status === 410) {
      console.error('Issues are disabled for this repository');
    } else if (error.status === 403) {
      console.error('No write access');
    } else if (error.status === 404) {
      console.error('Repository not found');
    }
    throw error;
  }
}

/**
 * Proper: Update issue with try-catch
 */
async function updateIssueWithErrorHandling() {
  try {
    const response = await octokit.issues.update({
      owner: 'octocat',
      repo: 'hello-world',
      issue_number: 42,
      state: 'closed',
      labels: ['fixed']
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 404) {
      console.error('Issue not found');
    } else if (error.status === 403) {
      console.error('Issue is locked or no write access');
    } else if (error.status === 422) {
      console.error('Validation error:', error.message);
    } else if (error.status === 410) {
      console.error('Issues disabled');
    }
    throw error;
  }
}

/**
 * Proper: Create or update file with try-catch
 */
async function updateFileWithErrorHandling() {
  try {
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: 'octocat',
      repo: 'hello-world',
      path: 'README.md',
      message: 'Update README',
      content: Buffer.from('# Hello World').toString('base64'),
      branch: 'main'
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 409) {
      console.error('File SHA conflict - fetch latest SHA and retry');
    } else if (error.status === 404) {
      console.error('Repository or branch not found');
    } else if (error.status === 422) {
      console.error('Validation error:', error.message);
    }
    throw error;
  }
}

/**
 * Proper: Get file content with try-catch
 */
async function getFileContentWithErrorHandling() {
  try {
    const response = await octokit.repos.getContent({
      owner: 'octocat',
      repo: 'hello-world',
      path: 'README.md'
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 404) {
      console.log('File not found');
      return null; // Often expected when checking if file exists
    } else if (error.status === 403) {
      if (error.message && error.message.includes('too large')) {
        console.error('File too large, use git.getBlob() instead');
      } else {
        console.error('Access denied or rate limited');
      }
    }
    throw error;
  }
}

/**
 * Proper: List pull requests with try-catch
 */
async function listPullRequestsWithErrorHandling() {
  try {
    const response = await octokit.pulls.list({
      owner: 'octocat',
      repo: 'hello-world',
      state: 'open',
      per_page: 50
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 404) {
      console.error('Repository not found or private');
    } else if (error.status === 403) {
      console.error('Rate limit or access denied');
    } else if (error.status === 422) {
      console.error('Invalid query parameters');
    }
    throw error;
  }
}

/**
 * Proper: List issues with try-catch
 */
async function listIssuesWithErrorHandling() {
  try {
    const response = await octokit.issues.list({
      filter: 'all',
      state: 'open',
      per_page: 50
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 404) {
      console.error('Not found');
    } else if (error.status === 403) {
      console.error('Rate limit or access denied');
    } else if (error.status === 422) {
      console.error('Invalid filter or sort parameters');
    }
    throw error;
  }
}

/**
 * Proper: Using .catch() instead of try-catch (also valid)
 */
async function getRepositoryWithCatch() {
  return octokit.repos.get({
    owner: 'octocat',
    repo: 'hello-world'
  }).catch((error: any) => {
    if (error.status === 404) {
      console.error('Repository not found');
    } else if (error.status === 403) {
      console.error('Access denied');
    }
    throw error;
  });
}

/**
 * Proper: Chaining multiple operations with error handling
 */
async function createBranchAndPullRequestWithErrorHandling() {
  try {
    // Get default branch ref
    const defaultBranch = await octokit.repos.get({
      owner: 'octocat',
      repo: 'hello-world'
    });

    const baseBranch = defaultBranch.data.default_branch;

    // Get base branch SHA
    const baseRef = await octokit.git.getRef({
      owner: 'octocat',
      repo: 'hello-world',
      ref: `heads/${baseBranch}`
    });

    // Create new branch
    await octokit.git.createRef({
      owner: 'octocat',
      repo: 'hello-world',
      ref: 'refs/heads/new-feature',
      sha: baseRef.data.object.sha
    });

    // Create pull request
    const pr = await octokit.pulls.create({
      owner: 'octocat',
      repo: 'hello-world',
      title: 'New feature',
      head: 'new-feature',
      base: baseBranch
    });

    return pr.data;
  } catch (error: any) {
    // Centralized error handling for the workflow
    console.error('Workflow failed:', error.message);
    throw error;
  }
}

// Export functions for testing
export {
  getRepositoryWithErrorHandling,
  createRepositoryWithErrorHandling,
  getGitReferenceWithErrorHandling,
  createGitReferenceWithErrorHandling,
  createPullRequestWithErrorHandling,
  mergePullRequestWithErrorHandling,
  createIssueWithErrorHandling,
  updateIssueWithErrorHandling,
  updateFileWithErrorHandling,
  getFileContentWithErrorHandling,
  listPullRequestsWithErrorHandling,
  listIssuesWithErrorHandling,
  getRepositoryWithCatch,
  createBranchAndPullRequestWithErrorHandling
};
