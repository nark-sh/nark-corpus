/**
 * Firebase proper error handling fixtures.
 * All functions use try-catch — should produce ZERO violations.
 */
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, getAuth } from 'firebase/auth';
import { getDocs, addDoc, setDoc, updateDoc, deleteDoc, collection, doc, getFirestore, query, where } from 'firebase/firestore';

declare const GoogleAuthProvider: any;

// ────────────────────────────────────────────────────────────
// Auth — correct usage (all wrapped in try-catch)
// ────────────────────────────────────────────────────────────

async function loginWithEmailProper(email: string, password: string) {
  const auth = getAuth();
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error: any) {
    if (error.code === 'auth/wrong-password') throw new Error('Invalid password');
    throw error;
  }
}

async function registerProper(email: string, password: string) {
  const auth = getAuth();
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') throw new Error('Email taken');
    throw error;
  }
}

async function signInWithGoogleProper() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-blocked') throw new Error('Popup blocked');
    throw error;
  }
}

// ────────────────────────────────────────────────────────────
// Firestore — correct usage (all wrapped in try-catch)
// ────────────────────────────────────────────────────────────

async function getDocumentsProper(userId: string) {
  const db = getFirestore();
  try {
    const q = query(collection(db, 'items'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data());
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    throw error;
  }
}

async function addDocumentProper(data: Record<string, unknown>) {
  const db = getFirestore();
  try {
    const ref = await addDoc(collection(db, 'items'), data);
    return ref.id;
  } catch (error) {
    console.error('Failed to add document:', error);
    throw error;
  }
}

async function setDocumentProper(userId: string, data: Record<string, unknown>) {
  const db = getFirestore();
  try {
    await setDoc(doc(db, 'users', userId), data);
  } catch (error) {
    console.error('Failed to set document:', error);
    throw error;
  }
}

async function updateDocumentProper(itemId: string, updates: Record<string, unknown>) {
  const db = getFirestore();
  try {
    await updateDoc(doc(db, 'items', itemId), updates);
  } catch (error) {
    console.error('Failed to update document:', error);
    throw error;
  }
}

async function deleteDocumentProper(itemId: string) {
  const db = getFirestore();
  try {
    await deleteDoc(doc(db, 'items', itemId));
  } catch (error) {
    console.error('Failed to delete document:', error);
    throw error;
  }
}

// .catch() chained variant — also valid
async function loginWithCatch(email: string, password: string) {
  const auth = getAuth();
  return signInWithEmailAndPassword(auth, email, password).catch((error) => {
    console.error('Login failed:', error);
    throw error;
  });
}
