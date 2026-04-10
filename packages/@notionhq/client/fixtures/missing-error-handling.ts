/**
 * @notionhq/client — Missing Error Handling Fixtures
 *
 * All functions in this file demonstrate INCORRECT usage — API calls without
 * proper try-catch. verify-cli should report ERROR violations for each function.
 */

import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// ─────────────────────────────────────────────────────────────────────────────
// 1. databases.query — no try-catch ❌
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Missing error handling — should trigger violation.
 * notion.databases.query() throws on 401/403/404/429/500/503.
 */
export async function queryDatabaseMissingErrorHandling(databaseId: string) {
  // should trigger violation
  const response = await notion.databases.query({ database_id: databaseId });
  return response.results;
}

/**
 * No try-catch in Next.js API route pattern — should trigger violation.
 */
export async function notionApiRoute(databaseId: string) {
  // should trigger violation — unhandled rejection crashes serverless function
  const data = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      select: { equals: 'Active' },
    },
  });
  return data.results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. pages.create — no try-catch ❌
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Missing error handling — should trigger violation.
 * Silent data loss if Notion API is unavailable.
 */
export async function createPageMissingErrorHandling(databaseId: string, title: string) {
  // should trigger violation
  const page = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: [{ type: 'text', text: { content: title } }],
      },
    },
  });
  return page.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. pages.update — no try-catch ❌
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Missing error handling — should trigger violation.
 * PATCH is not auto-retried on 500/503 — error thrown immediately.
 */
export async function updatePageMissingErrorHandling(pageId: string) {
  // should trigger violation
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Status: { select: { name: 'Done' } },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. blocks.children.append — no try-catch ❌
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Missing error handling — should trigger violation.
 */
export async function appendBlocksMissingErrorHandling(pageId: string) {
  // should trigger violation
  await notion.blocks.children.append({
    block_id: pageId,
    children: [
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: 'New content' } }],
        },
      },
    ],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. search — no try-catch ❌
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Missing error handling — should trigger violation.
 */
export async function searchNotionMissingErrorHandling(query: string) {
  // should trigger violation
  const results = await notion.search({ query });
  return results.results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. try-finally without catch — still fires ❌
// ─────────────────────────────────────────────────────────────────────────────

/**
 * try-finally without catch — error still propagates unhandled.
 * Should trigger violation.
 */
export async function queryWithTryFinallyNoCatch(databaseId: string) {
  try {
    // should trigger violation — try-finally has no catch clause
    const response = await notion.databases.query({ database_id: databaseId });
    return response.results;
  } finally {
    console.log('cleanup');
  }
}
