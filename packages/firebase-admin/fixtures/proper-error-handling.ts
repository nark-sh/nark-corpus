/**
 * Fixture: proper-error-handling.ts
 *
 * Demonstrates PROPER error handling for firebase-admin operations.
 * Should produce 0 violations.
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin (in real app, use service account)
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://my-project.firebaseio.com'
});

// ================================================================================
// Authentication Service - PROPER ERROR HANDLING
// ================================================================================

/**
 * ✅ PROPER: Verify ID token with error handling
 * Catches expired, invalid, and revoked tokens
 */
async function verifyTokenProper(idToken: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('Token verified for user:', decodedToken.uid);
    return decodedToken;
  } catch (error: any) {
    if (error.code === 'auth/id-token-expired') {
      console.error('Token expired - require re-authentication');
    } else if (error.code === 'auth/id-token-revoked') {
      console.error('Token revoked - user must sign in again');
    } else if (error.code === 'auth/argument-error') {
      console.error('Invalid token format');
    } else {
      console.error('Token verification failed:', error.message);
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Create user with duplicate email handling
 */
async function createUserProper(email: string, password: string) {
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: false
    });
    console.log('Successfully created user:', userRecord.uid);
    return userRecord;
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      console.error('Email already registered:', email);
      // Could suggest password reset here
    } else if (error.code === 'auth/invalid-email') {
      console.error('Invalid email format:', email);
    } else if (error.code === 'auth/invalid-password') {
      console.error('Password must be at least 6 characters');
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Get user with not-found handling
 */
async function getUserProper(uid: string) {
  try {
    const userRecord = await admin.auth().getUser(uid);
    console.log('Found user:', userRecord.email);
    return userRecord;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.error('User not found:', uid);
      return null; // Graceful handling
    } else if (error.code === 'auth/invalid-uid') {
      console.error('Invalid UID format:', uid);
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Update user with error handling
 */
async function updateUserProper(uid: string, updates: any) {
  try {
    const userRecord = await admin.auth().updateUser(uid, updates);
    console.log('User updated:', userRecord.uid);
    return userRecord;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.error('Cannot update - user not found');
    } else if (error.code === 'auth/email-already-exists') {
      console.error('Email already taken by another user');
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Delete user with graceful not-found handling
 */
async function deleteUserProper(uid: string) {
  try {
    await admin.auth().deleteUser(uid);
    console.log('User deleted:', uid);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log('User already deleted (idempotent)');
      return; // Graceful - already deleted
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Get user by email
 */
async function getUserByEmailProper(email: string) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return userRecord;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log('No account with this email');
      return null;
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Set custom claims with validation
 */
async function setCustomClaimsProper(uid: string, claims: any) {
  try {
    await admin.auth().setCustomUserClaims(uid, claims);
    console.log('Custom claims set for user:', uid);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.error('Cannot set claims - user not found');
    } else if (error.code === 'auth/invalid-claims') {
      console.error('Claims exceed 1000 bytes or use reserved keys');
    }
    throw error;
  }
}

// ================================================================================
// Firestore Service - PROPER ERROR HANDLING
// ================================================================================

const db = admin.firestore();

/**
 * ✅ PROPER: Get document with existence check
 */
async function getDocumentProper(docId: string) {
  try {
    const docRef = db.collection('users').doc(docId);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      console.log('Document not found');
      return null;
    }

    return snapshot.data();
  } catch (error: any) {
    if (error.code === 7) { // PERMISSION_DENIED
      console.error('Permission denied - check security rules');
    } else if (error.code === 4) { // DEADLINE_EXCEEDED
      console.error('Operation timed out - retry with backoff');
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Add document with quota handling
 */
async function addDocumentProper(data: any) {
  try {
    const docRef = await db.collection('users').add(data);
    console.log('Document added:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    if (error.code === 8) { // RESOURCE_EXHAUSTED
      console.error('Write quota exceeded - enable billing or reduce rate');
    } else if (error.code === 7) { // PERMISSION_DENIED
      console.error('Permission denied - check security rules');
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Set document with contention handling
 */
async function setDocumentProper(docId: string, data: any) {
  try {
    await db.collection('users').doc(docId).set(data);
    console.log('Document set:', docId);
  } catch (error: any) {
    if (error.code === 10) { // ABORTED (transaction contention)
      console.error('Transaction aborted - retry with backoff');
    } else if (error.code === 8) { // RESOURCE_EXHAUSTED
      console.error('Write quota exceeded');
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Update document with not-found handling
 */
async function updateDocumentProper(docId: string, updates: any) {
  try {
    await db.collection('users').doc(docId).update(updates);
    console.log('Document updated:', docId);
  } catch (error: any) {
    if (error.code === 5) { // NOT_FOUND
      console.error('Document does not exist - use set() with merge instead');
    } else if (error.code === 10) { // ABORTED
      console.error('Transaction aborted - retry');
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Delete document
 */
async function deleteDocumentProper(docId: string) {
  try {
    await db.collection('users').doc(docId).delete();
    console.log('Document deleted:', docId);
  } catch (error: any) {
    if (error.code === 7) { // PERMISSION_DENIED
      console.error('Permission denied');
    }
    throw error;
  }
}

// ================================================================================
// Cloud Messaging Service - PROPER ERROR HANDLING
// ================================================================================

/**
 * ✅ PROPER: Send message with invalid token handling
 */
async function sendMessageProper(token: string, notification: any) {
  try {
    const message = {
      token: token,
      notification: notification
    };

    const response = await admin.messaging().send(message);
    console.log('Message sent:', response);
    return response;
  } catch (error: any) {
    if (error.code === 'messaging/invalid-recipient') {
      console.error('Token is invalid or expired - remove from database');
      // In real app: remove token from database
    } else if (error.code === 'messaging/invalid-argument') {
      console.error('Message payload is malformed or too large');
    } else if (error.code === 'messaging/quota-exceeded') {
      console.error('FCM rate limit exceeded - implement backoff');
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Send to multiple devices with partial failure handling
 */
async function sendMulticastProper(tokens: string[], notification: any) {
  try {
    const message = {
      tokens: tokens,
      notification: notification
    };

    const response = await admin.messaging().sendMulticast(message);

    // Check for partial failures
    if (response.failureCount > 0) {
      console.warn(`${response.failureCount} messages failed`);

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send to token ${idx}:`, resp.error?.code);
          // Remove invalid tokens from database
          if (resp.error?.code === 'messaging/invalid-recipient') {
            console.log('Token invalid, should remove:', tokens[idx]);
          }
        }
      });
    }

    return response;
  } catch (error: any) {
    console.error('Multicast send failed:', error.code);
    throw error;
  }
}

/**
 * ✅ PROPER: Send to topic with topic validation
 */
async function sendToTopicProper(topic: string, notification: any) {
  try {
    const message = {
      topic: topic,
      notification: notification
    };

    const response = await admin.messaging().send(message);
    console.log('Topic message sent:', response);
    return response;
  } catch (error: any) {
    if (error.code === 'messaging/invalid-argument') {
      console.error('Invalid topic name - must match /topics/[a-zA-Z0-9-_.~%]+');
    }
    throw error;
  }
}

// ================================================================================
// Realtime Database Service - PROPER ERROR HANDLING
// ================================================================================

const rtdb = admin.database();

/**
 * ✅ PROPER: Read database with error handling
 */
async function readDatabaseProper(path: string) {
  try {
    const snapshot = await rtdb.ref(path).once('value');
    const data = snapshot.val();
    console.log('Data read from:', path);
    return data;
  } catch (error: any) {
    if (error.code === 'PERMISSION_DENIED') {
      console.error('Permission denied - check database rules');
    } else {
      console.error('Network error - retry with backoff');
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Write database
 */
async function writeDatabaseProper(path: string, data: any) {
  try {
    await rtdb.ref(path).set(data);
    console.log('Data written to:', path);
  } catch (error: any) {
    if (error.code === 'PERMISSION_DENIED') {
      console.error('Permission denied');
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Update database
 */
async function updateDatabaseProper(path: string, updates: any) {
  try {
    await rtdb.ref(path).update(updates);
    console.log('Data updated at:', path);
  } catch (error: any) {
    if (error.code === 'PERMISSION_DENIED') {
      console.error('Permission denied');
    }
    throw error;
  }
}

/**
 * ✅ PROPER: Delete database data
 */
async function removeDatabaseProper(path: string) {
  try {
    await rtdb.ref(path).remove();
    console.log('Data removed from:', path);
  } catch (error: any) {
    if (error.code === 'PERMISSION_DENIED') {
      console.error('Permission denied');
    }
    throw error;
  }
}

// Export for testing
export {
  verifyTokenProper,
  createUserProper,
  getUserProper,
  updateUserProper,
  deleteUserProper,
  getUserByEmailProper,
  setCustomClaimsProper,
  getDocumentProper,
  addDocumentProper,
  setDocumentProper,
  updateDocumentProper,
  deleteDocumentProper,
  sendMessageProper,
  sendMulticastProper,
  sendToTopicProper,
  readDatabaseProper,
  writeDatabaseProper,
  updateDatabaseProper,
  removeDatabaseProper
};
