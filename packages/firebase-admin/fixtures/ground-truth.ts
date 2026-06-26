/**
 * firebase-admin ground-truth test fixtures.
 * Annotations DIRECTLY before the call site (annotated line + 1 is checked).
 *
 * Contracted functions from corpus/packages/firebase-admin/contract.yaml:
 *   Auth: verifyIdToken, createUser, getUser, updateUser, deleteUser, getUserByEmail, setCustomUserClaims
 *   Auth (new 2026-04-06): createSessionCookie, verifySessionCookie, createCustomToken, revokeRefreshTokens, generatePasswordResetLink
 *   Auth (new 2026-04-13): importUsers, generateSignInWithEmailLink
 *   Auth (new 2026-04-13 pass 14): createProviderConfig, updateProviderConfig, deleteProviderConfig, getProviderConfig
 *   Tenant (new 2026-04-13 pass 14): createTenant, updateTenant, deleteTenant, getTenant
 *   Firestore: get, add, set, update, delete
 *   Firestore (new): runTransaction, commit (WriteBatch)
 *   Messaging: send, sendMulticast
 *   Messaging (new): sendEach, subscribeToTopic
 *   RTDB: once, set, update, remove
 *   RTDB (new 2026-04-13 pass 14): setRules
 *   Remote Config (new 2026-04-13): getTemplate, publishTemplate
 *   Storage (new 2026-04-13 pass 14): getDownloadURL
 *   Data Connect (new 2026-06-24 pass 42): executeGraphql (v14+)
 *   Phone Number Verification (new 2026-06-24 pass 42): verifyToken (v14+)
 *   Security Rules (new 2026-06-26 pass 1): releaseFirestoreRulesetFromSource, releaseStorageRulesetFromSource,
 *     createRuleset, deleteRuleset
 *   ML (new 2026-06-26 pass 1): updateModel
 *   Installations (new 2026-06-26 pass 1): deleteInstallation
 *
 * Detection note: namespace API (admin.auth()) and stored instances are fully detected.
 * Modular getAuth().verifyIdToken() pattern is not currently detected (analyzer limitation).
 * Modular getFirestore().collection().get() and getDatabase().ref().once() ARE detected.
 * Remote Config: getRemoteConfig() modular API used. Detection requires factory_method tracking.
 * Data Connect / Phone Number Verification use the same modular getXxx() factory pattern.
 */

import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';
import { getDataConnect } from 'firebase-admin/data-connect';
import { getPhoneNumberVerification } from 'firebase-admin/phone-number-verification';
import { getSecurityRules } from 'firebase-admin/security-rules';
import { getMachineLearning } from 'firebase-admin/machine-learning';
import { getInstallations } from 'firebase-admin/installations';

// ──────────────────────────────────────────────
// 1. verifyIdToken — namespace API
// ──────────────────────────────────────────────

async function gt_verifyIdToken_missing_namespace(token: string) {
  // SHOULD_FIRE: token-expired — verifyIdToken via admin.auth() without try-catch
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded.uid;
}

