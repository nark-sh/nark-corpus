# Firebase — Sources

## Behavioral Claims

All functions can throw `FirebaseError` on network failure, permission denied, invalid credentials, or service errors. This is documented in the official Firebase JavaScript SDK reference.

## Official Documentation

### Error Handling
- https://firebase.google.com/docs/reference/js/auth.md#signinwithemailandpassword — signInWithEmailAndPassword throws with FirebaseError codes
- https://firebase.google.com/docs/reference/js/auth.md#createuserwithemailandpassword — createUserWithEmailAndPassword throws on weak password, email in use
- https://firebase.google.com/docs/reference/js/auth.md#signinwithpopup — signInWithPopup throws when popup blocked, user cancels
- https://firebase.google.com/docs/reference/js/firestore_.md#getdocs — getDocs throws on permission denied, network error
- https://firebase.google.com/docs/reference/js/firestore_.md#adddoc — addDoc throws on permission denied, invalid data
- https://firebase.google.com/docs/reference/js/firestore_.md#setdoc — setDoc throws on permission denied, invalid data
- https://firebase.google.com/docs/reference/js/firestore_.md#updatedoc — updateDoc throws on not-found, permission denied
- https://firebase.google.com/docs/reference/js/firestore_.md#deletedoc — deleteDoc throws on permission denied, network error

### Error Codes and Types
- https://firebase.google.com/docs/auth/admin/errors — Firebase Auth error codes (auth/wrong-password, auth/user-not-found, etc.)
- https://firebase.google.com/docs/firestore/query-data/get-data — Firestore read error handling
- https://firebase.google.com/docs/firestore/manage-data/add-data — Firestore write error handling

### Error Type Documentation
- https://firebase.google.com/docs/reference/js/app.firebaseerror.md — FirebaseError class (extends Error, has .code property)

## Real-World Evidence

### Correct Usage (0 violations)
- **namviek** (2.4k★) — `apps/frontend/libs/firebase.ts`: `signInWithPopup` wrapped in `.then().catch()` pattern
- **git-friend** (44★) — `context/auth-context.tsx`: `signInWithPopup` and `signOut` properly wrapped in try-catch

### Known Violation Pattern (manual confirmation)
- **venice** (~500★) — `connectors/connector-copilot/CopilotClient.ts:35-52`: `signInWithEmailAndPassword(auth, email, password).then(async (creds) => {...})` — no `.catch()` on the outer call. This is a TRUE POSITIVE violation.

## Package Versions Observed in Production
- 9.6.3 (hackernews-react-graphql)
- 9.8.1 (venice)
- 10.7.1 (namviek)
- 10.11.0 (Memex)
- 10.12.1 (penrose)
- 11.1.0 (upscayl)
- 11.3.1 (akveo/nebular)
- 12.7.0 (git-friend)

## Notes
- This contract covers the modular API (v9+) only. The v8 compat API (firebase/compat) uses different method signatures (namespace API like `firebase.auth()`) and is not covered.
- Functions are imported from sub-module paths (`firebase/auth`, `firebase/firestore`) which the analyzer normalizes to the `firebase` package.
- `deleteDoc()` does NOT throw if the document doesn't exist — it succeeds silently.
- `getAuth()`, `getFirestore()`, `collection()`, `doc()`, `query()`, `where()` are synchronous helpers and do NOT require try-catch.
