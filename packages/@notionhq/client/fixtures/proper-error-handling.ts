/**
 * @notionhq/client — Proper Error Handling Fixtures
 *
 * All functions in this file demonstrate CORRECT error handling patterns.
 * verify-cli should report 0 violations for this file.
 */

import { Client, isNotionClientError, APIResponseError, APIErrorCode } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// ─────────────────────────────────────────────────────────────────────────────
// 1. databases.query — wrapped in try-catch ✅
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Proper error handling for databases.query — uses try-catch with typed error handling.
 * Should NOT trigger any violations.
 */
export async function queryDatabaseWithErrorHandling(databaseId: string) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Status',
        select: { equals: 'Active' },
      },
    });
    return response.results;
  } catch (error) {
    if (isNotionClientError(error)) {
      console.error('Notion API error:', error.code, error.message);
    }
    throw error;
  }
}

/**
 * Handles object_not_found specifically — correct pattern for optional DB access.
 */
export async function queryDatabaseHandlingNotFound(databaseId: string) {
  try {
    const response = await notion.databases.query({ database_id: databaseId });
    return response.results;
  } catch (error) {
    if (
      APIResponseError.isAPIResponseError(error) &&
      error.code === APIErrorCode.ObjectNotFound
    ) {
      return null; // Database was deleted or unshared
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. pages.create — wrapped in try-catch ✅
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Proper error handling for pages.create.
 */
export async function createPageWithErrorHandling(databaseId: string, title: string) {
  try {
    const page = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [{ type: 'text', text: { content: title } }],
        },
      },
    });
    return page.id;
  } catch (error) {
    console.error('Failed to create Notion page:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. pages.update — wrapped in try-catch ✅
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Proper error handling for pages.update.
 */
export async function updatePageWithErrorHandling(pageId: string) {
  try {
    await notion.pages.update({
      page_id: pageId,
      properties: {
        Status: { select: { name: 'Done' } },
      },
    });
  } catch (error) {
    console.error('Failed to update Notion page:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. blocks.children.append — wrapped in try-catch ✅
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Proper error handling for blocks.children.append.
 */
export async function appendBlocksWithErrorHandling(pageId: string, content: string) {
  try {
    await notion.blocks.children.append({
      block_id: pageId,
      children: [
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content } }],
          },
        },
      ],
    });
  } catch (error) {
    console.error('Failed to append Notion blocks:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. search — wrapped in try-catch ✅
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Proper error handling for notion.search().
 */
export async function searchNotionWithErrorHandling(query: string) {
  try {
    const results = await notion.search({
      query,
      filter: { value: 'database', property: 'object' },
    });
    return results.results;
  } catch (error) {
    console.error('Notion search failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Promise .catch() chain — also acceptable ✅
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Using .catch() instead of try-catch — also correct.
 */
export async function queryWithPromiseCatch(databaseId: string) {
  const response = await notion.databases
    .query({ database_id: databaseId })
    .catch((error) => {
      console.error('Query failed:', error);
      return null;
    });
  return response;
}
