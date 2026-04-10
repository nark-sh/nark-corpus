/**
 * Ground-truth fixture for @hubspot/api-client
 *
 * Annotations placed DIRECTLY before the violating call site.
 * The line number stored is the line after the annotation comment.
 *
 * Postcondition IDs:
 *   create-no-try-catch   (function: create)
 *   update-no-try-catch   (function: update)
 *   archive-no-try-catch  (function: archive)
 *   dosearch-no-try-catch (function: doSearch)
 *   getbyid-no-try-catch  (function: getById)
 */
import * as hubspot from "@hubspot/api-client";

const client = new hubspot.Client({ accessToken: "token" });

// ──────────────────────────────────────────────────
// 1. create — no try/catch (SHOULD_FIRE)
// ──────────────────────────────────────────────────

async function gt_create_contact_missing() {
  // SHOULD_FIRE: create-no-try-catch — create contact no try-catch
  const c = await client.crm.contacts.basicApi.create({ properties: { email: "x@example.com" } });
  return c.id;
}

// 1. create — with try/catch (SHOULD_NOT_FIRE)
async function gt_create_contact_safe() {
  try {
    // SHOULD_NOT_FIRE: create contact has try-catch
    const c = await client.crm.contacts.basicApi.create({ properties: { email: "x@example.com" } });
    return c.id;
  } catch (e) {
    throw e;
  }
}

async function gt_create_meeting_missing() {
  // SHOULD_FIRE: create-no-try-catch — create meeting no try-catch
  const m = await client.crm.objects.meetings.basicApi.create({
    properties: { hs_meeting_title: "Sync" },
  });
  return m.id;
}

async function gt_create_meeting_safe() {
  try {
    // SHOULD_NOT_FIRE: create meeting has try-catch
    const m = await client.crm.objects.meetings.basicApi.create({
      properties: { hs_meeting_title: "Sync" },
    });
    return m.id;
  } catch (e) {
    throw e;
  }
}

// ──────────────────────────────────────────────────
// 2. update
// ──────────────────────────────────────────────────

async function gt_update_contact_missing() {
  // SHOULD_FIRE: update-no-try-catch — update contact no try-catch
  return await client.crm.contacts.basicApi.update("123", {
    properties: { firstname: "Alice" },
  });
}

async function gt_update_contact_safe() {
  try {
    // SHOULD_NOT_FIRE: update contact has try-catch
    return await client.crm.contacts.basicApi.update("123", {
      properties: { firstname: "Alice" },
    });
  } catch (e) {
    if ((e as any).statusCode === 404) return null;
    throw e;
  }
}

async function gt_update_meeting_missing() {
  // SHOULD_FIRE: update-no-try-catch — update meeting no try-catch
  return client.crm.objects.meetings.basicApi.update("456", {
    properties: { hs_meeting_outcome: "RESCHEDULED" },
  });
}

async function gt_update_meeting_safe() {
  try {
    // SHOULD_NOT_FIRE: update meeting has try-catch
    return await client.crm.objects.meetings.basicApi.update("456", {
      properties: { hs_meeting_outcome: "RESCHEDULED" },
    });
  } catch (e) {
    throw e;
  }
}

// ──────────────────────────────────────────────────
// 3. archive
// ──────────────────────────────────────────────────

async function gt_archive_meeting_missing() {
  // SHOULD_FIRE: archive-no-try-catch — archive meeting no try-catch
  await client.crm.objects.meetings.basicApi.archive("789");
}

async function gt_archive_meeting_safe() {
  try {
    // SHOULD_NOT_FIRE: archive meeting has try-catch
    await client.crm.objects.meetings.basicApi.archive("789");
  } catch (e: any) {
    if (e.statusCode === 404) return;
    throw e;
  }
}

// ──────────────────────────────────────────────────
// 4. doSearch
// ──────────────────────────────────────────────────

async function gt_doSearch_missing() {
  // SHOULD_FIRE: dosearch-no-try-catch — doSearch contacts no try-catch
  const results = await client.crm.contacts.searchApi.doSearch({
    filterGroups: [{ filters: [{ value: "x@y.com", propertyName: "email", operator: "EQ" }] }],
    sorts: [],
    properties: ["email"],
    limit: 10,
    after: 0,
  });
  return results.results;
}

async function gt_doSearch_safe() {
  try {
    // SHOULD_NOT_FIRE: doSearch contacts has try-catch
    const results = await client.crm.contacts.searchApi.doSearch({
      filterGroups: [{ filters: [{ value: "x@y.com", propertyName: "email", operator: "EQ" }] }],
      sorts: [],
      properties: ["email"],
      limit: 10,
      after: 0,
    });
    return results.results;
  } catch (e) {
    return [];
  }
}

// ──────────────────────────────────────────────────
// 5. getById
// ──────────────────────────────────────────────────

async function gt_getById_missing() {
  // SHOULD_FIRE: getbyid-no-try-catch — getById contacts no try-catch
  const contact = await client.crm.contacts.basicApi.getById("100", ["email"]);
  return contact.properties.email;
}

async function gt_getById_safe() {
  try {
    // SHOULD_NOT_FIRE: getById contacts has try-catch
    const contact = await client.crm.contacts.basicApi.getById("100", ["email"]);
    return contact.properties.email;
  } catch (e: any) {
    if (e.statusCode === 404) return null;
    throw e;
  }
}
