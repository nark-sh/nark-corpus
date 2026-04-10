/**
 * Instance-based usage patterns for @hubspot/api-client
 * Tests detection of violations through class field instances.
 * Mirrors the cal.com CrmService pattern.
 */
import * as hubspot from "@hubspot/api-client";

class HubspotCrmService {
  private hubspotClient: hubspot.Client;

  constructor(accessToken: string) {
    this.hubspotClient = new hubspot.Client({ accessToken });
  }

  /**
   * ❌ VIOLATION: create via class field instance, no try/catch
   */
  async createMeeting(title: string) {
    const meeting = await this.hubspotClient.crm.objects.meetings.basicApi.create({
      properties: {
        hs_timestamp: Date.now().toString(),
        hs_meeting_title: title,
      },
    });
    return meeting.id;
  }

  /**
   * ❌ VIOLATION: update via class field, no try/catch
   */
  async updateMeeting(uid: string, title: string) {
    return this.hubspotClient.crm.objects.meetings.basicApi.update(uid, {
      properties: { hs_meeting_title: title },
    });
  }

  /**
   * ❌ VIOLATION: archive via class field, no try/catch
   */
  async cancelMeeting(uid: string) {
    return this.hubspotClient.crm.objects.meetings.basicApi.archive(uid);
  }

  /**
   * ❌ VIOLATION: doSearch via class field, no try/catch
   */
  async findContact(email: string) {
    const results = await this.hubspotClient.crm.contacts.searchApi.doSearch({
      filterGroups: [{ filters: [{ value: email, propertyName: "email", operator: "EQ" }] }],
      sorts: [],
      properties: ["email"],
      limit: 1,
      after: 0,
    });
    return results.results[0] ?? null;
  }

  /**
   * ✅ CORRECT: create with try/catch
   */
  async createContactSafe(email: string) {
    try {
      const contact = await this.hubspotClient.crm.contacts.basicApi.create({
        properties: { email },
      });
      return contact.id;
    } catch (error: any) {
      if (error.statusCode === 409) {
        return error.body.message.split("Existing ID: ")[1];
      }
      throw error;
    }
  }

  /**
   * ✅ CORRECT: getById with try/catch
   */
  async getContact(id: string) {
    try {
      return await this.hubspotClient.crm.contacts.basicApi.getById(id, ["email"]);
    } catch (error: any) {
      if (error.statusCode === 404) return null;
      throw error;
    }
  }
}
