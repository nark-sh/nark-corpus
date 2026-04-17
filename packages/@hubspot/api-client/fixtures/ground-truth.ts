/**
 * Ground-truth fixture for @hubspot/api-client
 *
 * Annotations placed DIRECTLY before the violating call site.
 * The line number stored is the line after the annotation comment.
 *
 * Postcondition IDs:
 *   create-no-try-catch                    (function: create)
 *   update-no-try-catch                    (function: update)
 *   archive-no-try-catch                   (function: archive)
 *   dosearch-no-try-catch                  (function: doSearch)
 *   getbyid-no-try-catch                   (function: getById)
 *   upsert-no-try-catch                    (function: upsert — depth pass 2026-04-16)
 *   upsert-partial-failure-unchecked       (function: upsert — depth pass 2026-04-16)
 *   merge-no-try-catch                     (function: merge — depth pass 2026-04-16)
 *   purge-no-try-catch                     (function: purge — depth pass 2026-04-16)
 *   getall-no-try-catch                    (function: getAll — depth pass 2026-04-16)
 *   batch-create-partial-failure-unchecked (function: batchCreate — depth pass 2026-04-16 stream-2)
 *   batch-create-no-try-catch              (function: batchCreate — depth pass 2026-04-16 stream-2)
 *   batch-update-partial-failure-unchecked (function: batchUpdate — depth pass 2026-04-16 stream-2)
 *   batch-update-no-try-catch              (function: batchUpdate — depth pass 2026-04-16 stream-2)
 *   timeline-create-no-try-catch           (function: timeline.eventsApi.create — depth pass 2026-04-16 stream-2)
 *   oauth-tokens-create-no-try-catch       (function: oauth.tokensApi.create — depth pass 2026-04-16 stream-2)
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

// ──────────────────────────────────────────────────
// 6. upsert (batchApi) — depth pass 2026-04-16
// ──────────────────────────────────────────────────

// @expect-violation: upsert-no-try-catch
// @expect-violation: upsert-partial-failure-unchecked
async function gt_upsert_contacts_missing() {
  // SHOULD_FIRE: upsert-no-try-catch + upsert-partial-failure-unchecked
  // No try-catch AND return value not checked for partial failures (HTTP 207)
  const result = await client.crm.contacts.batchApi.upsert({
    inputs: [{ properties: { email: "a@example.com", firstname: "Alice" }, idProperty: "email" }],
  });
  return result;
}

// @expect-clean
async function gt_upsert_contacts_safe() {
  // SHOULD_NOT_FIRE: try-catch wraps upsert AND partial failures checked
  try {
    const result = await client.crm.contacts.batchApi.upsert({
      inputs: [{ properties: { email: "a@example.com", firstname: "Alice" }, idProperty: "email" }],
    });
    if ("errors" in result && result.errors && result.errors.length > 0) {
      console.error("Partial upsert failures:", result.errors);
    }
    return result;
  } catch (e: any) {
    if (e.code === 429) {
      throw new Error("Rate limit exceeded, retry after backoff");
    }
    throw e;
  }
}

// @expect-violation: upsert-partial-failure-unchecked
async function gt_upsert_companies_missing() {
  // SHOULD_FIRE: upsert-partial-failure-unchecked — company upsert no try-catch
  const result = await client.crm.companies.batchApi.upsert({
    inputs: [{ properties: { name: "Acme Corp", domain: "acme.com" }, idProperty: "domain" }],
  });
  return result;
}

// ──────────────────────────────────────────────────
// 7. merge — depth pass 2026-04-16
// ──────────────────────────────────────────────────

// @expect-violation: merge-no-try-catch
async function gt_merge_contacts_missing() {
  // SHOULD_FIRE: merge-no-try-catch — merge contacts no try-catch
  const merged = await client.crm.contacts.basicApi.merge({
    primaryObjectId: "100",
    objectIdToMerge: "200",
  });
  return merged.id;
}

// @expect-clean
async function gt_merge_contacts_safe() {
  // SHOULD_NOT_FIRE: merge contacts has try-catch
  try {
    const merged = await client.crm.contacts.basicApi.merge({
      primaryObjectId: "100",
      objectIdToMerge: "200",
    });
    return merged.id;
  } catch (e: any) {
    if (e.code === 404) return null;
    if (e.code === 414) throw new Error("Merge history limit exceeded (250+), cannot merge via API");
    throw e;
  }
}

// ──────────────────────────────────────────────────
// 8. purge (GDPR delete) — depth pass 2026-04-16
// ──────────────────────────────────────────────────

// @expect-violation: purge-no-try-catch
async function gt_purge_contact_missing() {
  // SHOULD_FIRE: purge-no-try-catch — GDPR purge no try-catch (legal compliance risk)
  await client.crm.contacts.basicApi.purge({ email: "user@example.com" });
}

// @expect-clean
async function gt_purge_contact_safe() {
  // SHOULD_NOT_FIRE: purge has try-catch with proper compliance handling
  try {
    await client.crm.contacts.basicApi.purge({ email: "user@example.com" });
    console.log("GDPR delete completed successfully");
  } catch (e: any) {
    if (e.code === 403) throw new Error("Missing GDPR delete scope (crm.objects.contacts.sensitive.read)");
    if (e.code === 404) {
      // Contact already deleted — check before reporting success
      console.log("Contact not found, may already be deleted");
      return;
    }
    // Log compliance failure — do NOT silently swallow
    console.error("GDPR delete failed:", e);
    throw e;
  }
}

// ──────────────────────────────────────────────────
// 9. getAll — depth pass 2026-04-16
// ──────────────────────────────────────────────────

// @expect-violation: getall-no-try-catch
async function gt_getAll_contacts_missing() {
  // SHOULD_FIRE: getall-no-try-catch — getAll contacts no try-catch
  const contacts = await client.crm.contacts.getAll();
  return contacts.map((c) => c.properties.email);
}

// @expect-clean
async function gt_getAll_contacts_safe() {
  // SHOULD_NOT_FIRE: getAll has try-catch
  try {
    const contacts = await client.crm.contacts.getAll();
    return contacts.map((c) => c.properties.email);
  } catch (e: any) {
    console.error("Failed to fetch all contacts:", e.message);
    throw e;
  }
}

// ──────────────────────────────────────────────────
// 10. batchCreate — depth pass 2026-04-16 (stream-2)
// ──────────────────────────────────────────────────

// @expect-violation: batch-create-partial-failure-unchecked
// @expect-violation: batch-create-no-try-catch
async function gt_batchCreate_contacts_missing() {
  // SHOULD_FIRE: batch-create-no-try-catch + batch-create-partial-failure-unchecked
  // No try-catch AND result not checked for HTTP 207 partial failures
  const result = await client.crm.contacts.batchApi.create({
    inputs: [
      { properties: { email: "a@example.com", firstname: "Alice" } },
      { properties: { email: "b@example.com", firstname: "Bob" } },
    ],
  });
  return result;
}

// @expect-clean
async function gt_batchCreate_contacts_safe() {
  // SHOULD_NOT_FIRE: try-catch wraps create AND partial failures checked
  try {
    const result = await client.crm.contacts.batchApi.create({
      inputs: [
        { properties: { email: "a@example.com", firstname: "Alice" } },
        { properties: { email: "b@example.com", firstname: "Bob" } },
      ],
    });
    // Check for partial failures (HTTP 207)
    if ("errors" in result && result.errors && result.errors.length > 0) {
      console.error(`Batch create partial failure: ${result.errors.length} records failed`);
      result.errors.forEach((err: any) => console.error("Failed:", err));
    }
    return result;
  } catch (e: any) {
    if (e.code === 429) throw new Error("Rate limit — retry with backoff");
    if (e.code === 423) throw new Error("HubSpot account locked — retry after 2s");
    throw e;
  }
}

// ──────────────────────────────────────────────────
// 11. batchUpdate — depth pass 2026-04-16 (stream-2)
// ──────────────────────────────────────────────────

// @expect-violation: batch-update-partial-failure-unchecked
// @expect-violation: batch-update-no-try-catch
async function gt_batchUpdate_contacts_missing() {
  // SHOULD_FIRE: batch-update-no-try-catch + batch-update-partial-failure-unchecked
  const result = await client.crm.contacts.batchApi.update({
    inputs: [
      { id: "100", properties: { firstname: "Alice Updated" } },
      { id: "200", properties: { firstname: "Bob Updated" } },
    ],
  });
  return result;
}

// @expect-clean
async function gt_batchUpdate_contacts_safe() {
  // SHOULD_NOT_FIRE: try-catch present AND partial failures checked
  try {
    const result = await client.crm.contacts.batchApi.update({
      inputs: [
        { id: "100", properties: { firstname: "Alice Updated" } },
        { id: "200", properties: { firstname: "Bob Updated" } },
      ],
    });
    if ("errors" in result && result.errors && result.errors.length > 0) {
      console.error(`Batch update partial failure: ${result.errors.length} records failed`);
    }
    return result;
  } catch (e: any) {
    if (e.code === 429) throw new Error("Rate limit — retry with backoff");
    throw e;
  }
}

// ──────────────────────────────────────────────────
// 12. timeline.eventsApi.create — depth pass 2026-04-16 (stream-2)
// ──────────────────────────────────────────────────

// @expect-violation: create-no-try-catch
async function gt_timeline_create_missing() {
  // SHOULD_FIRE: create-no-try-catch — eventsApi.create matches create pattern
  // (timeline-create-no-try-catch is a more specific postcondition without scanner rule yet)
  const result = await client.crm.timeline.eventsApi.create({
    eventTemplateId: "template-123",
    objectId: "contact-456",
    tokens: { revenue: "5000" },
  });
  return result;
}

// @expect-clean
async function gt_timeline_create_safe() {
  // SHOULD_NOT_FIRE: eventsApi.create has try-catch with proper auth check
  try {
    const result = await client.crm.timeline.eventsApi.create({
      eventTemplateId: "template-123",
      objectId: "contact-456",
      tokens: { revenue: "5000" },
    });
    return result;
  } catch (e: any) {
    if (e.code === 403) throw new Error("Timeline events require OAuth token, not API key");
    if (e.code === 404) throw new Error("eventTemplateId or target CRM record not found");
    if (e.code === 400) throw new Error("Invalid event tokens or body size exceeded");
    throw e;
  }
}

// ──────────────────────────────────────────────────
// 13. oauth.tokensApi.create — depth pass 2026-04-16 (stream-2)
// ──────────────────────────────────────────────────

// @expect-violation: oauth-tokens-create-no-try-catch
async function gt_oauth_tokens_create_missing() {
  // SHOULD_FIRE: oauth-tokens-create-no-try-catch — token exchange no try-catch
  const tokens = await client.oauth.tokensApi.create(
    "authorization_code",
    "auth-code-from-hubspot",
    "https://myapp.com/oauth/callback",
    "client-id",
    "client-secret",
  );
  return tokens.accessToken;
}

// @expect-clean
async function gt_oauth_tokens_create_safe() {
  // SHOULD_NOT_FIRE: tokensApi.create has try-catch with proper invalid_grant handling
  try {
    const tokens = await client.oauth.tokensApi.create(
      "authorization_code",
      "auth-code-from-hubspot",
      "https://myapp.com/oauth/callback",
      "client-id",
      "client-secret",
    );
    return tokens.accessToken;
  } catch (e: any) {
    // Authorization codes are single-use and expire quickly — user must re-auth on invalid_grant
    if (e.code === 400 && e.body?.error === "invalid_grant") {
      throw new Error("Authorization code expired or already used — user must restart OAuth flow");
    }
    if (e.code === 400 && e.body?.error === "invalid_client") {
      throw new Error("Invalid clientId or clientSecret");
    }
    throw e;
  }
}
