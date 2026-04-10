/**
 * Instance Usage for @octokit/rest
 *
 * This fixture tests detection of Octokit usage via instances.
 * Tests various patterns of creating and using Octokit instances.
 */

import { Octokit } from '@octokit/rest';

/**
 * ✅ Instance with proper error handling
 */
class GitHubClient {
  private client: Octokit;

  constructor(token: string) {
    this.client = new Octokit({ auth: token });
  }

  async getRepository(owner: string, repo: string) {
    try {
      const response = await this.client.repos.get({ owner, repo });
      return response.data;
    } catch (error: any) {
      if (error.status === 404) {
        console.error('Repository not found');
      }
      throw error;
    }
  }

  async createIssue(owner: string, repo: string, title: string) {
    try {
      const response = await this.client.issues.create({
        owner,
        repo,
        title
      });
      return response.data;
    } catch (error: any) {
      if (error.status === 410) {
        console.error('Issues disabled for this repo');
      } else if (error.status === 403) {
        console.error('No write access');
      }
      throw error;
    }
  }
}

/**
 * ❌ VIOLATION: Instance with missing error handling
 */
class GitHubClientMissingErrorHandling {
  private client: Octokit;

  constructor(token: string) {
    this.client = new Octokit({ auth: token });
  }

  // Should trigger violation
  async getRepository(owner: string, repo: string) {
    const response = await this.client.repos.get({ owner, repo });
    return response.data;
  }

  // Should trigger violation
  async createPullRequest(owner: string, repo: string, title: string, head: string, base: string) {
    const response = await this.client.pulls.create({
      owner,
      repo,
      title,
      head,
      base
    });
    return response.data;
  }

  // Should trigger violation
  async mergePullRequest(owner: string, repo: string, pullNumber: number) {
    const response = await this.client.pulls.merge({
      owner,
      repo,
      pull_number: pullNumber
    });
    return response.data;
  }
}

/**
 * ✅ Factory function with proper error handling
 */
function createGitHubClient(token: string): Octokit {
  return new Octokit({ auth: token });
}

async function useFactoryWithErrorHandling() {
  const client = createGitHubClient('ghp_token');

  try {
    const repo = await client.repos.get({
      owner: 'octocat',
      repo: 'hello-world'
    });
    return repo.data;
  } catch (error: any) {
    console.error('Failed to get repository:', error.message);
    throw error;
  }
}

/**
 * ❌ VIOLATION: Factory function with missing error handling
 */
async function useFactoryMissingErrorHandling() {
  const client = createGitHubClient('ghp_token');

  // Should trigger violation
  const repo = await client.repos.get({
    owner: 'octocat',
    repo: 'hello-world'
  });
  return repo.data;
}

/**
 * ✅ Instance stored in variable with proper error handling
 */
async function instanceInVariableWithErrorHandling() {
  const github = new Octokit({ auth: 'ghp_token' });

  try {
    const issues = await github.issues.list({
      filter: 'assigned',
      state: 'open'
    });
    return issues.data;
  } catch (error: any) {
    console.error('Failed to list issues:', error.message);
    throw error;
  }
}

/**
 * ❌ VIOLATION: Instance stored in variable with missing error handling
 */
async function instanceInVariableMissingErrorHandling() {
  const github = new Octokit({ auth: 'ghp_token' });

  // Should trigger violation
  const issues = await github.issues.list({
    filter: 'assigned',
    state: 'open'
  });
  return issues.data;
}

/**
 * ✅ Anonymous instance with proper error handling
 */
async function anonymousInstanceWithErrorHandling() {
  try {
    const response = await new Octokit({ auth: 'ghp_token' }).repos.get({
      owner: 'octocat',
      repo: 'hello-world'
    });
    return response.data;
  } catch (error: any) {
    console.error('Failed:', error.message);
    throw error;
  }
}

/**
 * ❌ VIOLATION: Anonymous instance with missing error handling
 */
async function anonymousInstanceMissingErrorHandling() {
  // Should trigger violation
  const response = await new Octokit({ auth: 'ghp_token' }).repos.get({
    owner: 'octocat',
    repo: 'hello-world'
  });
  return response.data;
}

/**
 * ✅ Multiple instances with proper error handling
 */
