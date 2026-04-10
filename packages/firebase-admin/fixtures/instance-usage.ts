/**
 * Fixture: instance-usage.ts
 *
 * Tests detection of firebase-admin method calls via instance variables.
 * Tests proper vs missing error handling on instances.
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://my-project.firebaseio.com'
});

// Create service instances
const auth = admin.auth();
const db = admin.firestore();
const messaging = admin.messaging();
const rtdb = admin.database();

// ================================================================================
// Instance Usage - PROPER ERROR HANDLING
// ================================================================================

/**
 * ✅ PROPER: Auth instance with error handling
 */
async function verifyWithInstanceProper(idToken: string) {
  try {
    const decoded = await auth.verifyIdToken(idToken);
    return decoded;
  } catch (error: any) {
    if (error.code === 'auth/id-token-expired') {
      console.error('Token expired');
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Firestore instance with error handling
 */
async function getDocWithInstanceProper(docId: string) {
  try {
    const snapshot = await db.collection('users').doc(docId).get();
    return snapshot.data();
  } catch (error: any) {
    console.error('Firestore error:', error.code);
    throw error;
  }
}

/**
 * ✅ PROPER: Messaging instance with error handling
 */
async function sendWithInstanceProper(token: string) {
  try {
    const result = await messaging.send({
      token: token,
      notification: { title: 'Test', body: 'Test' }
    });
    return result;
  } catch (error: any) {
    if (error.code === 'messaging/invalid-recipient') {
      console.error('Invalid token');
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Database instance with error handling
 */
async function readWithInstanceProper(path: string) {
  try {
    const snapshot = await rtdb.ref(path).once('value');
    return snapshot.val();
  } catch (error: any) {
    console.error('Database error:', error.code);
    throw error;
  }
}

// ================================================================================
// Instance Usage - MISSING ERROR HANDLING
// ================================================================================

/**
 * ❌ MISSING: Auth instance without error handling
 * Should trigger violation
 */
async function verifyWithInstanceMissing(idToken: string) {
  const decoded = await auth.verifyIdToken(idToken);
  return decoded.uid;
}

/**
 * ❌ MISSING: Create user via instance without error handling
 * Should trigger violation
 */
async function createUserInstanceMissing(email: string) {
  const userRecord = await auth.createUser({
    email: email,
    password: 'password123'
  });
  return userRecord.uid;
}

/**
 * ❌ MISSING: Get user via instance without error handling
 * Should trigger violation
 */
async function getUserInstanceMissing(uid: string) {
  const userRecord = await auth.getUser(uid);
  return userRecord.email;
}

/**
 * ❌ MISSING: Firestore instance without error handling
 * Should trigger violation
 */
async function getDocWithInstanceMissing(docId: string) {
  const snapshot = await db.collection('users').doc(docId).get();
  return snapshot.data();
}

/**
 * ❌ MISSING: Firestore add via instance without error handling
 * Should trigger violation
 */
async function addDocInstanceMissing(data: any) {
  const docRef = await db.collection('users').add(data);
  return docRef.id;
}

/**
 * ❌ MISSING: Firestore update via instance without error handling
 * Should trigger violation
 */
async function updateDocInstanceMissing(docId: string, updates: any) {
  await db.collection('users').doc(docId).update(updates);
  console.log('Updated');
}

/**
 * ❌ MISSING: Messaging instance without error handling
 * Should trigger violation
 */
async function sendWithInstanceMissing(token: string) {
  const result = await messaging.send({
    token: token,
    notification: { title: 'Test', body: 'Test' }
  });
  return result;
}

/**
 * ❌ MISSING: Multicast via instance without error handling
 * Should trigger violation
 */
async function multicastInstanceMissing(tokens: string[]) {
  const result = await messaging.sendMulticast({
    tokens: tokens,
    notification: { title: 'Test', body: 'Test' }
  });
  return result;
}

/**
 * ❌ MISSING: Database instance without error handling
 * Should trigger violation
 */
async function readWithInstanceMissing(path: string) {
  const snapshot = await rtdb.ref(path).once('value');
  return snapshot.val();
}

/**
 * ❌ MISSING: Database set via instance without error handling
 * Should trigger violation
 */
async function writeInstanceMissing(path: string, data: any) {
  await rtdb.ref(path).set(data);
  console.log('Written');
}

// ================================================================================
// Local Variable Instances - MISSING ERROR HANDLING
// ================================================================================

/**
 * ❌ MISSING: Local auth instance without error handling
 * Should trigger violation
 */
async function localAuthInstanceMissing() {
  const localAuth = admin.auth();
  const user = await localAuth.getUser('user123');
  return user.email;
}

/**
 * ❌ MISSING: Local db instance without error handling
 * Should trigger violation
 */
async function localDbInstanceMissing() {
  const localDb = admin.firestore();
  const snapshot = await localDb.collection('users').doc('123').get();
  return snapshot.data();
}

/**
 * ❌ MISSING: Local messaging instance without error handling
 * Should trigger violation
 */
async function localMessagingInstanceMissing() {
  const localMessaging = admin.messaging();
  const result = await localMessaging.send({
    token: 'device-token',
    notification: { title: 'Hi', body: 'There' }
  });
  return result;
}

/**
 * ❌ MISSING: Local database instance without error handling
 * Should trigger violation
 */
async function localDatabaseInstanceMissing() {
  const localRtdb = admin.database();
  const snapshot = await localRtdb.ref('users').once('value');
  return snapshot.val();
}

// ================================================================================
// Chained Instance Calls - MISSING ERROR HANDLING
// ================================================================================

/**
 * ❌ MISSING: Chained call on auth instance
 * Should trigger violation
 */
async function chainedAuthInstanceMissing(token: string) {
  const result = await auth.verifyIdToken(token);
  return result.uid;
}

/**
 * ❌ MISSING: Chained call on firestore instance with multiple levels
 * Should trigger violation
 */
async function chainedFirestoreInstanceMissing() {
  const data = await db.collection('users').doc('123').get();
  return data.data();
}

/**
 * ❌ MISSING: Chained messaging instance
 * Should trigger violation
 */
async function chainedMessagingInstanceMissing() {
  const response = await messaging.send({
    topic: 'news',
    notification: { title: 'News', body: 'Latest' }
  });
  return response;
}

/**
 * ❌ MISSING: Chained database ref with once
 * Should trigger violation
 */
async function chainedDatabaseInstanceMissing() {
  const value = await rtdb.ref('settings').once('value');
  return value.val();
}

// Export for testing
export {
  verifyWithInstanceProper,
  getDocWithInstanceProper,
  sendWithInstanceProper,
  readWithInstanceProper,
  verifyWithInstanceMissing,
  createUserInstanceMissing,
  getUserInstanceMissing,
  getDocWithInstanceMissing,
  addDocInstanceMissing,
  updateDocInstanceMissing,
  sendWithInstanceMissing,
  multicastInstanceMissing,
  readWithInstanceMissing,
  writeInstanceMissing,
  localAuthInstanceMissing,
  localDbInstanceMissing,
  localMessagingInstanceMissing,
  localDatabaseInstanceMissing,
  chainedAuthInstanceMissing,
  chainedFirestoreInstanceMissing,
  chainedMessagingInstanceMissing,
  chainedDatabaseInstanceMissing
};
