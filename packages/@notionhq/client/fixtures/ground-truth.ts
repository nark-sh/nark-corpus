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
 *   - databases.retrieve()      → SHOULD_FIRE if no try-catch (postcondition: databases-retrieve-object-not-found)
 *   - databases.create()        → SHOULD_FIRE if no try-catch (postcondition: databases-create-parent-not-found)
 *   - databases.update()        → SHOULD_FIRE if no try-catch (postcondition: databases-update-schema-too-large)
 *   - pages.create()            → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - pages.update()            → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - pages.retrieve()          → SHOULD_FIRE if no try-catch (postcondition: pages-retrieve-object-not-found)
 *   - blocks.children.append()  → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - blocks.retrieve()         → SHOULD_FIRE if no try-catch (postcondition: blocks-retrieve-object-not-found)
 *   - blocks.delete()           → SHOULD_FIRE if no try-catch (postcondition: blocks-delete-object-not-found)
 *   - search()                  → SHOULD_FIRE if no try-catch (postcondition: api-error)
 *   - comments.create()         → SHOULD_FIRE if no try-catch (postcondition: comments-create-missing-capabilities)
 *   - fileUploads.create()      → SHOULD_FIRE if no try-catch (postcondition: file-uploads-create-id-not-used)
 *   - fileUploads.send()        → SHOULD_FIRE if no try-catch (postcondition: file-uploads-send-no-try-catch)
 *   - fileUploads.complete()    → SHOULD_FIRE if no try-catch (postcondition: file-uploads-complete-no-try-catch)
 *   - oauth.token()             → SHOULD_FIRE if no try-catch (postcondition: oauth-token-invalid-grant)
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
 *   - Section 15: databases.retrieve() bare → SHOULD_FIRE
 *   - Section 16: databases.retrieve() in try-catch → SHOULD_NOT_FIRE
 *   - Section 17: databases.create() bare → SHOULD_FIRE
 *   - Section 18: databases.create() in try-catch → SHOULD_NOT_FIRE
 *   - Section 19: databases.update() bare → SHOULD_FIRE
 *   - Section 20: databases.update() in try-catch → SHOULD_NOT_FIRE
 *   - Section 21: pages.retrieve() bare → SHOULD_FIRE
 *   - Section 22: pages.retrieve() in try-catch → SHOULD_NOT_FIRE
 *   - Section 23: blocks.retrieve() bare → SHOULD_FIRE
 *   - Section 24: blocks.retrieve() in try-catch → SHOULD_NOT_FIRE
 *   - Section 25: blocks.delete() bare → SHOULD_FIRE
 *   - Section 26: blocks.delete() in try-catch → SHOULD_NOT_FIRE
 *   - Section 27: comments.create() bare → SHOULD_FIRE
 *   - Section 28: comments.create() in try-catch → SHOULD_NOT_FIRE
 *   - Section 29: fileUploads.create() bare → SHOULD_FIRE
 *   - Section 30: fileUploads multi-step all wrapped → SHOULD_NOT_FIRE
 *   - Section 31: oauth.token() bare → SHOULD_FIRE
 *   - Section 32: oauth.token() in try-catch → SHOULD_NOT_FIRE
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

// ─────────────────────────────────────────────────────────────────────────────
// 15. databases.retrieve() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareRetrieveDatabaseNoCatch(databaseId: string) {
  // @expect-violation: databases-retrieve-object-not-found
  // SHOULD_FIRE: databases-retrieve-object-not-found — databases.retrieve() throws on 404/403, no try-catch
  const db = await notion.databases.retrieve({ database_id: databaseId });
  return db;
}

