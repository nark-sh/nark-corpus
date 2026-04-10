/**
 * Fixture: missing-error-handling.ts
 *
 * Demonstrates MISSING error handling for firebase-admin operations.
 * Should produce multiple ERROR violations.
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://my-project.firebaseio.com'
});

// ================================================================================
// Authentication Service - MISSING ERROR HANDLING
// ================================================================================

/**
 * ❌ MISSING: No try-catch for verifyIdToken
 * Should trigger violation - token can be expired/invalid/revoked
 */
async function verifyTokenMissing(idToken: string) {
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  console.log('Token verified for user:', decodedToken.uid);
  return decodedToken;
}

/**
 * ❌ MISSING: No try-catch for createUser
 * Should trigger violation - email can already exist
 */
async function createUserMissing(email: string, password: string) {
  const userRecord = await admin.auth().createUser({
    email: email,
    password: password
  });
  console.log('User created:', userRecord.uid);
  return userRecord;
}

/**
 * ❌ MISSING: No try-catch for getUser
 * Should trigger violation - user may not exist
 */
async function getUserMissing(uid: string) {
  const userRecord = await admin.auth().getUser(uid);
  console.log('User:', userRecord.email);
  return userRecord;
}

/**
 * ❌ MISSING: No try-catch for updateUser
 * Should trigger violation - user may not exist, email may be taken
 */
async function updateUserMissing(uid: string, updates: any) {
  const userRecord = await admin.auth().updateUser(uid, updates);
  console.log('User updated:', userRecord.uid);
  return userRecord;
}

/**
 * ❌ MISSING: No try-catch for deleteUser
 * Should trigger violation - user may not exist
 */
async function deleteUserMissing(uid: string) {
  await admin.auth().deleteUser(uid);
  console.log('User deleted');
}

/**
 * ❌ MISSING: No try-catch for getUserByEmail
 * Should trigger violation - user may not exist
 */
async function getUserByEmailMissing(email: string) {
  const userRecord = await admin.auth().getUserByEmail(email);
  return userRecord;
}

/**
 * ❌ MISSING: No try-catch for setCustomUserClaims
 * Should trigger violation - user may not exist, claims may be invalid
 */
async function setCustomClaimsMissing(uid: string, claims: any) {
  await admin.auth().setCustomUserClaims(uid, claims);
  console.log('Claims set');
}

// ================================================================================
// Firestore Service - MISSING ERROR HANDLING
// ================================================================================

const db = admin.firestore();

/**
 * ❌ MISSING: No try-catch for Firestore get()
 * Should trigger violation - can fail with PERMISSION_DENIED, DEADLINE_EXCEEDED
 */
async function getDocumentMissing(docId: string) {
  const snapshot = await db.collection('users').doc(docId).get();
  return snapshot.data();
}

/**
 * ❌ MISSING: No try-catch for Firestore add()
 * Should trigger violation - can fail with RESOURCE_EXHAUSTED
 */
async function addDocumentMissing(data: any) {
  const docRef = await db.collection('users').add(data);
  return docRef.id;
}

/**
 * ❌ MISSING: No try-catch for Firestore set()
 * Should trigger violation - can fail with ABORTED, RESOURCE_EXHAUSTED
 */
async function setDocumentMissing(docId: string, data: any) {
  await db.collection('users').doc(docId).set(data);
  console.log('Document set');
}

/**
 * ❌ MISSING: No try-catch for Firestore update()
 * Should trigger violation - can fail with NOT_FOUND
 */
async function updateDocumentMissing(docId: string, updates: any) {
  await db.collection('users').doc(docId).update(updates);
  console.log('Document updated');
}

/**
 * ❌ MISSING: No try-catch for Firestore delete()
 * Should trigger violation - can fail with PERMISSION_DENIED
 */
async function deleteDocumentMissing(docId: string) {
  await db.collection('users').doc(docId).delete();
  console.log('Document deleted');
}

/**
 * ❌ MISSING: No try-catch for collection query
 * Should trigger violation
 */
