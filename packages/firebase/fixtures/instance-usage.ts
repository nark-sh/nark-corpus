/**
 * Firebase instance usage patterns.
 * Tests detection when firebase functions are passed db/auth instances.
 */
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { getDocs, addDoc, collection, getFirestore, query, where } from 'firebase/firestore';

// Module-level instances — common pattern
const auth = getAuth();
const db = getFirestore();

// ❌ Using module-level auth instance without try-catch
async function loginNoTryCatch(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ✅ Using module-level auth instance WITH try-catch
async function loginWithTryCatch(email: string, password: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// ❌ Using module-level db instance without try-catch
async function queryNoTryCatch(userId: string) {
  const q = query(collection(db, 'tasks'), where('uid', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

// ✅ Using module-level db instance WITH try-catch
async function queryWithTryCatch(userId: string) {
  try {
    const q = query(collection(db, 'tasks'), where('uid', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    console.error('Query failed:', error);
    throw error;
  }
}

// ❌ Function receiving db as parameter, no try-catch
async function createTaskNoTryCatch(taskData: Record<string, unknown>) {
  const ref = await addDoc(collection(db, 'tasks'), taskData);
  return ref.id;
}
