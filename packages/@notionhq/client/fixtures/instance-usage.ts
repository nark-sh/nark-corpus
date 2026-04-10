/**
 * @notionhq/client — Instance Usage Fixtures
 *
 * Tests that verify-cli detects violations through instance-based usage.
 * The Client is typically used as a singleton, injected via constructor,
 * or passed as a module-level export.
 */

import { Client } from '@notionhq/client';

// ─────────────────────────────────────────────────────────────────────────────
// Pattern 1: Class with injected Client — no try-catch ❌
// ─────────────────────────────────────────────────────────────────────────────

class NotionRepository {
  private client: Client;

  constructor(auth: string) {
    this.client = new Client({ auth });
  }

  /**
   * No try-catch on instance method — should trigger violation.
   */
  async findByStatus(databaseId: string, status: string) {
    // should trigger violation — this.client.databases.query() throws
    const response = await this.client.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Status',
        select: { equals: status },
      },
    });
    return response.results;
  }

  /**
   * No try-catch on pages.create via instance — should trigger violation.
   */
  async createEntry(databaseId: string, title: string) {
    // should trigger violation
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
// Pattern 2: Class with class-field Client — no try-catch ❌
// ─────────────────────────────────────────────────────────────────────────────

class NotionService {
  private notion = new Client({ auth: process.env.NOTION_TOKEN });

  async syncDatabase(databaseId: string) {
    // should trigger violation — this.notion.databases.query() throws
    const data = await this.notion.databases.query({ database_id: databaseId });
    return data.results;
  }

  async updateStatus(pageId: string, status: string) {
    // should trigger violation
    await this.notion.pages.update({
      page_id: pageId,
      properties: {
        Status: { select: { name: status } },
      },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pattern 3: Class with try-catch — should NOT fire ✅
// ─────────────────────────────────────────────────────────────────────────────

class SafeNotionRepository {
  private client: Client;

  constructor(auth: string) {
    this.client = new Client({ auth });
  }

  async findByStatus(databaseId: string, status: string) {
    try {
      const response = await this.client.databases.query({
        database_id: databaseId,
        filter: {
          property: 'Status',
          select: { equals: status },
        },
      });
      return response.results;
    } catch (error) {
      console.error('Notion query failed:', error);
      throw error;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Pattern 4: Module-level singleton — no try-catch ❌
// ─────────────────────────────────────────────────────────────────────────────

const notionClient = new Client({ auth: process.env.NOTION_TOKEN });

export async function getActiveProjects(databaseId: string) {
  // should trigger violation — module-level client, no try-catch
  const response = await notionClient.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      select: { equals: 'Active' },
    },
  });
  return response.results;
}

export async function addContent(pageId: string, content: string) {
  // should trigger violation
  await notionClient.blocks.children.append({
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
}
