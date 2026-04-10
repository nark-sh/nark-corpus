/**
 * @notionhq/client Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Annotations are derived from the @notionhq/client contract spec (contract.yaml),
 * NOT from V1 behavior.
 *
 * Key contract rules:
 *   - All Client methods make HTTPS calls — all require try-catch
 *   - databases.query()         → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - pages.create()            → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - pages.update()            → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - blocks.children.append()  → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - search()                  → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - Any of the above inside try-catch → SHOULD_NOT_FIRE
 *   - .catch() chain → SHOULD_NOT_FIRE
 *   - try-finally without catch → SHOULD_FIRE
 *
 * Coverage:
 *   - Section 1:  databases.query() bare → SHOULD_FIRE
 *   - Section 2:  databases.query() in try-catch → SHOULD_NOT_FIRE
 *   - Section 3:  databases.query() with .catch() → SHOULD_NOT_FIRE
 *   - Section 4:  databases.query() try-finally → SHOULD_FIRE
 *   - Section 5:  pages.create() bare → SHOULD_FIRE
 *   - Section 6:  pages.create() in try-catch → SHOULD_NOT_FIRE
 *   - Section 7:  pages.update() bare → SHOULD_FIRE
 *   - Section 8:  pages.update() in try-catch → SHOULD_NOT_FIRE
 *   - Section 9:  blocks.children.append() bare → SHOULD_FIRE
 *   - Section 10: blocks.children.append() in try-catch → SHOULD_NOT_FIRE
 *   - Section 11: search() bare → SHOULD_FIRE
 *   - Section 12: search() in try-catch → SHOULD_NOT_FIRE
 *   - Section 13: class field — databases.query() bare → SHOULD_FIRE
 *   - Section 14: class field — databases.query() in try-catch → SHOULD_NOT_FIRE
 */

import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// ─────────────────────────────────────────────────────────────────────────────
// 1. databases.query() — bare call, no try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareQueryNoCatch(databaseId: string) {
  // SHOULD_FIRE: api-error — databases.query() throws on API/network failure, no try-catch
  const response = await notion.databases.query({ database_id: databaseId });
  return response.results;
}

export async function bareQueryWithFilterNoCatch(databaseId: string) {
  // SHOULD_FIRE: api-error — databases.query() with filter, still no try-catch
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      select: { equals: 'Active' },
    },
  });
  return response.results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. databases.query() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function queryWithTryCatch(databaseId: string) {
  try {
    // SHOULD_NOT_FIRE: api-error — databases.query() inside try-catch satisfies requirement
    const response = await notion.databases.query({ database_id: databaseId });
    return response.results;
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
}

export async function queryWithCatchAndReturn(databaseId: string) {
  try {
    // SHOULD_NOT_FIRE: api-error — wrapped in try-catch with explicit error handling
    const response = await notion.databases.query({ database_id: databaseId });
    return response.results;
  } catch (error) {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. databases.query() — .catch() chain → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function queryWithPromiseCatch(databaseId: string) {
  // SHOULD_NOT_FIRE: api-error — .catch() handles the rejection
  const response = await notion.databases
    .query({ database_id: databaseId })
    .catch((error) => {
      console.error('Query failed:', error);
      return null;
    });
  return response;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. databases.query() — try-finally without catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function queryWithTryFinallyNoCatch(databaseId: string) {
  try {
    // SHOULD_FIRE: api-error — try-finally has no catch clause, error propagates
    const response = await notion.databases.query({ database_id: databaseId });
    return response.results;
  } finally {
    console.log('cleanup');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. pages.create() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareCreatePageNoCatch(databaseId: string, title: string) {
  // SHOULD_FIRE: api-error — pages.create() throws on API/validation failure, no try-catch
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
// 6. pages.create() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function createPageWithTryCatch(databaseId: string, title: string) {
  try {
    // SHOULD_NOT_FIRE: api-error — pages.create() inside try-catch satisfies requirement
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
    console.error('Create failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. pages.update() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareUpdatePageNoCatch(pageId: string) {
  // SHOULD_FIRE: api-error — pages.update() throws on failure, PATCH not auto-retried on 500/503
  await notion.pages.update({
    page_id: pageId,
    properties: {
      Status: { select: { name: 'Done' } },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. pages.update() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function updatePageWithTryCatch(pageId: string) {
  try {
    // SHOULD_NOT_FIRE: api-error — pages.update() inside try-catch satisfies requirement
    await notion.pages.update({
      page_id: pageId,
      properties: {
        Status: { select: { name: 'Done' } },
      },
    });
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. blocks.children.append() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareAppendBlocksNoCatch(pageId: string) {
  // SHOULD_FIRE: api-error — blocks.children.append() throws on failure, no try-catch
  await notion.blocks.children.append({
    block_id: pageId,
    children: [
      {
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: 'content' } }],
        },
      },
    ],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. blocks.children.append() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function appendBlocksWithTryCatch(pageId: string) {
  try {
    // SHOULD_NOT_FIRE: api-error — blocks.children.append() inside try-catch
    await notion.blocks.children.append({
      block_id: pageId,
      children: [
        {
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: 'content' } }],
          },
        },
      ],
    });
  } catch (error) {
    console.error('Append failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. search() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareSearchNoCatch(query: string) {
  // SHOULD_FIRE: api-error — notion.search() throws on API/network failure, no try-catch
  const results = await notion.search({ query });
  return results.results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. search() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function searchWithTryCatch(query: string) {
  try {
    // SHOULD_NOT_FIRE: api-error — notion.search() inside try-catch satisfies requirement
    const results = await notion.search({ query });
    return results.results;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. Class field — databases.query() without try-catch → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

class NotionDataSource {
  private client: Client;

  constructor() {
    this.client = new Client({ auth: process.env.NOTION_TOKEN });
  }

  async fetchRecordsNoCatch(databaseId: string) {
    // SHOULD_FIRE: api-error — this.client.databases.query() without try-catch
    const response = await this.client.databases.query({ database_id: databaseId });
    return response.results;
  }

  async createRecordNoCatch(databaseId: string, title: string) {
    // SHOULD_FIRE: api-error — this.client.pages.create() without try-catch
    const page = await this.client.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [{ type: 'text', text: { content: title } }],
        },
      },
    });
    return page.id;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. Class field — databases.query() with try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

class SafeNotionDataSource {
  private client: Client;

  constructor() {
    this.client = new Client({ auth: process.env.NOTION_TOKEN });
  }

  async fetchRecordsSafely(databaseId: string) {
    try {
      // SHOULD_NOT_FIRE: api-error — this.client.databases.query() inside try-catch
      const response = await this.client.databases.query({ database_id: databaseId });
      return response.results;
    } catch (error) {
      console.error('Fetch failed:', error);
      throw error;
    }
  }
}
