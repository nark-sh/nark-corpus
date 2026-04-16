/**
 * Ground-Truth Fixtures for @octokit/rest — Depth Pass Functions
 *
 * Tests for functions added in the Phase 3 depth pass:
 * pulls.createReview, pulls.submitReview, repos.uploadReleaseAsset,
 * repos.addCollaborator, repos.createWebhook, repos.createFork,
 * git.createTag, git.deleteRef, actions.cancelWorkflowRun, pulls.update
 *
 * VIOLATION cases: should be flagged by scanner
 * CLEAN cases: should NOT be flagged
 */

import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: 'ghp_example_token' });

// ─────────────────────────────────────────────────────────
// pulls.createReview
// ─────────────────────────────────────────────────────────

// @expect-violation: pulls-create-review-no-try-catch
async function createPullRequestReviewMissingErrorHandling() {
  const response = await octokit.pulls.createReview({
    owner: 'octocat',
    repo: 'hello-world',
    pull_number: 42,
    event: 'APPROVE',
    body: 'LGTM',
  });
  return response.data;
}

// @expect-clean
async function createPullRequestReviewWithErrorHandling() {
  try {
    const response = await octokit.pulls.createReview({
      owner: 'octocat',
      repo: 'hello-world',
      pull_number: 42,
      event: 'APPROVE',
      body: 'LGTM',
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 403) throw new Error('Insufficient permissions to create review');
    if (error.status === 422) throw new Error('Invalid review parameters or spam detection');
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// pulls.submitReview
// ─────────────────────────────────────────────────────────

// @expect-violation: pulls-submit-review-wrong-state
async function submitReviewMissingErrorHandling() {
  const response = await octokit.pulls.submitReview({
    owner: 'octocat',
    repo: 'hello-world',
    pull_number: 42,
    review_id: 12345,
    event: 'APPROVE',
  });
  return response.data;
}

// @expect-clean
async function submitReviewWithErrorHandling() {
  try {
    const response = await octokit.pulls.submitReview({
      owner: 'octocat',
      repo: 'hello-world',
      pull_number: 42,
      review_id: 12345,
      event: 'APPROVE',
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 422) throw new Error('Review is not in PENDING state or event parameter invalid');
    if (error.status === 404) throw new Error('Review or PR not found');
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// repos.uploadReleaseAsset
// ─────────────────────────────────────────────────────────

// @expect-violation: release-asset-duplicate-filename
async function uploadReleaseAssetMissingErrorHandling(releaseId: number) {
  const response = await octokit.repos.uploadReleaseAsset({
    owner: 'octocat',
    repo: 'hello-world',
    release_id: releaseId,
    name: 'binary-linux-amd64',
    data: Buffer.from('binary content') as unknown as string,
  });
  return response.data;
}

// @expect-clean
async function uploadReleaseAssetWithErrorHandling(releaseId: number) {
  try {
    const response = await octokit.repos.uploadReleaseAsset({
      owner: 'octocat',
      repo: 'hello-world',
      release_id: releaseId,
      name: 'binary-linux-amd64',
      data: Buffer.from('binary content') as unknown as string,
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 422) throw new Error('Asset with this filename already exists — delete it first');
    if (error.status === 404) throw new Error('Release not found');
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// repos.addCollaborator
// ─────────────────────────────────────────────────────────

// @expect-violation: add-collaborator-emu-account
async function addCollaboratorMissingErrorHandling() {
  const response = await octokit.repos.addCollaborator({
    owner: 'octocat',
    repo: 'hello-world',
    username: 'new-collaborator',
    permission: 'push',
  });
  return response.data;
}

// @expect-clean
async function addCollaboratorWithErrorHandling() {
  try {
    const response = await octokit.repos.addCollaborator({
      owner: 'octocat',
      repo: 'hello-world',
      username: 'new-collaborator',
      permission: 'push',
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 403) throw new Error('Insufficient admin access to repository');
    if (error.status === 422) throw new Error('Validation failed — check EMU constraints or permission level');
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// repos.createWebhook
// ─────────────────────────────────────────────────────────

// @expect-violation: create-webhook-invalid-config
async function createWebhookMissingErrorHandling() {
  const response = await octokit.repos.createWebhook({
    owner: 'octocat',
    repo: 'hello-world',
    config: {
      url: 'https://example.com/webhook',
      content_type: 'json',
      secret: 'my-webhook-secret',
    },
    events: ['push', 'pull_request'],
    active: true,
  });
  return response.data;
}

// @expect-clean
async function createWebhookWithErrorHandling() {
  try {
    const response = await octokit.repos.createWebhook({
      owner: 'octocat',
      repo: 'hello-world',
      config: {
        url: 'https://example.com/webhook',
        content_type: 'json',
        secret: 'my-webhook-secret',
      },
      events: ['push', 'pull_request'],
      active: true,
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 422) throw new Error('Invalid webhook URL or configuration');
    if (error.status === 403) throw new Error('Insufficient permissions — need admin:repo_hook scope');
    if (error.status === 404) throw new Error('Repository not found');
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// repos.createFork
// ─────────────────────────────────────────────────────────

// @expect-violation: create-fork-async-not-awaited
async function createForkMissingErrorHandling() {
  const response = await octokit.repos.createFork({
    owner: 'octocat',
    repo: 'hello-world',
  });
  return response.data;
}

// @expect-clean
async function createForkWithErrorHandling() {
  try {
    const response = await octokit.repos.createFork({
      owner: 'octocat',
      repo: 'hello-world',
    });
    // Note: 202 means accepted, fork is created asynchronously
    // Must poll repos.get() to confirm fork is ready before using
    return response.data;
  } catch (error: any) {
    if (error.status === 403) throw new Error('Cannot fork — forking disabled or insufficient permissions');
    if (error.status === 422) throw new Error('Fork already exists for this user');
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// git.createTag
// ─────────────────────────────────────────────────────────

// @expect-violation: git-create-tag-without-create-ref
async function createTagMissingErrorHandling(sha: string) {
  const response = await octokit.git.createTag({
    owner: 'octocat',
    repo: 'hello-world',
    tag: 'v1.0.0',
    message: 'Release v1.0.0',
    object: sha,
    type: 'commit',
  });
  return response.data;
}

// @expect-clean
async function createTagWithErrorHandling(sha: string) {
  try {
    const tagResponse = await octokit.git.createTag({
      owner: 'octocat',
      repo: 'hello-world',
      tag: 'v1.0.0',
      message: 'Release v1.0.0',
      object: sha,
      type: 'commit',
    });
    // IMPORTANT: createTag alone does NOT make the tag visible
    // Must also create the ref to make the tag appear in the repo
    await octokit.git.createRef({
      owner: 'octocat',
      repo: 'hello-world',
      ref: 'refs/tags/v1.0.0',
      sha: tagResponse.data.sha,
    });
    return tagResponse.data;
  } catch (error: any) {
    if (error.status === 422) throw new Error('Invalid SHA or tag object validation failed');
    if (error.status === 409) throw new Error('Concurrency conflict — retry with backoff');
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// git.deleteRef
// ─────────────────────────────────────────────────────────

// @expect-violation: git-delete-ref-default-branch
async function deleteRefMissingErrorHandling() {
  await octokit.git.deleteRef({
    owner: 'octocat',
    repo: 'hello-world',
    ref: 'heads/feature-branch',
  });
}

// @expect-clean
async function deleteRefWithErrorHandling() {
  try {
    await octokit.git.deleteRef({
      owner: 'octocat',
      repo: 'hello-world',
      ref: 'heads/feature-branch',
    });
  } catch (error: any) {
    if (error.status === 422) throw new Error('Cannot delete ref — may be default branch or invalid format');
    if (error.status === 409) throw new Error('Concurrency conflict deleting ref — retry');
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// actions.cancelWorkflowRun
// ─────────────────────────────────────────────────────────

// @expect-violation: cancel-workflow-run-terminal-state
async function cancelWorkflowRunMissingErrorHandling(runId: number) {
  await octokit.actions.cancelWorkflowRun({
    owner: 'octocat',
    repo: 'hello-world',
    run_id: runId,
  });
}

// @expect-clean
async function cancelWorkflowRunWithErrorHandling(runId: number) {
  try {
    await octokit.actions.cancelWorkflowRun({
      owner: 'octocat',
      repo: 'hello-world',
      run_id: runId,
    });
    // Note: 202 means accepted — poll to confirm run reaches cancelled state
  } catch (error: any) {
    if (error.status === 409) {
      // Workflow is already in a terminal state — treat as success
      return;
    }
    if (error.status === 404) throw new Error('Workflow run not found');
    throw error;
  }
}

// ─────────────────────────────────────────────────────────
// pulls.update
// ─────────────────────────────────────────────────────────

// @expect-violation: pulls-update-invalid-base
async function updatePullRequestMissingErrorHandling() {
  const response = await octokit.pulls.update({
    owner: 'octocat',
    repo: 'hello-world',
    pull_number: 42,
    title: 'Updated PR title',
    body: 'Updated description',
  });
  return response.data;
}

// @expect-clean
async function updatePullRequestWithErrorHandling() {
  try {
    const response = await octokit.pulls.update({
      owner: 'octocat',
      repo: 'hello-world',
      pull_number: 42,
      title: 'Updated PR title',
      body: 'Updated description',
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 422) throw new Error('Invalid base branch or cannot reopen merged PR');
    if (error.status === 403) throw new Error('Insufficient permissions — need pull-requests:write scope');
    throw error;
  }
}
