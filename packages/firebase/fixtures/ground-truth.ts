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
 *
 * Added in depth pass 2026-04-17 (deepen-stream-2 pass 3):
 *   email-link-expired-or-invalid                        (signInWithEmailLink)
 *   anonymous-auth-not-enabled-or-quota-exceeded         (signInAnonymously)
 *   update-profile-error                                 (updateProfile)
 *   link-credential-conflict                             (linkWithCredential)
 *   reauth-credential-error                              (reauthenticateWithCredential)
 *   verify-before-update-email-error                     (verifyBeforeUpdateEmail)
 *   batch-commit-permission-denied                       (writeBatch.commit)
 *   count-from-server-error                              (getCountFromServer)
 *   delete-object-error                                  (deleteObject)
 *   functions-call-unauthenticated-or-permission-denied  (httpsCallable — no detector yet)
 */
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, getAuth, sendPasswordResetEmail, sendEmailVerification, deleteUser as firebaseDeleteUser, signOut, getIdToken, updateEmail, updatePassword, confirmPasswordReset, signInWithEmailLink, signInAnonymously, updateProfile, linkWithCredential, reauthenticateWithCredential, verifyBeforeUpdateEmail, EmailAuthProvider } from 'firebase/auth';
import { getDocs, addDoc, setDoc, updateDoc, deleteDoc, getDoc, runTransaction, collection, doc, getFirestore, query, where, writeBatch, getCountFromServer } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

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
  const docRef = await addDoc(collection(db, 'items'), data);
  return docRef.id;
}

