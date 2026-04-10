/**
 * Proper error handling for @hubspot/api-client
 * All calls in this file are wrapped in try/catch.
 * Should produce 0 violations.
 */
import * as hubspot from "@hubspot/api-client";

const hubspotClient = new hubspot.Client({ accessToken: "token" });

/**
 * ✅ CORRECT: create() wrapped in try/catch
 */
async function createContact(email: string, name: string) {
  try {
    const contact = await hubspotClient.crm.contacts.basicApi.create({
      properties: { email, firstname: name },
    });
    return contact.id;
  } catch (error: any) {
    if (error.statusCode === 409) {
      const existingId = error.body.message.split("Existing ID: ")[1];
      return existingId;
    }
    throw error;
  }
}

/**
 * ✅ CORRECT: update() wrapped in try/catch
 */
async function updateContact(contactId: string, properties: Record<string, string>) {
  try {
    const updated = await hubspotClient.crm.contacts.basicApi.update(contactId, {
      properties,
    });
    return updated;
  } catch (error: any) {
    if (error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * ✅ CORRECT: archive() wrapped in try/catch
 */
async function archiveMeeting(meetingId: string) {
  try {
    await hubspotClient.crm.objects.meetings.basicApi.archive(meetingId);
  } catch (error: any) {
    if (error.statusCode === 404) {
      // Already deleted, that's fine
      return;
    }
    throw error;
  }
}

/**
 * ✅ CORRECT: doSearch() wrapped in try/catch
 */
async function searchContacts(email: string) {
  try {
    const results = await hubspotClient.crm.contacts.searchApi.doSearch({
      filterGroups: [{ filters: [{ value: email, propertyName: "email", operator: "EQ" }] }],
      sorts: ["hs_object_id"],
      properties: ["email", "hs_object_id"],
      limit: 10,
      after: 0,
    });
    return results.results;
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
}

/**
 * ✅ CORRECT: getById() wrapped in try/catch
 */
async function getContactById(contactId: string) {
  try {
    const contact = await hubspotClient.crm.contacts.basicApi.getById(contactId, [
      "email",
      "hubspot_owner_id",
    ]);
    return contact;
  } catch (error: any) {
    if (error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * ✅ CORRECT: create meeting wrapped in try/catch
 */
async function createMeeting(title: string, startTime: Date, endTime: Date) {
  try {
    const meeting = await hubspotClient.crm.objects.meetings.basicApi.create({
      properties: {
        hs_timestamp: Date.now().toString(),
        hs_meeting_title: title,
        hs_meeting_start_time: startTime.toISOString(),
        hs_meeting_end_time: endTime.toISOString(),
      },
    });
    return meeting;
  } catch (error) {
    console.error("Meeting creation failed:", error);
    throw error;
  }
}