async function gt_verifyIdToken_proper_namespace(token: string) {
  try {
    // SHOULD_NOT_FIRE: verifyIdToken inside try-catch
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 2. verifyIdToken — stored instance
// ──────────────────────────────────────────────

const auth = admin.auth();

async function gt_verifyIdToken_missing_instance(token: string) {
  // SHOULD_FIRE: token-expired — verifyIdToken on stored instance without try-catch
  const decoded = await auth.verifyIdToken(token);
  return decoded.uid;
}

async function gt_verifyIdToken_proper_instance(token: string) {
  try {
    // SHOULD_NOT_FIRE: verifyIdToken on stored instance inside try-catch
    const decoded = await auth.verifyIdToken(token);
    return decoded.uid;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 3. createUser
// ──────────────────────────────────────────────

async function gt_createUser_missing(email: string, password: string) {
  // SHOULD_FIRE: email-already-exists — createUser without try-catch
  const user = await admin.auth().createUser({ email, password });
  return user.uid;
}

async function gt_createUser_proper(email: string, password: string) {
  try {
    // SHOULD_NOT_FIRE: createUser inside try-catch
    const user = await admin.auth().createUser({ email, password });
    return user.uid;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 4. getUser
// ──────────────────────────────────────────────

async function gt_getUser_missing(uid: string) {
  // SHOULD_FIRE: user-not-found — getUser without try-catch
  const user = await admin.auth().getUser(uid);
  return user.email;
}

async function gt_getUser_proper(uid: string) {
  try {
    // SHOULD_NOT_FIRE: getUser inside try-catch
    const user = await admin.auth().getUser(uid);
    return user.email;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 5. updateUser
// ──────────────────────────────────────────────

async function gt_updateUser_missing(uid: string) {
  // SHOULD_FIRE: user-not-found — updateUser without try-catch
  const user = await admin.auth().updateUser(uid, { displayName: 'New Name' });
  return user.uid;
}

async function gt_updateUser_proper(uid: string) {
  try {
    // SHOULD_NOT_FIRE: updateUser inside try-catch
    const user = await admin.auth().updateUser(uid, { displayName: 'New Name' });
    return user.uid;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 6. Firestore get() — namespace stored instance
// ──────────────────────────────────────────────

const db = admin.firestore();

async function gt_firestore_get_missing(docId: string) {
  // SHOULD_FIRE: permission-denied — Firestore get() without try-catch
  const snapshot = await db.collection('users').doc(docId).get();
  return snapshot.data();
}

async function gt_firestore_get_proper(docId: string) {
  try {
    // SHOULD_NOT_FIRE: Firestore get() inside try-catch
    const snapshot = await db.collection('users').doc(docId).get();
    return snapshot.data();
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 7. Firestore get() — modular API (getFirestore)
// ──────────────────────────────────────────────

async function gt_firestore_get_missing_modular(docId: string) {
  // SHOULD_FIRE: permission-denied — Firestore get() via getFirestore() without try-catch
  const snapshot = await getFirestore().collection('users').doc(docId).get();
  return snapshot.data();
}

async function gt_firestore_get_proper_modular(docId: string) {
  try {
    // SHOULD_NOT_FIRE: Firestore get() via getFirestore() inside try-catch
    const snapshot = await getFirestore().collection('users').doc(docId).get();
    return snapshot.data();
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 8. Firestore add()
// ──────────────────────────────────────────────

async function gt_firestore_add_missing(data: any) {
  // SHOULD_FIRE: permission-denied — Firestore add() without try-catch
  const ref = await db.collection('users').add(data);
  return ref.id;
}

async function gt_firestore_add_proper(data: any) {
  try {
    // SHOULD_NOT_FIRE: Firestore add() inside try-catch
    const ref = await db.collection('users').add(data);
    return ref.id;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 9. Firestore update()
// ──────────────────────────────────────────────

async function gt_firestore_update_missing(docId: string) {
  // SHOULD_FIRE: not-found — Firestore update() without try-catch
  await db.collection('users').doc(docId).update({ lastSeen: new Date() });
}

async function gt_firestore_update_proper(docId: string) {
  try {
    // SHOULD_NOT_FIRE: Firestore update() inside try-catch
    await db.collection('users').doc(docId).update({ lastSeen: new Date() });
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 10. Messaging send() — namespace
// ──────────────────────────────────────────────

async function gt_messaging_send_missing(token: string) {
  // SHOULD_FIRE: invalid-recipient — messaging send() without try-catch
  const msgId = await admin.messaging().send({
    token,
    notification: { title: 'Test', body: 'Test message' }
  });
  return msgId;
}

async function gt_messaging_send_proper(token: string) {
  try {
    // SHOULD_NOT_FIRE: messaging send() inside try-catch
    const msgId = await admin.messaging().send({
      token,
      notification: { title: 'Test', body: 'Test message' }
    });
    return msgId;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 11. Realtime Database once() — namespace
// ──────────────────────────────────────────────

async function gt_rtdb_once_missing(path: string) {
  // SHOULD_FIRE: permission-denied — RTDB once() without try-catch
  const snapshot = await admin.database().ref(path).once('value');
  return snapshot.val();
}

async function gt_rtdb_once_proper(path: string) {
  try {
    // SHOULD_NOT_FIRE: RTDB once() inside try-catch
    const snapshot = await admin.database().ref(path).once('value');
    return snapshot.val();
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 12. Realtime Database once() — modular API (getDatabase)
// ──────────────────────────────────────────────

async function gt_rtdb_once_missing_modular(path: string) {
  // SHOULD_FIRE: permission-denied — RTDB once() via getDatabase() without try-catch
  const snapshot = await getDatabase().ref(path).once('value');
  return snapshot.val();
}

async function gt_rtdb_once_proper_modular(path: string) {
  try {
    // SHOULD_NOT_FIRE: RTDB once() via getDatabase() inside try-catch
    const snapshot = await getDatabase().ref(path).once('value');
    return snapshot.val();
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 13. createSessionCookie — added 2026-04-06 depth pass
// ──────────────────────────────────────────────

// @expect-violation: session-cookie-invalid-id-token
// @expect-violation: session-cookie-network-error
async function gt_createSessionCookie_missing(idToken: string) {
  // SHOULD_FIRE: session-cookie-invalid-duration — createSessionCookie without try-catch
  const cookie = await admin.auth().createSessionCookie(idToken, { expiresIn: 86400000 });
  return cookie;
}

// @expect-clean
async function gt_createSessionCookie_proper(idToken: string) {
  try {
    // SHOULD_NOT_FIRE: createSessionCookie inside try-catch
    const cookie = await admin.auth().createSessionCookie(idToken, { expiresIn: 86400000 });
    return cookie;
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────
// 14. verifySessionCookie — added 2026-04-06 depth pass
// ──────────────────────────────────────────────

// @expect-violation: session-cookie-expired
// @expect-violation: session-cookie-revoked
// @expect-violation: session-cookie-invalid
async function gt_verifySessionCookie_missing(sessionCookie: string) {
  // SHOULD_FIRE: session-cookie-expired — verifySessionCookie without try-catch
  const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
  return decoded.uid;
}

// @expect-clean
async function gt_verifySessionCookie_proper(sessionCookie: string) {
  try {
    // SHOULD_NOT_FIRE: verifySessionCookie inside try-catch
    const decoded = await admin.auth().verifySessionCookie(sessionCookie, true);
    return decoded.uid;
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────
// 15. createCustomToken — added 2026-04-06 depth pass
// ──────────────────────────────────────────────

// @expect-violation: custom-token-invalid-uid
// @expect-violation: custom-token-signing-error
async function gt_createCustomToken_missing(uid: string) {
  // SHOULD_FIRE: custom-token-invalid-uid — createCustomToken without try-catch
  const token = await admin.auth().createCustomToken(uid, { role: 'admin' });
  return token;
}

// @expect-clean
async function gt_createCustomToken_proper(uid: string) {
  try {
    // SHOULD_NOT_FIRE: createCustomToken inside try-catch
    const token = await admin.auth().createCustomToken(uid, { role: 'admin' });
    return token;
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────
// 16. revokeRefreshTokens — added 2026-04-06 depth pass
// ──────────────────────────────────────────────

// @expect-violation: revoke-tokens-user-not-found
// @expect-violation: revoke-tokens-network-error
async function gt_revokeRefreshTokens_missing(uid: string) {
  // SHOULD_FIRE: revoke-tokens-user-not-found — revokeRefreshTokens without try-catch
  await admin.auth().revokeRefreshTokens(uid);
}

// @expect-clean
async function gt_revokeRefreshTokens_proper(uid: string) {
  try {
    // SHOULD_NOT_FIRE: revokeRefreshTokens inside try-catch
    await admin.auth().revokeRefreshTokens(uid);
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────
// 17. generatePasswordResetLink — added 2026-04-06 depth pass
// ──────────────────────────────────────────────

// @expect-violation: password-reset-user-not-found
// @expect-violation: password-reset-invalid-email
async function gt_generatePasswordResetLink_missing(email: string) {
  // SHOULD_FIRE: password-reset-user-not-found — generatePasswordResetLink without try-catch
  const link = await admin.auth().generatePasswordResetLink(email);
  return link;
}

// @expect-clean
async function gt_generatePasswordResetLink_proper(email: string) {
  try {
    // SHOULD_NOT_FIRE: generatePasswordResetLink inside try-catch
    const link = await admin.auth().generatePasswordResetLink(email);
    return link;
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────
// 18. runTransaction — added 2026-04-06 depth pass
// ──────────────────────────────────────────────

// @expect-violation: transaction-aborted-max-retries
// @expect-violation: transaction-deadline-exceeded
async function gt_runTransaction_missing(docId: string) {
  // SHOULD_FIRE: transaction-aborted-max-retries — runTransaction without try-catch
  await db.runTransaction(async (t) => {
    const doc = await t.get(db.collection('accounts').doc(docId));
    t.update(db.collection('accounts').doc(docId), { balance: (doc.data()?.balance ?? 0) + 1 });
  });
}

// @expect-clean
async function gt_runTransaction_proper(docId: string) {
  try {
    // SHOULD_NOT_FIRE: runTransaction inside try-catch
    await db.runTransaction(async (t) => {
      const doc = await t.get(db.collection('accounts').doc(docId));
      t.update(db.collection('accounts').doc(docId), { balance: (doc.data()?.balance ?? 0) + 1 });
    });
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────
// 19. WriteBatch.commit() — added 2026-04-06 depth pass
// ──────────────────────────────────────────────

// @expect-violation: batch-resource-exhausted
// @expect-violation: batch-aborted
async function gt_writeBatch_commit_missing(data: any[]) {
  const batch = db.batch();
  for (const item of data) {
    batch.set(db.collection('events').doc(), item);
  }
  // SHOULD_FIRE: batch-resource-exhausted — WriteBatch.commit() without try-catch
  await batch.commit();
}

// @expect-clean
async function gt_writeBatch_commit_proper(data: any[]) {
  try {
    // SHOULD_NOT_FIRE: WriteBatch.commit() inside try-catch
    const batch = db.batch();
    for (const item of data) {
      batch.set(db.collection('events').doc(), item);
    }
    await batch.commit();
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────
// 20. sendEach — added 2026-04-06 depth pass
// ──────────────────────────────────────────────

// @expect-violation: send-each-rate-exceeded
// @expect-violation: send-each-invalid-argument
async function gt_sendEach_missing(tokens: string[]) {
  const messages = tokens.map(token => ({
    token,
    notification: { title: 'Test' }
  }));
  // SHOULD_FIRE: send-each-partial-failure — sendEach without try-catch
  const response = await admin.messaging().sendEach(messages);
  return response.successCount;
}

// @expect-clean
async function gt_sendEach_proper(tokens: string[]) {
  try {
    // SHOULD_NOT_FIRE: sendEach inside try-catch
    const messages = tokens.map(token => ({
      token,
      notification: { title: 'Test' }
    }));
    const response = await admin.messaging().sendEach(messages);
    return response.successCount;
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────
// 21. subscribeToTopic — added 2026-04-06 depth pass
// ──────────────────────────────────────────────

// @expect-violation: subscribe-invalid-topic
// @expect-violation: subscribe-partial-failure
async function gt_subscribeToTopic_missing(tokens: string[], topic: string) {
  // SHOULD_FIRE: subscribe-partial-failure — subscribeToTopic without try-catch
  const response = await admin.messaging().subscribeToTopic(tokens, topic);
  return response.successCount;
}

// @expect-clean
async function gt_subscribeToTopic_proper(tokens: string[], topic: string) {
  try {
    // SHOULD_NOT_FIRE: subscribeToTopic inside try-catch
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    return response.successCount;
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────
// 22. importUsers — added 2026-04-13 depth pass (deepen-stream-1)
// ──────────────────────────────────────────────
// Note: importUsers RESOLVES even on partial failure — partial failure is in
// result.failureCount. The test annotates import-users-partial-failure because
// callers that don't check failureCount silently lose users.

async function gt_importUsers_missing(users: admin.auth.UserImportRecord[]) {
  // SHOULD_FIRE: import-users-batch-too-large — importUsers without try-catch (batch-too-large fires first)
  const result = await admin.auth().importUsers(users);
  return result.successCount;
}

// @expect-clean
async function gt_importUsers_proper(users: admin.auth.UserImportRecord[]) {
  try {
    // SHOULD_NOT_FIRE: importUsers inside try-catch with result.failureCount check
    const result = await admin.auth().importUsers(users);
    if (result.failureCount > 0) {
      throw new Error(`${result.failureCount} users failed to import`);
    }
    return result.successCount;
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────
// 23. generateSignInWithEmailLink — added 2026-04-13 depth pass (deepen-stream-1)
// ──────────────────────────────────────────────

async function gt_generateSignInWithEmailLink_missing(email: string) {
  // SHOULD_FIRE: sign-in-link-missing-action-code-settings — generateSignInWithEmailLink without try-catch
  const link = await admin.auth().generateSignInWithEmailLink(email, {
    url: 'https://example.com/finishSignIn',
    handleCodeInApp: true,
  });
  return link;
}

// @expect-clean
async function gt_generateSignInWithEmailLink_proper(email: string) {
  try {
    // SHOULD_NOT_FIRE: generateSignInWithEmailLink inside try-catch
    const link = await admin.auth().generateSignInWithEmailLink(email, {
      url: 'https://example.com/finishSignIn',
      handleCodeInApp: true,
    });
    return link;
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────
// 24. Remote Config — getTemplate — added 2026-04-13 depth pass (deepen-stream-1)
// ──────────────────────────────────────────────

import { getRemoteConfig } from 'firebase-admin/remote-config';

async function gt_remoteConfig_getTemplate_missing() {
  const rc = getRemoteConfig();
  // SHOULD_FIRE: remote-config-get-permission-denied — getTemplate without try-catch
  const template = await rc.getTemplate();
  return template;
}

// @expect-clean
async function gt_remoteConfig_getTemplate_proper() {
  try {
    // SHOULD_NOT_FIRE: getTemplate inside try-catch
    const rc = getRemoteConfig();
    const template = await rc.getTemplate();
    return template;
  } catch (error) {
    throw error;
  }
}

// ──────────────────────────────────────────────
// 25. Remote Config — publishTemplate — added 2026-04-13 depth pass (deepen-stream-1)
// ──────────────────────────────────────────────

async function gt_remoteConfig_publishTemplate_missing(template: admin.remoteConfig.RemoteConfigTemplate) {
  const rc = getRemoteConfig();
  // SHOULD_FIRE: remote-config-publish-etag-mismatch — publishTemplate without try-catch
  const published = await rc.publishTemplate(template);
  return published;
}

// @expect-clean
async function gt_remoteConfig_publishTemplate_proper(template: admin.remoteConfig.RemoteConfigTemplate) {
  try {
    // SHOULD_NOT_FIRE: publishTemplate inside try-catch
    const rc = getRemoteConfig();
    const published = await rc.publishTemplate(template);
    return published;
  } catch (error) {
    if ((error as any).code === 'remote-config/aborted') {
      // ETag mismatch — fetch fresh template and retry
      throw new Error('Template was modified by another process. Please retry.');
    }
    throw error;
  }
}

// ──────────────────────────────────────────────
// 26. Auth — createProviderConfig — added 2026-04-13 depth pass 14 (deepen-stream-2)
// ──────────────────────────────────────────────

import { getAuth } from 'firebase-admin/auth';

// @expect-violation: create-provider-config-invalid-provider-id
// @expect-violation: create-provider-config-quota-exceeded
// @expect-violation: create-provider-config-insufficient-permission
async function gt_createProviderConfig_missing() {
  const auth = getAuth();
  // SHOULD_FIRE: createProviderConfig without try-catch
  const config = await auth.createProviderConfig({
    providerId: 'oidc.my-provider',
    displayName: 'My OIDC Provider',
    enabled: true,
    clientId: 'client-id',
    issuer: 'https://accounts.example.com',
  });
  return config;
}

// @expect-clean
async function gt_createProviderConfig_proper() {
  try {
    // SHOULD_NOT_FIRE: createProviderConfig inside try-catch
    const auth = getAuth();
    const config = await auth.createProviderConfig({
      providerId: 'oidc.my-provider',
      displayName: 'My OIDC Provider',
      enabled: true,
      clientId: 'client-id',
      issuer: 'https://accounts.example.com',
    });
    return config;
  } catch (error) {
    if ((error as any).code === 'auth/invalid-provider-id') {
      throw new Error('Invalid provider ID: must start with oidc. or saml.');
    }
    if ((error as any).code === 'auth/quota-exceeded') {
      throw new Error('Provider config quota exceeded — delete unused configurations.');
    }
    throw error;
  }
}

// ──────────────────────────────────────────────
// 27. Auth — createTenant — added 2026-04-13 depth pass 14 (deepen-stream-2)
// ──────────────────────────────────────────────

// @expect-violation: create-tenant-invalid-tenant-id
// @expect-violation: create-tenant-missing-display-name
// @expect-violation: create-tenant-quota-exceeded
async function gt_createTenant_missing() {
  const auth = getAuth();
  const tm = auth.tenantManager();
  // SHOULD_FIRE: createTenant without try-catch
  const tenant = await tm.createTenant({
    displayName: 'Acme Corp',
    emailSignInConfig: { enabled: true },
  });
  return tenant;
}

// @expect-clean
async function gt_createTenant_proper() {
  try {
    // SHOULD_NOT_FIRE: createTenant inside try-catch
    const auth = getAuth();
    const tm = auth.tenantManager();
    const tenant = await tm.createTenant({
      displayName: 'Acme Corp',
      emailSignInConfig: { enabled: true },
    });
    return tenant;
  } catch (error) {
    if ((error as any).code === 'auth/quota-exceeded') {
      throw new Error('Tenant quota exceeded — contact Google Cloud support.');
    }
    if ((error as any).code === 'auth/missing-display-name') {
      throw new Error('Tenant displayName is required.');
    }
    throw error;
  }
}

// ──────────────────────────────────────────────
// 28. RTDB — setRules — added 2026-04-13 depth pass 14 (deepen-stream-2)
// ──────────────────────────────────────────────

import { getDatabase } from 'firebase-admin/database';

// @expect-violation: set-rules-invalid-argument
// @expect-violation: set-rules-permission-denied
async function gt_setRules_missing() {
  const db = getDatabase();
  const rules = JSON.stringify({
    rules: {
      '.read': 'auth != null',
      '.write': 'auth != null',
    },
  });
  // SHOULD_FIRE: setRules without try-catch
  await db.setRules(rules);
}

// @expect-clean
async function gt_setRules_proper() {
  try {
    // SHOULD_NOT_FIRE: setRules inside try-catch
    const db = getDatabase();
    const rules = JSON.stringify({
      rules: {
        '.read': 'auth != null',
        '.write': 'auth != null',
      },
    });
    await db.setRules(rules);
  } catch (error) {
    if ((error as any).code === 'database/invalid-argument') {
      throw new Error('Invalid rules source: must be non-empty string, Buffer, or object.');
    }
    throw error;
  }
}

// ──────────────────────────────────────────────
// 29. Storage — getDownloadURL — added 2026-04-13 depth pass 14 (deepen-stream-2)
// ──────────────────────────────────────────────

import { getStorage, getDownloadURL } from 'firebase-admin/storage';

// @expect-violation: get-download-url-no-token
// @expect-violation: get-download-url-file-not-found
async function gt_getDownloadURL_missing(filePath: string) {
  const storage = getStorage();
  const bucket = storage.bucket();
  const file = bucket.file(filePath);
  // SHOULD_FIRE: getDownloadURL without try-catch
  const url = await getDownloadURL(file);
  return url;
}

// @expect-clean
async function gt_getDownloadURL_proper(filePath: string) {
  try {
    // SHOULD_NOT_FIRE: getDownloadURL inside try-catch
    const storage = getStorage();
    const bucket = storage.bucket();
    const file = bucket.file(filePath);
    const url = await getDownloadURL(file);
    return url;
  } catch (error) {
    if ((error as any).code === 'storage/no-download-token') {
      throw new Error(
        'File has no download token. Upload via Firebase SDK or add token metadata manually.'
      );
    }
    throw error;
  }
}

// ──────────────────────────────────────────────
// 30. Data Connect — executeGraphql — added 2026-06-24 depth pass 42 (deepen-stream-3)
// ──────────────────────────────────────────────

// @expect-violation: data-connect-invalid-argument
// @expect-violation: data-connect-permission-denied
// @expect-violation: data-connect-network-error
// @expect-violation: data-connect-query-error
async function gt_executeGraphql_missing(query: string) {
  const dc = getDataConnect({ connector: 'main', location: 'us-central1', serviceId: 'svc' });
  // SHOULD_FIRE: data-connect-invalid-argument
  const result = await dc.executeGraphql(query);
  return result;
}

// @expect-clean
async function gt_executeGraphql_proper(query: string) {
  try {
    const dc = getDataConnect({ connector: 'main', location: 'us-central1', serviceId: 'svc' });
    // SHOULD_NOT_FIRE: executeGraphql inside try-catch
    const result = await dc.executeGraphql(query);
    return result;
  } catch (error) {
    if ((error as any).code === 'data-connect/permission-denied') {
      throw new Error('Data Connect permission denied — check service-account roles.');
    }
    throw error;
  }
}

// ──────────────────────────────────────────────
// 31. Phone Number Verification — verifyToken — added 2026-06-24 depth pass 42 (deepen-stream-3)
// ──────────────────────────────────────────────

// @expect-violation: phone-verify-token-invalid
// @expect-violation: phone-verify-token-expired
// @expect-violation: phone-verify-project-or-network-error
async function gt_verifyToken_missing(jwt: string) {
  const pnv = getPhoneNumberVerification();
  // SHOULD_FIRE: phone-verify-token-invalid
  const decoded = await pnv.verifyToken(jwt);
  return decoded;
}

// @expect-clean
async function gt_verifyToken_proper(jwt: string) {
  try {
    const pnv = getPhoneNumberVerification();
    // SHOULD_NOT_FIRE: verifyToken inside try-catch
    const decoded = await pnv.verifyToken(jwt);
    return decoded;
  } catch (error) {
    if ((error as any).code === 'phone-number-verification/expired-token') {
      throw new Error('Phone verification token expired — restart phone-verification flow.');
    }
    throw error;
  }
}

// ──────────────────────────────────────────────
// 32. Cloud Functions / TaskQueue — enqueue / delete — added 2026-06-25 depth pass 3 (deepen-stream-2)
// ──────────────────────────────────────────────

import { getFunctions } from 'firebase-admin/functions';

// @expect-violation: task-queue-enqueue-already-exists
// @expect-violation: task-queue-enqueue-permission-denied
// @expect-violation: task-queue-enqueue-not-found
async function gt_taskQueueEnqueue_missing(payload: object) {
  const functions = getFunctions();
  const queue = functions.taskQueue('processOrder');
  // SHOULD_FIRE: task-queue-enqueue-already-exists / permission-denied / not-found
  await queue.enqueue(payload, { id: 'order-123' });
}

// @expect-clean
async function gt_taskQueueEnqueue_proper(payload: object) {
  const functions = getFunctions();
  const queue = functions.taskQueue('processOrder');
  try {
    // SHOULD_NOT_FIRE: enqueue inside try-catch
    await queue.enqueue(payload, { id: 'order-123' });
  } catch (error) {
    if ((error as any).code === 'functions/task-already-exists') {
      // Idempotent — task is already queued, no action needed
      return;
    }
    if ((error as any).code === 'functions/permission-denied') {
      throw new Error('Missing cloudtasks.tasks.create IAM permission on service account.');
    }
    throw error;
  }
}

// @expect-violation: task-queue-delete-not-found
async function gt_taskQueueDelete_missing(taskId: string) {
  const functions = getFunctions();
  const queue = functions.taskQueue('processOrder');
  // SHOULD_FIRE: task-queue-delete-not-found
  await queue.delete(taskId);
}

// @expect-clean
async function gt_taskQueueDelete_proper(taskId: string) {
  const functions = getFunctions();
  const queue = functions.taskQueue('processOrder');
  try {
    // SHOULD_NOT_FIRE: delete inside try-catch
    await queue.delete(taskId);
  } catch (error) {
    if ((error as any).code === 'functions/not-found') {
      // Idempotent — task may have already executed; treat as success
      return;
    }
    throw error;
  }
}

// ──────────────────────────────────────────────
// 33. Eventarc — Channel.publish — added 2026-06-25 depth pass 3 (deepen-stream-2)
// ──────────────────────────────────────────────

import { getEventarc } from 'firebase-admin/eventarc';

// @expect-violation: eventarc-publish-invalid-argument
// @expect-violation: eventarc-publish-permission-denied
async function gt_eventarcPublish_missing() {
  const eventarc = getEventarc();
  const channel = eventarc.channel('my-channel');
  // SHOULD_FIRE: eventarc-publish-invalid-argument / permission-denied
  await channel.publish({
    type: 'com.example.order.created',
    subject: 'order/123',
  } as any);
}

// @expect-clean
async function gt_eventarcPublish_proper() {
  const eventarc = getEventarc();
  const channel = eventarc.channel('my-channel');
  try {
    // SHOULD_NOT_FIRE: publish inside try-catch
    await channel.publish({
      type: 'com.example.order.created',
      subject: 'order/123',
    } as any);
  } catch (error) {
    if ((error as any).code === 'eventarc/invalid-argument') {
      throw new Error('CloudEvent payload is missing required fields (id, source, type, specversion).');
    }
    throw error;
  }
}

// ──────────────────────────────────────────────
// 34. Remote Config — rollback / getServerTemplate — added 2026-06-25 depth pass 3 (deepen-stream-2)
// ──────────────────────────────────────────────

import { getRemoteConfig as getRC } from 'firebase-admin/remote-config';

// @expect-violation: remote-config-rollback-version-not-found
// @expect-violation: remote-config-rollback-invalid-version
async function gt_remoteConfigRollback_missing(version: number) {
  const rc = getRC();
  // SHOULD_FIRE: remote-config-rollback-version-not-found / invalid-version
  await rc.rollback(version);
}

// @expect-clean
async function gt_remoteConfigRollback_proper(version: number) {
  const rc = getRC();
  try {
    // SHOULD_NOT_FIRE: rollback inside try-catch
    await rc.rollback(version);
  } catch (error) {
    if ((error as any).code === 'remote-config/not-found') {
      throw new Error(`Remote Config version ${version} is no longer available (deleted or out of 300-version window).`);
    }
    if ((error as any).code === 'remote-config/failed-precondition') {
      throw new Error(`Cannot roll back to version ${version}: must be less than current version.`);
    }
    throw error;
  }
}

// @expect-violation: remote-config-server-template-auth-error
async function gt_remoteConfigGetServerTemplate_missing() {
  const rc = getRC();
  // SHOULD_FIRE: remote-config-server-template-auth-error
  const template = await rc.getServerTemplate();
  return template;
}

// @expect-clean
async function gt_remoteConfigGetServerTemplate_proper() {
  const rc = getRC();
  try {
    // SHOULD_NOT_FIRE: getServerTemplate inside try-catch
    const template = await rc.getServerTemplate();
    return template;
  } catch (error) {
    if ((error as any).code === 'remote-config/permission-denied') {
      throw new Error('Service account lacks Firebase Remote Config Viewer permission.');
    }
    throw error;
  }
}

// ──────────────────────────────────────────────
// 35. Machine Learning — createModel / publishModel / deleteModel — added 2026-06-25 depth pass 3 (deepen-stream-2)
// ──────────────────────────────────────────────

import { getMachineLearning } from 'firebase-admin/machine-learning';

// @expect-violation: ml-create-model-already-exists
// @expect-violation: ml-create-model-invalid-argument
async function gt_mlCreateModel_missing() {
  const ml = getMachineLearning();
  // SHOULD_FIRE: ml-create-model-already-exists / invalid-argument
  const model = await ml.createModel({
    displayName: 'my-classifier',
    tfliteModel: { gcsTfliteUri: 'gs://my-bucket/model.tflite' },
  });
  return model;
}

// @expect-clean
async function gt_mlCreateModel_proper() {
  const ml = getMachineLearning();
  try {
    // SHOULD_NOT_FIRE: createModel inside try-catch
    const model = await ml.createModel({
      displayName: 'my-classifier',
      tfliteModel: { gcsTfliteUri: 'gs://my-bucket/model.tflite' },
    });
    return model;
  } catch (error) {
    if ((error as any).code === 'machine-learning/already-exists') {
      // Model exists — retrieve and update instead
      throw new Error('Model already exists. Use updateModel() to update the existing model.');
    }
    if ((error as any).code === 'machine-learning/invalid-argument') {
      throw new Error('Invalid model options: check gcsTfliteUri format and display name.');
    }
    throw error;
  }
}

// @expect-violation: ml-publish-model-not-found
// @expect-violation: ml-publish-model-failed-precondition
async function gt_mlPublishModel_missing(modelId: string) {
  const ml = getMachineLearning();
  // SHOULD_FIRE: ml-publish-model-not-found / failed-precondition
  const model = await ml.publishModel(modelId);
  return model;
}

// @expect-clean
async function gt_mlPublishModel_proper(modelId: string) {
  const ml = getMachineLearning();
  try {
    // SHOULD_NOT_FIRE: publishModel inside try-catch
    const model = await ml.publishModel(modelId);
    return model;
  } catch (error) {
    if ((error as any).code === 'machine-learning/not-found') {
      throw new Error(`Model ${modelId} not found — verify the model was created successfully.`);
    }
    if ((error as any).code === 'machine-learning/failed-precondition') {
      throw new Error(`Model ${modelId} is locked — wait for processing to complete before publishing.`);
    }
    throw error;
  }
}

// @expect-violation: ml-delete-model-not-found
async function gt_mlDeleteModel_missing(modelId: string) {
  const ml = getMachineLearning();
  // SHOULD_FIRE: ml-delete-model-not-found
  await ml.deleteModel(modelId);
}

// @expect-clean
async function gt_mlDeleteModel_proper(modelId: string) {
  const ml = getMachineLearning();
  try {
    // SHOULD_NOT_FIRE: deleteModel inside try-catch
    await ml.deleteModel(modelId);
  } catch (error) {
    if ((error as any).code === 'machine-learning/not-found') {
      // Idempotent — model already deleted; treat as success
      return;
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────────────────────
// SecurityRules.releaseFirestoreRulesetFromSource (added 2026-06-26)
// ──────────────────────────────────────────────────────────────────

// @expect-violation: security-rules-release-firestore-invalid-argument
// @expect-violation: security-rules-release-firestore-auth-error
// @expect-violation: security-rules-release-firestore-resource-exhausted
async function gt_releaseFirestoreRulesetFromSource_missing(source: string) {
  const rules = getSecurityRules();
  // SHOULD_FIRE: security-rules-release-firestore-invalid-argument / auth-error / resource-exhausted
  await rules.releaseFirestoreRulesetFromSource(source);
}

// @expect-clean
async function gt_releaseFirestoreRulesetFromSource_proper(source: string) {
  const rules = getSecurityRules();
  try {
    // SHOULD_NOT_FIRE: releaseFirestoreRulesetFromSource inside try-catch
    await rules.releaseFirestoreRulesetFromSource(source);
  } catch (error) {
    if ((error as any).code === 'security-rules/invalid-argument') {
      throw new Error('Invalid rules source — must be a non-empty string or Buffer.');
    }
    if ((error as any).code === 'security-rules/authentication-error') {
      throw new Error('Service account lacks Security Rules admin permission.');
    }
    if ((error as any).code === 'security-rules/resource-exhausted') {
      throw new Error('Ruleset quota exhausted — clean up old rulesets before retrying.');
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────────────────────
// SecurityRules.releaseStorageRulesetFromSource (added 2026-06-26)
// ──────────────────────────────────────────────────────────────────

// @expect-violation: security-rules-release-storage-invalid-argument
// @expect-violation: security-rules-release-storage-auth-error
// @expect-violation: security-rules-release-storage-resource-exhausted
async function gt_releaseStorageRulesetFromSource_missing(source: string, bucket?: string) {
  const rules = getSecurityRules();
  // SHOULD_FIRE: security-rules-release-storage-invalid-argument / auth-error / resource-exhausted
  await rules.releaseStorageRulesetFromSource(source, bucket);
}

// @expect-clean
async function gt_releaseStorageRulesetFromSource_proper(source: string, bucket?: string) {
  const rules = getSecurityRules();
  try {
    // SHOULD_NOT_FIRE: releaseStorageRulesetFromSource inside try-catch
    await rules.releaseStorageRulesetFromSource(source, bucket);
  } catch (error) {
    if ((error as any).code === 'security-rules/invalid-argument') {
      throw new Error('Invalid rules source or bucket not configured.');
    }
    if ((error as any).code === 'security-rules/authentication-error') {
      throw new Error('Service account lacks Storage security rules admin permission.');
    }
    if ((error as any).code === 'security-rules/resource-exhausted') {
      throw new Error('Ruleset quota exhausted — delete old rulesets before retrying.');
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────────────────────
// SecurityRules.createRuleset (added 2026-06-26)
// ──────────────────────────────────────────────────────────────────

// @expect-violation: security-rules-create-ruleset-invalid-argument
// @expect-violation: security-rules-create-ruleset-auth-error
async function gt_createRuleset_missing(file: { name: string; content: string }) {
  const rules = getSecurityRules();
  // SHOULD_FIRE: security-rules-create-ruleset-invalid-argument / auth-error
  await rules.createRuleset(file);
}

// @expect-clean
async function gt_createRuleset_proper(file: { name: string; content: string }) {
  const rules = getSecurityRules();
  try {
    // SHOULD_NOT_FIRE: createRuleset inside try-catch
    const ruleset = await rules.createRuleset(file);
    return ruleset.name;
  } catch (error) {
    if ((error as any).code === 'security-rules/invalid-argument') {
      throw new Error('Invalid rules file — name and content must be non-empty strings.');
    }
    if ((error as any).code === 'security-rules/authentication-error') {
      throw new Error('Service account lacks permission to create rulesets.');
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────────────────────
// SecurityRules.deleteRuleset (added 2026-06-26)
// ──────────────────────────────────────────────────────────────────

// @expect-violation: security-rules-delete-ruleset-not-found
// @expect-violation: security-rules-delete-ruleset-invalid-argument
async function gt_deleteRuleset_missing(name: string) {
  const rules = getSecurityRules();
  // SHOULD_FIRE: security-rules-delete-ruleset-not-found / invalid-argument
  await rules.deleteRuleset(name);
}

// @expect-clean
async function gt_deleteRuleset_proper(name: string) {
  const rules = getSecurityRules();
  try {
    // SHOULD_NOT_FIRE: deleteRuleset inside try-catch
    await rules.deleteRuleset(name);
  } catch (error) {
    if ((error as any).code === 'security-rules/not-found') {
      // Idempotent in cleanup workflows — ruleset already gone
      return;
    }
    if ((error as any).code === 'security-rules/invalid-argument') {
      throw new Error('Invalid ruleset name — use the short name from RulesetMetadata.name.');
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────────────────────
// MachineLearning.updateModel (added 2026-06-26)
// ──────────────────────────────────────────────────────────────────

// @expect-violation: ml-update-model-not-found
// @expect-violation: ml-update-model-invalid-argument
// @expect-violation: ml-update-model-failed-precondition
async function gt_mlUpdateModel_missing(modelId: string, options: object) {
  const ml = getMachineLearning();
  // SHOULD_FIRE: ml-update-model-not-found / invalid-argument / failed-precondition
  await ml.updateModel(modelId, options);
}

// @expect-clean
async function gt_mlUpdateModel_proper(modelId: string, options: object) {
  const ml = getMachineLearning();
  try {
    // SHOULD_NOT_FIRE: updateModel inside try-catch
    const model = await ml.updateModel(modelId, options);
    return model;
  } catch (error) {
    if ((error as any).code === 'machine-learning/not-found') {
      throw new Error(`Model ${modelId} not found — create it first with createModel().`);
    }
    if ((error as any).code === 'machine-learning/invalid-argument') {
      throw new Error('Invalid model options — verify GCS URI format and display name.');
    }
    if ((error as any).code === 'machine-learning/failed-precondition') {
      throw new Error(`Model ${modelId} is locked — call waitForUnlocked() before updating.`);
    }
    throw error;
  }
}

// ──────────────────────────────────────────────────────────────────
// Installations.deleteInstallation (added 2026-06-26)
// ──────────────────────────────────────────────────────────────────

// @expect-violation: installations-delete-invalid-installation-id
// @expect-violation: installations-delete-api-error
async function gt_deleteInstallation_missing(fid: string) {
  const installations = getInstallations();
  // SHOULD_FIRE: installations-delete-invalid-installation-id / api-error
  await installations.deleteInstallation(fid);
}

// @expect-clean
async function gt_deleteInstallation_proper(fid: string) {
  const installations = getInstallations();
  try {
    // SHOULD_NOT_FIRE: deleteInstallation inside try-catch
    await installations.deleteInstallation(fid);
  } catch (error) {
    if ((error as any).code === 'installations/invalid-installation-id') {
      throw new Error('Invalid installation ID — must be a non-empty string.');
    }
    if ((error as any).code === 'installations/api-error') {
      const msg = (error as any).message || '';
      if (msg.includes('Failed to find') || msg.includes('Already deleted')) {
        // Idempotent in GDPR deletion flows — FID no longer exists
        return;
      }
      // Re-throw for rate-limit / server errors that need retry
      throw error;
    }
    throw error;
  }
}