// ─────────────────────────────────────────────────────────────────────────────
// 16. databases.retrieve() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function retrieveDatabaseWithTryCatch(databaseId: string) {
  try {
    // @expect-clean
    // SHOULD_NOT_FIRE: databases-retrieve-object-not-found — inside try-catch
    const db = await notion.databases.retrieve({ database_id: databaseId });
    return db;
  } catch (error) {
    console.error('Database retrieve failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 17. databases.create() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareCreateDatabaseNoCatch(pageId: string) {
  // @expect-violation: databases-create-parent-not-found
  // @expect-violation: databases-create-missing-capabilities
  // SHOULD_FIRE: databases-create-parent-not-found — databases.create() throws on parent not found, no try-catch
  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: pageId },
    title: [{ type: 'text', text: { content: 'New Database' } }],
    properties: {
      Name: { title: {} },
    },
  });
  return db.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 18. databases.create() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function createDatabaseWithTryCatch(pageId: string) {
  try {
    // @expect-clean
    // SHOULD_NOT_FIRE: databases-create-parent-not-found — inside try-catch
    const db = await notion.databases.create({
      parent: { type: 'page_id', page_id: pageId },
      title: [{ type: 'text', text: { content: 'New Database' } }],
      properties: {
        Name: { title: {} },
      },
    });
    return db.id;
  } catch (error) {
    console.error('Database create failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 19. databases.update() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareUpdateDatabaseNoCatch(databaseId: string) {
  // @expect-violation: databases-update-schema-too-large
  // @expect-violation: databases-update-not-retried-on-server-error
  // SHOULD_FIRE: databases-update-schema-too-large — databases.update() PATCH not auto-retried, no try-catch
  await notion.databases.update({
    database_id: databaseId,
    title: [{ type: 'text', text: { content: 'Updated Title' } }],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 20. databases.update() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function updateDatabaseWithTryCatch(databaseId: string) {
  try {
    // @expect-clean
    // SHOULD_NOT_FIRE: databases-update-schema-too-large — inside try-catch
    await notion.databases.update({
      database_id: databaseId,
      title: [{ type: 'text', text: { content: 'Updated Title' } }],
    });
  } catch (error) {
    console.error('Database update failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 21. pages.retrieve() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareRetrievePageNoCatch(pageId: string) {
  // @expect-violation: pages-retrieve-object-not-found
  // SHOULD_FIRE: pages-retrieve-object-not-found — pages.retrieve() throws 404/403, no try-catch
  const page = await notion.pages.retrieve({ page_id: pageId });
  return page;
}

// ─────────────────────────────────────────────────────────────────────────────
// 22. pages.retrieve() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function retrievePageWithTryCatch(pageId: string) {
  try {
    // @expect-clean
    // SHOULD_NOT_FIRE: pages-retrieve-object-not-found — inside try-catch
    const page = await notion.pages.retrieve({ page_id: pageId });
    return page;
  } catch (error) {
    console.error('Page retrieve failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 23. blocks.retrieve() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareRetrieveBlockNoCatch(blockId: string) {
  // @expect-violation: blocks-retrieve-object-not-found
  // SHOULD_FIRE: blocks-retrieve-object-not-found — blocks.retrieve() throws 404/403, no try-catch
  const block = await notion.blocks.retrieve({ block_id: blockId });
  return block;
}

// ─────────────────────────────────────────────────────────────────────────────
// 24. blocks.retrieve() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function retrieveBlockWithTryCatch(blockId: string) {
  try {
    // @expect-clean
    // SHOULD_NOT_FIRE: blocks-retrieve-object-not-found — inside try-catch
    const block = await notion.blocks.retrieve({ block_id: blockId });
    return block;
  } catch (error) {
    console.error('Block retrieve failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 25. blocks.delete() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareDeleteBlockNoCatch(blockId: string) {
  // @expect-violation: blocks-delete-object-not-found
  // SHOULD_FIRE: blocks-delete-object-not-found — blocks.delete() throws 404/403, no try-catch
  await notion.blocks.delete({ block_id: blockId });
}

// ─────────────────────────────────────────────────────────────────────────────
// 26. blocks.delete() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteBlockWithTryCatch(blockId: string) {
  try {
    // @expect-clean
    // SHOULD_NOT_FIRE: blocks-delete-object-not-found — inside try-catch
    await notion.blocks.delete({ block_id: blockId });
  } catch (error) {
    // 404 should be treated as success in cleanup operations
    console.error('Block delete failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 27. comments.create() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareCreateCommentNoCatch(pageId: string) {
  // @expect-violation: comments-create-missing-capabilities
  // @expect-violation: comments-create-parent-not-found
  // SHOULD_FIRE: comments-create-missing-capabilities — comments.create() throws on missing capabilities, no try-catch
  await notion.comments.create({
    parent: { page_id: pageId },
    rich_text: [{ type: 'text', text: { content: 'Review complete' } }],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 28. comments.create() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function createCommentWithTryCatch(pageId: string) {
  try {
    // @expect-clean
    // SHOULD_NOT_FIRE: comments-create-missing-capabilities — inside try-catch
    await notion.comments.create({
      parent: { page_id: pageId },
      rich_text: [{ type: 'text', text: { content: 'Review complete' } }],
    });
  } catch (error) {
    console.error('Comment create failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 29. fileUploads.create() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareCreateFileUploadNoCatch(filename: string) {
  // Note: file-uploads-create-id-not-used (response-value check) requires scanner upgrade to detect
  // SHOULD_FIRE: file-uploads-create-filename-too-long — fileUploads.create() throws on filename > 900 bytes, no try-catch
  const upload = await notion.fileUploads.create({ filename, content_type: 'image/png' });
  return upload.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 30. fileUploads multi-step flow — all wrapped → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function uploadFileWithFullErrorHandling(filename: string, fileData: Blob) {
  // @expect-clean
  // SHOULD_NOT_FIRE: all three steps wrapped in try-catch
  let uploadId: string | undefined;
  try {
    const upload = await notion.fileUploads.create({ filename, content_type: 'image/png' });
    uploadId = upload.id;

    await notion.fileUploads.send({
      file_upload_id: uploadId,
      file: { filename, data: fileData },
    });

    const completed = await notion.fileUploads.complete({ file_upload_id: uploadId });
    return completed.id;
  } catch (error) {
    console.error('File upload failed at step:', uploadId ? 'send/complete' : 'create', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 31. oauth.token() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareOAuthTokenNoCatch(code: string) {
  // @expect-violation: oauth-token-invalid-grant
  // @expect-violation: oauth-token-invalid-client
  // SHOULD_FIRE: oauth-token-invalid-grant — oauth.token() throws on expired/invalid code, no try-catch
  const tokenResponse = await notion.oauth.token({
    grant_type: 'authorization_code',
    code,
    redirect_uri: 'https://example.com/oauth/callback',
    client_id: process.env.NOTION_CLIENT_ID!,
    client_secret: process.env.NOTION_CLIENT_SECRET!,
  });
  return tokenResponse.access_token;
}

// ─────────────────────────────────────────────────────────────────────────────
// 32. oauth.token() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function oauthTokenWithTryCatch(code: string) {
  try {
    // @expect-clean
    // SHOULD_NOT_FIRE: oauth-token-invalid-grant — inside try-catch
    const tokenResponse = await notion.oauth.token({
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'https://example.com/oauth/callback',
      client_id: process.env.NOTION_CLIENT_ID!,
      client_secret: process.env.NOTION_CLIENT_SECRET!,
    });
    return tokenResponse.access_token;
  } catch (error) {
    console.error('OAuth token exchange failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 33. dataSources.query() — bare call → SHOULD_FIRE (v5 NEW)
// ─────────────────────────────────────────────────────────────────────────────

export async function bareDataSourceQueryNoCatch(dataSourceId: string) {
  // SHOULD_FIRE: data-sources-query-object-not-found
  const result = await notion.dataSources.query({ data_source_id: dataSourceId });
  return result.results;
}

// ─────────────────────────────────────────────────────────────────────────────
// 34. dataSources.query() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function dataSourceQueryWithTryCatch(dataSourceId: string) {
  try {
    // SHOULD_NOT_FIRE: data-sources-query-object-not-found — inside try-catch
    const result = await notion.dataSources.query({ data_source_id: dataSourceId });
    return result.results;
  } catch (error) {
    console.error('Data source query failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 35. dataSources.create() — bare call → SHOULD_FIRE (v5 NEW)
// ─────────────────────────────────────────────────────────────────────────────

export async function bareDataSourceCreateNoCatch(databaseId: string) {
  // SHOULD_FIRE: data-sources-create-parent-not-found
  const ds = await notion.dataSources.create({
    parent: { type: 'database_id', database_id: databaseId },
    properties: { Name: { title: {} } },
  });
  return ds.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 36. dataSources.create() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function dataSourceCreateWithTryCatch(databaseId: string) {
  try {
    // SHOULD_NOT_FIRE: data-sources-create-parent-not-found — inside try-catch
    const ds = await notion.dataSources.create({
      parent: { type: 'database_id', database_id: databaseId },
      properties: { Name: { title: {} } },
    });
    return ds.id;
  } catch (error) {
    console.error('Data source create failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 37. pages.move() — bare call → SHOULD_FIRE (v5 NEW)
// ─────────────────────────────────────────────────────────────────────────────

export async function barePageMoveNoCatch(pageId: string, targetParentId: string) {
  // SHOULD_FIRE: pages-move-target-not-found
  await notion.pages.move({
    page_id: pageId,
    parent: { type: 'page_id', page_id: targetParentId },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 38. pages.move() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function pageMoveWithTryCatch(pageId: string, targetParentId: string) {
  try {
    // SHOULD_NOT_FIRE: pages-move-target-not-found — inside try-catch
    await notion.pages.move({
      page_id: pageId,
      parent: { type: 'page_id', page_id: targetParentId },
    });
  } catch (error) {
    console.error('Page move failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 39. blocks.update() — bare call → SHOULD_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function bareBlockUpdateNoCatch(blockId: string) {
  // SHOULD_FIRE: blocks-update-object-not-found
  await notion.blocks.update({
    block_id: blockId,
    paragraph: {
      rich_text: [{ type: 'text', text: { content: 'Updated content' } }],
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 40. blocks.update() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function blockUpdateWithTryCatch(blockId: string) {
  try {
    // SHOULD_NOT_FIRE: blocks-update-object-not-found — inside try-catch
    await notion.blocks.update({
      block_id: blockId,
      paragraph: {
        rich_text: [{ type: 'text', text: { content: 'Updated content' } }],
      },
    });
  } catch (error) {
    console.error('Block update failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 41. comments.update() — bare call → SHOULD_FIRE (v5 NEW)
// ─────────────────────────────────────────────────────────────────────────────

export async function bareCommentUpdateNoCatch(commentId: string) {
  // SHOULD_FIRE: comments-update-not-author
  await notion.comments.update({
    comment_id: commentId,
    rich_text: [{ type: 'text', text: { content: 'Edited comment' } }],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 42. comments.update() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function commentUpdateWithTryCatch(commentId: string) {
  try {
    // SHOULD_NOT_FIRE: comments-update-not-author — inside try-catch
    await notion.comments.update({
      comment_id: commentId,
      rich_text: [{ type: 'text', text: { content: 'Edited comment' } }],
    });
  } catch (error) {
    console.error('Comment update failed:', error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 43. comments.delete() — bare call → SHOULD_FIRE (v5 NEW)
// ─────────────────────────────────────────────────────────────────────────────

export async function bareCommentDeleteNoCatch(commentId: string) {
  // SHOULD_FIRE: comments-delete-not-author
  await notion.comments.delete({ comment_id: commentId });
}

// ─────────────────────────────────────────────────────────────────────────────
// 44. comments.delete() — inside try-catch → SHOULD_NOT_FIRE
// ─────────────────────────────────────────────────────────────────────────────

export async function commentDeleteWithTryCatch(commentId: string) {
  try {
    // SHOULD_NOT_FIRE: comments-delete-not-author — inside try-catch
    await notion.comments.delete({ comment_id: commentId });
  } catch (error) {
    console.error('Comment delete failed:', error);
    throw error;
  }
}