async function gt_addDoc_proper(data: Record<string, unknown>) {
  try {
    // SHOULD_NOT_FIRE: addDoc inside try-catch
    const docRef = await addDoc(collection(db, 'items'), data);
    return docRef.id;
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

// ──────────────────────────────────────────────
// 21. signInWithEmailLink (added 2026-04-17)
// ──────────────────────────────────────────────

async function gt_signInWithEmailLink_missing(email: string, emailLink: string) {
  // SHOULD_FIRE: email-link-expired-or-invalid — signInWithEmailLink without try-catch
  const result = await signInWithEmailLink(auth, email, emailLink);
  return result.user;
}

async function gt_signInWithEmailLink_proper(email: string, emailLink: string) {
  try {
    // SHOULD_NOT_FIRE: signInWithEmailLink inside try-catch
    const result = await signInWithEmailLink(auth, email, emailLink);
    return result.user;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 22. signInAnonymously (added 2026-04-17)
// ──────────────────────────────────────────────

async function gt_signInAnonymously_missing() {
  // SHOULD_FIRE: anonymous-auth-not-enabled-or-quota-exceeded — signInAnonymously without try-catch
  const result = await signInAnonymously(auth);
  return result.user;
}

async function gt_signInAnonymously_proper() {
  try {
    // SHOULD_NOT_FIRE: signInAnonymously inside try-catch
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 23. updateProfile (added 2026-04-17)
// ──────────────────────────────────────────────

async function gt_updateProfile_missing(displayName: string) {
  const user = auth.currentUser!;
  // SHOULD_FIRE: update-profile-error — updateProfile without try-catch
  await updateProfile(user, { displayName });
}

async function gt_updateProfile_proper(displayName: string) {
  const user = auth.currentUser!;
  try {
    // SHOULD_NOT_FIRE: updateProfile inside try-catch
    await updateProfile(user, { displayName });
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 24. linkWithCredential (added 2026-04-17)
// ──────────────────────────────────────────────

async function gt_linkWithCredential_missing(email: string, password: string) {
  const user = auth.currentUser!;
  const credential = EmailAuthProvider.credential(email, password);
  // SHOULD_FIRE: link-credential-conflict — linkWithCredential without try-catch
  const result = await linkWithCredential(user, credential);
  return result.user;
}

async function gt_linkWithCredential_proper(email: string, password: string) {
  const user = auth.currentUser!;
  const credential = EmailAuthProvider.credential(email, password);
  try {
    // SHOULD_NOT_FIRE: linkWithCredential inside try-catch
    const result = await linkWithCredential(user, credential);
    return result.user;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 25. reauthenticateWithCredential (added 2026-04-17)
// ──────────────────────────────────────────────

async function gt_reauthenticate_missing(email: string, password: string) {
  const user = auth.currentUser!;
  const credential = EmailAuthProvider.credential(email, password);
  // SHOULD_FIRE: reauth-credential-error — reauthenticateWithCredential without try-catch
  await reauthenticateWithCredential(user, credential);
}

async function gt_reauthenticate_proper(email: string, password: string) {
  const user = auth.currentUser!;
  const credential = EmailAuthProvider.credential(email, password);
  try {
    // SHOULD_NOT_FIRE: reauthenticateWithCredential inside try-catch
    await reauthenticateWithCredential(user, credential);
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 26. verifyBeforeUpdateEmail (added 2026-04-17)
// ──────────────────────────────────────────────

async function gt_verifyBeforeUpdateEmail_missing(newEmail: string) {
  const user = auth.currentUser!;
  // SHOULD_FIRE: verify-before-update-email-error — verifyBeforeUpdateEmail without try-catch
  await verifyBeforeUpdateEmail(user, newEmail);
}

async function gt_verifyBeforeUpdateEmail_proper(newEmail: string) {
  const user = auth.currentUser!;
  try {
    // SHOULD_NOT_FIRE: verifyBeforeUpdateEmail inside try-catch
    await verifyBeforeUpdateEmail(user, newEmail);
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 27. writeBatch.commit (added 2026-04-17)
// ──────────────────────────────────────────────

async function gt_batchCommit_missing(userId: string, data: Record<string, unknown>) {
  const batch = writeBatch(db);
  batch.set(doc(db, 'users', userId), data);
  batch.update(doc(db, 'counters', 'users'), { count: 1 });
  // SHOULD_FIRE: batch-commit-permission-denied — batch.commit() without try-catch
  await batch.commit();
}

async function gt_batchCommit_proper(userId: string, data: Record<string, unknown>) {
  const batch = writeBatch(db);
  batch.set(doc(db, 'users', userId), data);
  batch.update(doc(db, 'counters', 'users'), { count: 1 });
  try {
    // SHOULD_NOT_FIRE: batch.commit() inside try-catch
    await batch.commit();
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 28. getCountFromServer (added 2026-04-17)
// ──────────────────────────────────────────────

async function gt_getCountFromServer_missing(userId: string) {
  const q = query(collection(db, 'orders'), where('userId', '==', userId));
  // SHOULD_FIRE: count-from-server-error — getCountFromServer without try-catch
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

async function gt_getCountFromServer_proper(userId: string) {
  const q = query(collection(db, 'orders'), where('userId', '==', userId));
  try {
    // SHOULD_NOT_FIRE: getCountFromServer inside try-catch
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 29. deleteObject (added 2026-04-17)
// ──────────────────────────────────────────────

async function gt_deleteObject_missing(filePath: string) {
  // SHOULD_FIRE: delete-object-error — deleteObject without try-catch
  await deleteObject(ref(storage, filePath));
}

async function gt_deleteObject_proper(filePath: string) {
  try {
    // SHOULD_NOT_FIRE: deleteObject inside try-catch
    await deleteObject(ref(storage, filePath));
  } catch (error) { throw error; }
}

// ──────────────────────────────────────────────
// 30. httpsCallable (added 2026-04-17)
// Note: no scanner detector yet — httpsCallable returns a callable fn, not an awaitable.
// Scanner concern queued: concern-20260417-firebase-deepen-1
// ──────────────────────────────────────────────

const functions = getFunctions();

async function gt_httpsCallable_missing(email: string, orgId: string) {
  const sendInvite = httpsCallable(functions, 'sendInvite');
  // SHOULD_NOT_FIRE: httpsCallable result called without try-catch (no detector yet — concern queued)
  const result = await sendInvite({ email, organizationId: orgId });
  return result.data;
}

async function gt_httpsCallable_proper(email: string, orgId: string) {
  const sendInvite = httpsCallable(functions, 'sendInvite');
  try {
    // SHOULD_NOT_FIRE: httpsCallable result called inside try-catch
    const result = await sendInvite({ email, organizationId: orgId });
    return result.data;
  } catch (error) { throw error; }
}
