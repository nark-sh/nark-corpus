/**
 * svix ground-truth fixtures
 *
 * Tests the nark scanner's ability to detect missing error handling on:
 *   - message.create() — outbound webhook send (DATA_LOSS if swallowed)
 *   - Webhook.verify() — inbound verification (SECURITY_RISK if swallowed)
 *   - application.create() — tenant provisioning (INTEGRATION_BROKEN if swallowed)
 *   - application.getOrCreate() — idempotent onboarding
 *   - endpoint.create() — webhook URL registration (silent: messages go nowhere)
 *   - endpoint.recover() — async replay of failed messages
 *   - endpoint.rotateSecret() — secret rotation during security incidents
 *   - authentication.appPortalAccess() — generate portal token for customer
 *   - messageAttempt.resend() — manual retry of specific failed delivery
 *
 * Error class hierarchy:
 *   ApiException (svix.ApiException) — all HTTP errors: code, body, headers
 *   WebhookVerificationError (standardwebhooks) — signature/timestamp failures
 */
import { Svix, Webhook, WebhookVerificationError, ApiException } from "svix";

// ============================================================
// message.create() — VIOLATIONS (missing try-catch)
// ============================================================

// @expect-violation: api-error
// @expect-violation: network-error
async function sendWebhookMissingErrorHandling(svix: Svix, appId: string) {
  // No try-catch — ApiException swallowed if server rejects the message
  await svix.message.create(appId, {
    eventType: "user.signup",
    payload: { userId: "user_123" },
  });
}

// @expect-clean
async function sendWebhookWithErrorHandling(svix: Svix, appId: string) {
  try {
    await svix.message.create(appId, {
      eventType: "user.signup",
      payload: { userId: "user_123" },
    });
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(`Failed to send webhook: HTTP ${error.code} — ${JSON.stringify(error.body)}`);
    }
    throw error;
  }
}

// ============================================================
// Webhook.verify() — VIOLATIONS (missing try-catch)
// ============================================================

// @expect-violation: signature-mismatch
// @expect-violation: timestamp-expired
// @expect-violation: missing-required-headers
async function verifyWebhookMissingErrorHandling(
  wh: Webhook,
  payload: string,
  headers: Record<string, string>
) {
  // No try-catch — WebhookVerificationError swallowed = auth bypass
  const event = wh.verify(payload, headers);
  return event;
}

// @expect-clean
async function verifyWebhookWithErrorHandling(
  wh: Webhook,
  payload: string,
  headers: Record<string, string>
): Promise<unknown | null> {
  try {
    return wh.verify(payload, headers);
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      // Respond 401 to sender — do NOT process the payload
      console.error("Webhook verification failed:", error.message);
      return null;
    }
    throw error;
  }
}

// ============================================================
// application.create() — VIOLATIONS (missing try-catch)
// ============================================================

// @expect-violation: application-create-api-error
// @expect-violation: application-create-network-error
async function provisionTenantMissingErrorHandling(svix: Svix, customerId: string) {
  // No try-catch — auth/network errors swallowed, customer never gets svix app
  const app = await svix.application.create({
    name: `Customer ${customerId}`,
    uid: customerId,
  });
  return app.id;
}

// @expect-clean
async function provisionTenantWithErrorHandling(svix: Svix, customerId: string) {
  try {
    const app = await svix.application.create({
      name: `Customer ${customerId}`,
      uid: customerId,
    });
    return app.id;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(`Failed to provision webhook app for customer ${customerId}: HTTP ${error.code}`);
    }
    throw error;
  }
}

// ============================================================
// application.getOrCreate() — VIOLATIONS (missing try-catch)
// ============================================================

// @expect-violation: application-get-or-create-api-error
async function idempotentProvisionMissingErrorHandling(svix: Svix, customerId: string) {
  // No try-catch — auth failure leaves customer without svix app silently
  const app = await svix.application.getOrCreate({
    name: `Customer ${customerId}`,
    uid: customerId,
  });
  return app.id;
}

// @expect-clean
async function idempotentProvisionWithErrorHandling(svix: Svix, customerId: string) {
  try {
    const app = await svix.application.getOrCreate({
      name: `Customer ${customerId}`,
      uid: customerId,
    });
    return app.id;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(`Failed to get or create webhook app: HTTP ${error.code}`);
    }
    throw error;
  }
}

// ============================================================
// endpoint.create() — VIOLATIONS (missing try-catch)
// ============================================================

