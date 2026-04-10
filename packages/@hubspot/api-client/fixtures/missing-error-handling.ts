/**
 * Missing error handling for @hubspot/api-client
 * All calls in this file are missing try/catch.
 * Should produce ERROR violations.
 */
import * as hubspot from "@hubspot/api-client";

const hubspotClient = new hubspot.Client({ accessToken: "token" });

/**
 * ❌ VIOLATION: create() without try/catch
 * If contact already exists (409) or rate limited (429), crashes the request.
 */
async function createContact(email: string, name: string) {
  const contact = await hubspotClient.crm.contacts.basicApi.create({
    properties: { email, firstname: name },
  });
  return contact.id;
}

/**
 * ❌ VIOLATION: update() without try/catch
 * 404 (object deleted) crashes the request.
 */
async function updateContact(contactId: string, properties: Record<string, string>) {
  const updated = await hubspotClient.crm.contacts.basicApi.update(contactId, {
    properties,
  });
  return updated;
}

/**
 * ❌ VIOLATION: archive() without try/catch
 * 404 or auth errors crash the request.
 */
async function archiveMeeting(meetingId: string) {
  await hubspotClient.crm.objects.meetings.basicApi.archive(meetingId);
}

/**
 * ❌ VIOLATION: doSearch() without try/catch
 * Bad filter or auth error crashes the request.
 */
async function searchContacts(email: string) {
  const results = await hubspotClient.crm.contacts.searchApi.doSearch({
    filterGroups: [{ filters: [{ value: email, propertyName: "email", operator: "EQ" }] }],
    sorts: ["hs_object_id"],
    properties: ["email"],
    limit: 10,
    after: 0,
  });
  return results.results;
}

/**
 * ❌ VIOLATION: getById() without try/catch
 * 404 when contact not found crashes the request.
 */
async function getContactById(contactId: string) {
  const contact = await hubspotClient.crm.contacts.basicApi.getById(contactId, [
    "email",
    "hubspot_owner_id",
  ]);
  return contact;
}

/**
 * ❌ VIOLATION: create meeting without try/catch
 * HubSpot API errors crash the caller.
 */
async function createMeeting(title: string, startTime: Date, endTime: Date) {
  const meeting = await hubspotClient.crm.objects.meetings.basicApi.create({
    properties: {
      hs_timestamp: Date.now().toString(),
      hs_meeting_title: title,
      hs_meeting_start_time: startTime.toISOString(),
      hs_meeting_end_time: endTime.toISOString(),
    },
  });
  return meeting;
}