async function queryCollectionMissing() {
  const snapshot = await db.collection('users').where('age', '>', 18).get();
  return snapshot.docs.map(doc => doc.data());
}

// ================================================================================
// Cloud Messaging Service - MISSING ERROR HANDLING
// ================================================================================

/**
 * ❌ MISSING: No try-catch for messaging send()
 * Should trigger violation - token can be invalid/expired
 */
async function sendMessageMissing(token: string, notification: any) {
  const message = {
    token: token,
    notification: notification
  };

  const response = await admin.messaging().send(message);
  console.log('Message sent');
  return response;
}

/**
 * ❌ MISSING: No try-catch for sendMulticast()
 * Should trigger violation - some tokens may fail
 */
async function sendMulticastMissing(tokens: string[], notification: any) {
  const message = {
    tokens: tokens,
    notification: notification
  };

  const response = await admin.messaging().sendMulticast(message);
  console.log('Messages sent');
  return response;
}

/**
 * ❌ MISSING: No try-catch for sendToTopic()
 * Should trigger violation - topic may be invalid
 */
async function sendToTopicMissing(topic: string, notification: any) {
  const message = {
    topic: topic,
    notification: notification
  };

  const response = await admin.messaging().send(message);
  return response;
}

// ================================================================================
// Realtime Database Service - MISSING ERROR HANDLING
// ================================================================================

const rtdb = admin.database();

/**
 * ❌ MISSING: No try-catch for database once()
 * Should trigger violation - can fail with PERMISSION_DENIED
 */
async function readDatabaseMissing(path: string) {
  const snapshot = await rtdb.ref(path).once('value');
  return snapshot.val();
}

/**
 * ❌ MISSING: No try-catch for database set()
 * Should trigger violation
 */
async function writeDatabaseMissing(path: string, data: any) {
  await rtdb.ref(path).set(data);
  console.log('Data written');
}

/**
 * ❌ MISSING: No try-catch for database update()
 * Should trigger violation
 */
async function updateDatabaseMissing(path: string, updates: any) {
  await rtdb.ref(path).update(updates);
  console.log('Data updated');
}

/**
 * ❌ MISSING: No try-catch for database remove()
 * Should trigger violation
 */
async function removeDatabaseMissing(path: string) {
  await rtdb.ref(path).remove();
  console.log('Data removed');
}

// ================================================================================
// Chained Calls - MISSING ERROR HANDLING
// ================================================================================

/**
 * ❌ MISSING: Multi-level chain without error handling
 * Should trigger violation
 */
async function chainedFirestoreMissing() {
  const doc = await admin.firestore().collection('users').doc('123').get();
  return doc.data();
}

/**
 * ❌ MISSING: Another chained call
 * Should trigger violation
 */
async function chainedAuthMissing(token: string) {
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded.uid;
}

/**
 * ❌ MISSING: Chained messaging call
 * Should trigger violation
 */
async function chainedMessagingMissing(token: string) {
  const result = await admin.messaging().send({
    token: token,
    notification: { title: 'Test', body: 'Test body' }
  });
  return result;
}

/**
 * ❌ MISSING: Chained database call
 * Should trigger violation
 */
async function chainedDatabaseMissing() {
  const snapshot = await admin.database().ref('users/123').once('value');
  return snapshot.val();
}

// Export for testing
export {
  verifyTokenMissing,
  createUserMissing,
  getUserMissing,
  updateUserMissing,
  deleteUserMissing,
  getUserByEmailMissing,
  setCustomClaimsMissing,
  getDocumentMissing,
  addDocumentMissing,
  setDocumentMissing,
  updateDocumentMissing,
  deleteDocumentMissing,
  queryCollectionMissing,
  sendMessageMissing,
  sendMulticastMissing,
  sendToTopicMissing,
  readDatabaseMissing,
  writeDatabaseMissing,
  updateDatabaseMissing,
  removeDatabaseMissing,
  chainedFirestoreMissing,
  chainedAuthMissing,
  chainedMessagingMissing,
  chainedDatabaseMissing
};