// @expect-violation: endpoint-create-api-error
async function registerEndpointMissingErrorHandling(svix: Svix, appId: string, url: string) {
  // No try-catch — 404 (app not found) or 422 (invalid URL) swallowed silently
  // Result: message.create() succeeds but delivers to zero endpoints
  const ep = await svix.endpoint.create(appId, {
    url,
    version: 1,
  });
  return ep.id;
}

// @expect-clean
async function registerEndpointWithErrorHandling(svix: Svix, appId: string, url: string) {
  try {
    const ep = await svix.endpoint.create(appId, {
      url,
      version: 1,
    });
    return ep.id;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(`Failed to register endpoint ${url}: HTTP ${error.code} — ${JSON.stringify(error.body)}`);
    }
    throw error;
  }
}

// ============================================================
// endpoint.recover() — VIOLATIONS (missing try-catch + async not polled)
// ============================================================

// @expect-violation: endpoint-recover-api-error
async function recoverFailedMessagesMissingErrorHandling(
  svix: Svix,
  appId: string,
  endpointId: string
) {
  // No try-catch — 404/422 swallowed, recovery never initiated
  await svix.endpoint.recover(appId, endpointId, {
    since: new Date(Date.now() - 24 * 60 * 60 * 1000),
  });
}

// @expect-violation: endpoint-recover-async-not-polled
async function recoverWithoutPollingStatus(svix: Svix, appId: string, endpointId: string) {
  try {
    // recover() returns RecoverOut with a taskId — caller discards it
    // This means recovery is ASSUMED done but may still be in progress
    await svix.endpoint.recover(appId, endpointId, {
      since: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }
    throw error;
  }
}

// @expect-clean
async function recoverWithPollingStatus(svix: Svix, appId: string, endpointId: string) {
  try {
    const result = await svix.endpoint.recover(appId, endpointId, {
      since: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });
    // Properly handle the async background task
    if (result?.id) {
      let task = await svix.backgroundTask.get(result.id);
      while (task.status === "running") {
        await new Promise(resolve => setTimeout(resolve, 1000));
        task = await svix.backgroundTask.get(result.id);
      }
      if (task.status !== "finished") {
        throw new Error(`Recovery task ${result.id} did not finish: ${task.status}`);
      }
    }
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(`Failed to recover messages: HTTP ${error.code}`);
    }
    throw error;
  }
}

// ============================================================
// endpoint.rotateSecret() — VIOLATIONS (missing try-catch)
// ============================================================

// @expect-violation: endpoint-rotate-secret-api-error
async function rotateEndpointSecretMissingErrorHandling(
  svix: Svix,
  appId: string,
  endpointId: string
) {
  // No try-catch — silent failure: caller thinks secret rotated, svix still has old one
  await svix.endpoint.rotateSecret(appId, endpointId, {});
}

// @expect-clean
async function rotateEndpointSecretWithErrorHandling(
  svix: Svix,
  appId: string,
  endpointId: string
) {
  try {
    await svix.endpoint.rotateSecret(appId, endpointId, {});
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(`Failed to rotate endpoint secret: HTTP ${error.code}`);
    }
    throw error;
  }
}

// ============================================================
// authentication.appPortalAccess() — VIOLATIONS (missing try-catch)
// ============================================================

// @expect-violation: app-portal-access-api-error
async function generatePortalUrlMissingErrorHandling(svix: Svix, appId: string) {
  // No try-catch — 404 (app not found) swallowed, redirect URL is undefined
  const access = await svix.authentication.appPortalAccess(appId, {});
  return access.url;
}

// @expect-clean
async function generatePortalUrlWithErrorHandling(svix: Svix, appId: string) {
  try {
    const access = await svix.authentication.appPortalAccess(appId, {});
    return access.url;
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(`Failed to generate portal URL for app ${appId}: HTTP ${error.code}`);
    }
    throw error;
  }
}

// ============================================================
// messageAttempt.resend() — VIOLATIONS (missing try-catch)
// ============================================================

// @expect-violation: message-attempt-resend-api-error
async function resendMessageAttemptMissingErrorHandling(
  svix: Svix,
  appId: string,
  msgId: string,
  endpointId: string
) {
  // No try-catch — 404 (attempt not found) swallowed, operator believes resend succeeded
  await svix.messageAttempt.resend(appId, msgId, endpointId);
}

// @expect-clean
async function resendMessageAttemptWithErrorHandling(
  svix: Svix,
  appId: string,
  msgId: string,
  endpointId: string
) {
  try {
    await svix.messageAttempt.resend(appId, msgId, endpointId);
  } catch (error) {
    if (error instanceof ApiException) {
      throw new Error(`Failed to resend attempt: HTTP ${error.code} — ${JSON.stringify(error.body)}`);
    }
    throw error;
  }
}