async function multipleInstancesWithErrorHandling() {
  const client1 = new Octokit({ auth: 'token1' });
  const client2 = new Octokit({ auth: 'token2' });

  try {
    const [repo1, repo2] = await Promise.all([
      client1.repos.get({ owner: 'org1', repo: 'repo1' }),
      client2.repos.get({ owner: 'org2', repo: 'repo2' })
    ]);
    return [repo1.data, repo2.data];
  } catch (error: any) {
    console.error('Failed to fetch repositories:', error.message);
    throw error;
  }
}

/**
 * ❌ VIOLATION: Multiple instances with missing error handling
 */
async function multipleInstancesMissingErrorHandling() {
  const client1 = new Octokit({ auth: 'token1' });
  const client2 = new Octokit({ auth: 'token2' });

  // Should trigger violations
  const repo1 = await client1.repos.get({ owner: 'org1', repo: 'repo1' });
  const repo2 = await client2.repos.get({ owner: 'org2', repo: 'repo2' });

  return [repo1.data, repo2.data];
}

/**
 * ✅ Instance as function parameter with proper error handling
 */
async function processRepository(client: Octokit, owner: string, repo: string) {
  try {
    const repository = await client.repos.get({ owner, repo });

    const issues = await client.issues.listForRepo({
      owner,
      repo,
      state: 'open'
    });

    return {
      repo: repository.data,
      issues: issues.data
    };
  } catch (error: any) {
    console.error('Processing failed:', error.message);
    throw error;
  }
}

/**
 * ❌ VIOLATION: Instance as function parameter with missing error handling
 */
async function processRepositoryMissingErrorHandling(client: Octokit, owner: string, repo: string) {
  // Should trigger violations
  const repository = await client.repos.get({ owner, repo });

  const issues = await client.issues.listForRepo({
    owner,
    repo,
    state: 'open'
  });

  return {
    repo: repository.data,
    issues: issues.data
  };
}

/**
 * ✅ Conditional instance usage with proper error handling
 */
async function conditionalUsageWithErrorHandling(useAuth: boolean) {
  const client = useAuth
    ? new Octokit({ auth: 'ghp_token' })
    : new Octokit();

  try {
    const repo = await client.repos.get({
      owner: 'octocat',
      repo: 'hello-world'
    });
    return repo.data;
  } catch (error: any) {
    if (error.status === 401 && !useAuth) {
      console.error('Authentication required for private repo');
    }
    throw error;
  }
}

/**
 * ❌ VIOLATION: Conditional instance usage with missing error handling
 */
async function conditionalUsageMissingErrorHandling(useAuth: boolean) {
  const client = useAuth
    ? new Octokit({ auth: 'ghp_token' })
    : new Octokit();

  // Should trigger violation
  const repo = await client.repos.get({
    owner: 'octocat',
    repo: 'hello-world'
  });
  return repo.data;
}

/**
 * ✅ Instance with destructuring and proper error handling
 */
async function destructuringWithErrorHandling() {
  const { repos, issues } = new Octokit({ auth: 'ghp_token' });

  try {
    const repoData = await repos.get({
      owner: 'octocat',
      repo: 'hello-world'
    });

    const issueData = await issues.list({
      filter: 'all',
      state: 'open'
    });

    return { repo: repoData.data, issues: issueData.data };
  } catch (error: any) {
    console.error('Failed:', error.message);
    throw error;
  }
}

/**
 * ❌ VIOLATION: Instance with destructuring and missing error handling
 */
async function destructuringMissingErrorHandling() {
  const { repos, issues } = new Octokit({ auth: 'ghp_token' });

  // Should trigger violations
  const repoData = await repos.get({
    owner: 'octocat',
    repo: 'hello-world'
  });

  const issueData = await issues.list({
    filter: 'all',
    state: 'open'
  });

  return { repo: repoData.data, issues: issueData.data };
}

// Export for testing
export {
  GitHubClient,
  GitHubClientMissingErrorHandling,
  createGitHubClient,
  useFactoryWithErrorHandling,
  useFactoryMissingErrorHandling,
  instanceInVariableWithErrorHandling,
  instanceInVariableMissingErrorHandling,
  anonymousInstanceWithErrorHandling,
  anonymousInstanceMissingErrorHandling,
  multipleInstancesWithErrorHandling,
  multipleInstancesMissingErrorHandling,
  processRepository,
  processRepositoryMissingErrorHandling,
  conditionalUsageWithErrorHandling,
  conditionalUsageMissingErrorHandling,
  destructuringWithErrorHandling,
  destructuringMissingErrorHandling
};
