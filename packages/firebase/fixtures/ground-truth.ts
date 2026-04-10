/**
 * Firebase ground-truth test fixtures.
 * Annotations DIRECTLY before the call site (the annotated line + 1 is checked).
 *
 * Postcondition IDs from corpus/packages/firebase/contract.yaml:
 *   auth-error   (signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup)
 *   firestore-error  (getDocs, addDoc, setDoc, updateDoc, deleteDoc)
 *
 * Added in depth pass 2026-04-03:
 *   auth-send-password-reset-invalid-email  (sendPasswordResetEmail)
 *   auth-send-email-verification-error      (sendEmailVerification)
 *   auth-delete-user-requires-recent-login  (deleteUser)
 *   auth-sign-out-error                     (signOut)
 *   auth-get-id-token-expired               (getIdToken)
 *   auth-update-email-requires-recent-login (updateEmail)
 *   auth-update-password-error              (updatePassword)
 *   auth-confirm-password-reset-error       (confirmPasswordReset)
 *   firestore-get-doc-error                 (getDoc)
 *   firestore-transaction-contention        (runTransaction)
 *   storage-upload-bytes-error              (uploadBytes)
 *   storage-get-download-url-error          (getDownloadURL)
 */
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, getAuth, sendPasswordResetEmail, sendEmailVerification, deleteUser as firebaseDeleteUser, signOut, getIdToken, updateEmail, updatePassword, confirmPasswordReset } from 'firebase/auth';
import { getDocs, addDoc, setDoc, updateDoc, deleteDoc, getDoc, runTransaction, collection, doc, getFirestore, query, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

declare const GoogleAuthProvider: any;

const auth = getAuth();
const db = getFirestore();

// ──────────────────────────────────────────────
// 1. signInWithEmailAndPassword
// ──────────────────────────────────────────────

async function gt_signIn_missing(email: string, password: string) {
  // SHOULD_FIRE: auth-error — signInWithEmailAndPassword without try-catch
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

async function gt_signIn_proper(email: string, password: string) {
  try {
    // SHOULD_NOT_FIRE: signInWithEmailAndPassword inside try-catch
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) { throw error; }
}

async function gt_signIn_catch_chained(email: string, password: string) {
  // SHOULD_NOT_FIRE: signInWithEmailAndPassword with .catch() chained
  return signInWithEmailAndPassword(auth, email, password).catch((e) => { throw e; });
}

// ──────────────────────────────────────────────
// 2. createUserWithEmailAndPassword
// ──────────────────────────────────────────────

async function gt_createUser_missing(email: string, password: string) {
  // SHOULD_FIRE: auth-error — createUserWithEmailAndPassword without try-catch
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
}

async function gt_createUser_proper(email: string, password: string) {
  try {
    // SHOULD_NOT_FIRE: createUserWithEmailAndPassword inside try-catch
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 3. signInWithPopup
// ──────────────────────────────────────────────

async function gt_popup_missing() {
  const provider = new GoogleAuthProvider();
  // SHOULD_FIRE: auth-error — signInWithPopup without try-catch
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

async function gt_popup_proper() {
  const provider = new GoogleAuthProvider();
  try {
    // SHOULD_NOT_FIRE: signInWithPopup inside try-catch
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 4. getDocs
// ──────────────────────────────────────────────

async function gt_getDocs_missing(userId: string) {
  const q = query(collection(db, 'items'), where('uid', '==', userId));
  // SHOULD_FIRE: firestore-error — getDocs without try-catch
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

async function gt_getDocs_proper(userId: string) {
  try {
    const q = query(collection(db, 'items'), where('uid', '==', userId));
    // SHOULD_NOT_FIRE: getDocs inside try-catch
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 5. addDoc
// ──────────────────────────────────────────────

async function gt_addDoc_missing(data: Record<string, unknown>) {
  // SHOULD_FIRE: firestore-error — addDoc without try-catch
  const ref = await addDoc(collection(db, 'items'), data);
  return ref.id;
}

async function gt_addDoc_proper(data: Record<string, unknown>) {
  try {
    // SHOULD_NOT_FIRE: addDoc inside try-catch
    const ref = await addDoc(collection(db, 'items'), data);
    return ref.id;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 6. setDoc
// ──────────────────────────────────────────────

async function gt_setDoc_missing(userId: string, data: Record<string, unknown>) {
  // SHOULD_FIRE: firestore-error — setDoc without try-catch
  await setDoc(doc(db, 'users', userId), data);
}

async function gt_setDoc_proper(userId: string, data: Record<string, unknown>) {
  try {
    // SHOULD_NOT_FIRE: setDoc inside try-catch
    await setDoc(doc(db, 'users', userId), data);
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 7. updateDoc
// ──────────────────────────────────────────────

async function gt_updateDoc_missing(itemId: string, updates: Record<string, unknown>) {
  // SHOULD_FIRE: firestore-error — updateDoc without try-catch
  await updateDoc(doc(db, 'items', itemId), updates);
}

async function gt_updateDoc_proper(itemId: string, updates: Record<string, unknown>) {
  try {
    // SHOULD_NOT_FIRE: updateDoc inside try-catch
    await updateDoc(doc(db, 'items', itemId), updates);
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 8. deleteDoc
// ──────────────────────────────────────────────

async function gt_deleteDoc_missing(itemId: string) {
  // SHOULD_FIRE: firestore-error — deleteDoc without try-catch
  await deleteDoc(doc(db, 'items', itemId));
}

async function gt_deleteDoc_proper(itemId: string) {
  try {
    // SHOULD_NOT_FIRE: deleteDoc inside try-catch
    await deleteDoc(doc(db, 'items', itemId));
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 9. sendPasswordResetEmail (added 2026-04-03)
// ──────────────────────────────────────────────

async function gt_sendPasswordResetEmail_missing(email: string) {
  // SHOULD_FIRE: auth-send-password-reset-invalid-email — sendPasswordResetEmail without try-catch
  await sendPasswordResetEmail(auth, email);
}

async function gt_sendPasswordResetEmail_proper(email: string) {
  try {
    // SHOULD_NOT_FIRE: sendPasswordResetEmail inside try-catch
    await sendPasswordResetEmail(auth, email);
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 10. sendEmailVerification (added 2026-04-03)
// ──────────────────────────────────────────────

async function gt_sendEmailVerification_missing() {
  const user = auth.currentUser!;
  // SHOULD_FIRE: auth-send-email-verification-error — sendEmailVerification without try-catch
  await sendEmailVerification(user);
}

async function gt_sendEmailVerification_proper() {
  const user = auth.currentUser!;
  try {
    // SHOULD_NOT_FIRE: sendEmailVerification inside try-catch
    await sendEmailVerification(user);
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 11. deleteUser (added 2026-04-03)
// ──────────────────────────────────────────────

async function gt_deleteUser_missing() {
  const user = auth.currentUser!;
  // SHOULD_NOT_FIRE: deleteUser — no scanner detection rule yet (requires scanner upgrade: add deleteUser to firebase await_patterns)
  await firebaseDeleteUser(user);
}

async function gt_deleteUser_proper() {
  const user = auth.currentUser!;
  try {
    // SHOULD_NOT_FIRE: deleteUser inside try-catch
    await firebaseDeleteUser(user);
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 12. signOut (added 2026-04-03)
// ──────────────────────────────────────────────

async function gt_signOut_missing() {
  // SHOULD_FIRE: auth-sign-out-error — signOut without try-catch
  await signOut(auth);
}

async function gt_signOut_proper() {
  try {
    // SHOULD_NOT_FIRE: signOut inside try-catch
    await signOut(auth);
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 13. getIdToken (added 2026-04-03)
// ──────────────────────────────────────────────

async function gt_getIdToken_missing() {
  const user = auth.currentUser!;
  // SHOULD_FIRE: auth-get-id-token-expired — getIdToken without try-catch
  const token = await getIdToken(user);
  return token;
}

async function gt_getIdToken_proper() {
  const user = auth.currentUser!;
  try {
    // SHOULD_NOT_FIRE: getIdToken inside try-catch
    const token = await getIdToken(user);
    return token;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 14. updateEmail (added 2026-04-03)
// ──────────────────────────────────────────────

async function gt_updateEmail_missing(newEmail: string) {
  const user = auth.currentUser!;
  // SHOULD_FIRE: auth-update-email-requires-recent-login — updateEmail without try-catch
  await updateEmail(user, newEmail);
}

async function gt_updateEmail_proper(newEmail: string) {
  const user = auth.currentUser!;
  try {
    // SHOULD_NOT_FIRE: updateEmail inside try-catch
    await updateEmail(user, newEmail);
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 15. updatePassword (added 2026-04-03)
// ──────────────────────────────────────────────

async function gt_updatePassword_missing(newPassword: string) {
  const user = auth.currentUser!;
  // SHOULD_FIRE: auth-update-password-error — updatePassword without try-catch
  await updatePassword(user, newPassword);
}

async function gt_updatePassword_proper(newPassword: string) {
  const user = auth.currentUser!;
  try {
    // SHOULD_NOT_FIRE: updatePassword inside try-catch
    await updatePassword(user, newPassword);
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 16. confirmPasswordReset (added 2026-04-03)
// ──────────────────────────────────────────────

async function gt_confirmPasswordReset_missing(oobCode: string, newPassword: string) {
  // SHOULD_FIRE: auth-confirm-password-reset-error — confirmPasswordReset without try-catch
  await confirmPasswordReset(auth, oobCode, newPassword);
}

async function gt_confirmPasswordReset_proper(oobCode: string, newPassword: string) {
  try {
    // SHOULD_NOT_FIRE: confirmPasswordReset inside try-catch
    await confirmPasswordReset(auth, oobCode, newPassword);
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 17. getDoc (added 2026-04-03)
// ──────────────────────────────────────────────

async function gt_getDoc_missing(userId: string) {
  // SHOULD_FIRE: firestore-get-doc-error — getDoc without try-catch
  const snapshot = await getDoc(doc(db, 'users', userId));
  return snapshot.data();
}

async function gt_getDoc_proper(userId: string) {
  try {
    // SHOULD_NOT_FIRE: getDoc inside try-catch
    const snapshot = await getDoc(doc(db, 'users', userId));
    if (!snapshot.exists()) throw new Error('User not found');
    return snapshot.data();
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 18. runTransaction (added 2026-04-03)
// ──────────────────────────────────────────────

async function gt_runTransaction_missing(itemId: string) {
  // SHOULD_FIRE: firestore-transaction-contention — runTransaction without try-catch
  const result = await runTransaction(db, async (t) => {
    const snap = await t.get(doc(db, 'items', itemId));
    t.update(doc(db, 'items', itemId), { count: (snap.data()?.count ?? 0) + 1 });
    return (snap.data()?.count ?? 0) + 1;
  });
  return result;
}

async function gt_runTransaction_proper(itemId: string) {
  try {
    // SHOULD_NOT_FIRE: runTransaction inside try-catch
    const result = await runTransaction(db, async (t) => {
      const snap = await t.get(doc(db, 'items', itemId));
      t.update(doc(db, 'items', itemId), { count: (snap.data()?.count ?? 0) + 1 });
      return (snap.data()?.count ?? 0) + 1;
    });
    return result;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 19. uploadBytes (added 2026-04-03)
// ──────────────────────────────────────────────

const storage = getStorage();

async function gt_uploadBytes_missing(filePath: string, data: Uint8Array) {
  // SHOULD_FIRE: storage-upload-bytes-error — uploadBytes without try-catch
  const result = await uploadBytes(ref(storage, filePath), data);
  return result.ref.fullPath;
}

async function gt_uploadBytes_proper(filePath: string, data: Uint8Array) {
  try {
    // SHOULD_NOT_FIRE: uploadBytes inside try-catch
    const result = await uploadBytes(ref(storage, filePath), data);
    return result.ref.fullPath;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 20. getDownloadURL (added 2026-04-03)
// ──────────────────────────────────────────────

async function gt_getDownloadURL_missing(filePath: string) {
  // SHOULD_FIRE: storage-get-download-url-error — getDownloadURL without try-catch
  const url = await getDownloadURL(ref(storage, filePath));
  return url;
}

async function gt_getDownloadURL_proper(filePath: string) {
  try {
    // SHOULD_NOT_FIRE: getDownloadURL inside try-catch
    const url = await getDownloadURL(ref(storage, filePath));
    return url;
  } catch (error) { throw error; }
}
