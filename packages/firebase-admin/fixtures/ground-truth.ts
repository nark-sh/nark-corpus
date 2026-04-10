/**
 * firebase-admin ground-truth test fixtures.
 * Annotations DIRECTLY before the call site (annotated line + 1 is checked).
 *
 * Contracted functions from corpus/packages/firebase-admin/contract.yaml:
 *   Auth: verifyIdToken, createUser, getUser, updateUser, deleteUser, getUserByEmail, setCustomUserClaims
 *   Auth (new): createSessionCookie, verifySessionCookie, createCustomToken, revokeRefreshTokens, generatePasswordResetLink
 *   Firestore: get, add, set, update, delete
 *   Firestore (new): runTransaction, commit (WriteBatch)
 *   Messaging: send, sendMulticast
 *   Messaging (new): sendEach, subscribeToTopic
 *   RTDB: once, set, update, remove
 *
 * Detection note: namespace API (admin.auth()) and stored instances are fully detected.
 * Modular getAuth().verifyIdToken() pattern is not currently detected (analyzer limitation).
 * Modular getFirestore().collection().get() and getDatabase().ref().once() ARE detected.
 */

import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getDatabase } from 'firebase-admin/database';

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
