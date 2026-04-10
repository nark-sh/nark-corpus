/**
 * Firebase MISSING error handling fixtures.
 * All functions lack try-catch — should produce ERROR violations.
 */
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, getAuth } from 'firebase/auth';
import { getDocs, addDoc, setDoc, updateDoc, deleteDoc, collection, doc, getFirestore, query, where } from 'firebase/firestore';

declare const GoogleAuthProvider: any;

// ────────────────────────────────────────────────────────────
// Auth — MISSING try-catch (should ALL fire violations)
// ────────────────────────────────────────────────────────────

// ❌ No try-catch on signInWithEmailAndPassword
async function loginMissing(email: string, password: string) {
  const auth = getAuth();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// ❌ No try-catch on createUserWithEmailAndPassword
async function registerMissing(email: string, password: string) {
  const auth = getAuth();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// ❌ No try-catch on signInWithPopup
async function signInGoogleMissing() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// ────────────────────────────────────────────────────────────
// Firestore — MISSING try-catch (should ALL fire violations)
// ────────────────────────────────────────────────────────────

// ❌ No try-catch on getDocs
async function getDocumentsMissing(userId: string) {
  const db = getFirestore();
  const q = query(collection(db, 'items'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data());
}

// ❌ No try-catch on addDoc
async function addDocumentMissing(data: Record<string, unknown>) {
  const db = getFirestore();
  const ref = await addDoc(collection(db, 'items'), data);
  return ref.id;
}

// ❌ No try-catch on setDoc
async function setDocumentMissing(userId: string, data: Record<string, unknown>) {
  const db = getFirestore();
  await setDoc(doc(db, 'users', userId), data);
}

// ❌ No try-catch on updateDoc
async function updateDocumentMissing(itemId: string, updates: Record<string, unknown>) {
  const db = getFirestore();
  await updateDoc(doc(db, 'items', itemId), updates);
}

// ❌ No try-catch on deleteDoc
async function deleteDocumentMissing(itemId: string) {
  const db = getFirestore();
  await deleteDoc(doc(db, 'items', itemId));
}
