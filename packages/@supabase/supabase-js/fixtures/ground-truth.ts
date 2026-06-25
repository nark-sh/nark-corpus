/**
 * @supabase/supabase-js Ground-Truth Fixture
 *
 * Tests the builder-pattern result API: supabase.from('table').select/insert/update/delete/rpc()
 * Supabase does NOT throw — it returns { data, error }. The contract requires wrapping in
 * try-catch so that any thrown network or auth errors are handled.
 *
 * Annotation format:
 *   // SHOULD_FIRE: <postcondition-id> — <reason>   (line AFTER = call site)
 *   // SHOULD_NOT_FIRE: <reason>                     (line AFTER = call site)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://example.supabase.co',
  process.env.SUPABASE_KEY || 'dummy-key'
);

// ──────────────────────────────────────────────────────────────────────────────
// MISSING error handling (should fire)
// ──────────────────────────────────────────────────────────────────────────────

async function missingSelect() {
  // SHOULD_FIRE: rls-policy-violation — no try-catch around select builder chain
  const { data, error } = await supabase
    .from('users')
    .select('*');
  return data;
}

async function missingInsert() {
  // SHOULD_FIRE: rls-policy-violation — no try-catch around insert
  const { data } = await supabase
    .from('users')
    .insert({ name: 'Alice', email: 'alice@example.com' });
  return data;
}

async function missingUpdate() {
  // SHOULD_FIRE: rls-policy-violation — no try-catch around update builder chain
  const { data } = await supabase
    .from('users')
    .update({ name: 'Bob' })
    .eq('id', 1);
  return data;
}

async function missingDelete() {
  // SHOULD_FIRE: rls-policy-violation — no try-catch around delete builder chain
  const { data } = await supabase
    .from('users')
    .delete()
    .eq('id', 1);
  return data;
}

async function missingRpc() {
  // SHOULD_FIRE: function-not-found — no try-catch around rpc call
  const { data } = await supabase
    .rpc('my_function', { param: 'value' });
  return data;
}

// ──────────────────────────────────────────────────────────────────────────────
// PROPER error handling (should NOT fire)
// ──────────────────────────────────────────────────────────────────────────────

async function properSelect() {
  try {
    // SHOULD_NOT_FIRE: select is wrapped in try-catch
    const { data, error } = await supabase
      .from('users')
      .select('*');
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Query failed:', err);
    throw err;
  }
}

async function properInsert() {
  try {
    // SHOULD_NOT_FIRE: insert is wrapped in try-catch
    const { data, error } = await supabase
      .from('users')
      .insert({ name: 'Alice', email: 'alice@example.com' })
      .select();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Insert failed:', err);
    throw err;
  }
}

async function properRpc() {
  try {
    // SHOULD_NOT_FIRE: rpc is wrapped in try-catch
    const { data, error } = await supabase.rpc('my_function', { param: 'value' });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('RPC failed:', err);
    throw err;
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// signOut — missing error handling (should fire)
// ──────────────────────────────────────────────────────────────────────────────

async function missingSignOut() {
  // SHOULD_FIRE: signout-session-missing — signOut() result not checked for error
  await supabase.auth.signOut();
  // caller ignores { error } entirely
}

// ──────────────────────────────────────────────────────────────────────────────
// signOut — proper error handling (should NOT fire)
// ──────────────────────────────────────────────────────────────────────────────

async function properSignOut() {
  // SHOULD_NOT_FIRE: error field is checked
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error.message);
    // Still clear local state even if remote revocation failed
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// getSession — missing error handling (should fire)
// ──────────────────────────────────────────────────────────────────────────────

async function missingGetSession() {
  // SHOULD_FIRE: session-refresh-token-expired — getSession() result not checked for error
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ──────────────────────────────────────────────────────────────────────────────
// getSession — proper error handling (should NOT fire)
// ──────────────────────────────────────────────────────────────────────────────

async function properGetSession() {
  // SHOULD_NOT_FIRE: error field is checked
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Session error:', error.message, error.code);
    return null;
  }
  return data.session;
}

// ──────────────────────────────────────────────────────────────────────────────
// storage.upload — missing error handling (should fire)
// ──────────────────────────────────────────────────────────────────────────────

async function missingStorageUpload(file: File) {
  // SHOULD_FIRE: storage-upload-bucket-not-found — upload result not checked for error
  const { data } = await supabase.storage
    .from('avatars')
    .upload(`public/${file.name}`, file);
  return data;
}

// ──────────────────────────────────────────────────────────────────────────────
// storage.upload — proper error handling (should NOT fire)
// ──────────────────────────────────────────────────────────────────────────────

async function properStorageUpload(file: File) {
  // SHOULD_NOT_FIRE: error field is checked, size validated, duplicate handled
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large. Maximum size is 5 MB.');
  }
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`public/${file.name}`, file, { upsert: true });
  if (error) {
    if (error.message.includes('Bucket not found')) {
      throw new Error('Storage bucket not configured');
    }
    throw new Error(`Upload failed: ${error.message}`);
  }
  return data;
}

// ──────────────────────────────────────────────────────────────────────────────
// functions.invoke — missing error handling (should fire)
// ──────────────────────────────────────────────────────────────────────────────

async function missingFunctionsInvoke() {
  // SHOULD_FIRE: functions-invoke-http-error — invoke result not checked for error
  const { data } = await supabase.functions.invoke('process-webhook', {
    body: { event: 'user.created' },
  });
  return data;
}

// ──────────────────────────────────────────────────────────────────────────────
// functions.invoke — proper error handling (should NOT fire)
// ──────────────────────────────────────────────────────────────────────────────

async function properFunctionsInvoke() {
  // SHOULD_NOT_FIRE: error field is checked, error types are distinguished
  const { data, error } = await supabase.functions.invoke('process-webhook', {
    body: { event: 'user.created' },
  });
  if (error) {
    // Distinguish between function error, relay error, and network error
    const { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } = await import('@supabase/supabase-js');
    if (error instanceof FunctionsHttpError) {
      const errorBody = await error.context.json();
      console.error('Function error:', errorBody);
    } else if (error instanceof FunctionsRelayError) {
      console.error('Relay error (transient):', error.message);
    } else if (error instanceof FunctionsFetchError) {
      console.error('Network error (retryable):', error.message);
    }
    throw error;
  }
  return data;
}

// ──────────────────────────────────────────────────────────────────────────────
// signInWithOtp / verifyOtp — missing error handling (should fire)
// ──────────────────────────────────────────────────────────────────────────────

async function missingSignInWithOtp(email: string) {
  // SHOULD_FIRE: signin-otp-rate-limit — { error } not checked
  const { data } = await supabase.auth.signInWithOtp({ email });
  return data;
}

async function missingVerifyOtp(email: string, token: string) {
  // SHOULD_FIRE: verify-otp-invalid-code — { error } not checked
  const { data } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  return data;
}

async function properSignInWithOtp(email: string) {
  // SHOULD_NOT_FIRE: error checked, rate-limit code surfaced to user
  const { data, error } = await supabase.auth.signInWithOtp({ email });
  if (error) {
    if (error.code === 'over_email_send_rate_limit') {
      throw new Error('Too many requests. Try again in a few minutes.');
    }
    if (error.code === 'signup_disabled' || error.code === 'otp_disabled') {
      throw new Error('Passwordless sign-in is not available.');
    }
    throw error;
  }
  return data;
}

// ──────────────────────────────────────────────────────────────────────────────
// getUser / updateUser / refreshSession — missing error handling (should fire)
// ──────────────────────────────────────────────────────────────────────────────

async function missingGetUser() {
  // SHOULD_FIRE: get-user-session-expired — { error } not checked
  const { data } = await supabase.auth.getUser();
  return data.user;
}

async function missingUpdateUser(password: string) {
  // SHOULD_FIRE: update-user-weak-password — { error } not checked, no weak-password handling
  const { data } = await supabase.auth.updateUser({ password });
  return data;
}

async function missingRefreshSession() {
  // SHOULD_FIRE: refresh-session-token-revoked — { error } not checked
  const { data } = await supabase.auth.refreshSession();
  return data.session;
}

async function properGetUser() {
  // SHOULD_NOT_FIRE: error checked, 401 routes to sign-in
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    if (error.status === 401) {
      throw new Error('Not authenticated');
    }
    throw error;
  }
  return data.user;
}

async function properUpdateUser(password: string, nonce?: string) {
  // SHOULD_NOT_FIRE: weak_password and reauthentication_needed codes handled
  const { data, error } = await supabase.auth.updateUser({ password, nonce });
  if (error) {
    if (error.code === 'weak_password') {
      throw new Error(`Password too weak: ${error.message}`);
    }
    if (error.code === 'reauthentication_needed') {
      await supabase.auth.reauthenticate();
      throw new Error('Please enter the code we just emailed you.');
    }
    throw error;
  }
  return data;
}

// ──────────────────────────────────────────────────────────────────────────────
// exchangeCodeForSession — missing error handling (should fire)
// ──────────────────────────────────────────────────────────────────────────────

async function missingExchangeCode(code: string) {
  // SHOULD_FIRE: exchange-code-pkce-verifier-missing — { error } not checked
  const { data } = await supabase.auth.exchangeCodeForSession(code);
  return data.session;
}

async function properExchangeCode(code: string) {
  // SHOULD_NOT_FIRE: error checked, expired-code branch handled
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    if (error.code === 'otp_expired' || error.code === 'flow_state_expired') {
      throw new Error('This sign-in link expired. Request a new one.');
    }
    if (error.name === 'AuthPKCECodeVerifierMissingError') {
      throw new Error('Open this link in the same browser you started in.');
    }
    throw error;
  }
  return data.session;
}

// ──────────────────────────────────────────────────────────────────────────────
// storage.download / createSignedUrl — missing error handling (should fire)
// ──────────────────────────────────────────────────────────────────────────────

async function missingStorageDownload(path: string) {
  // SHOULD_FIRE: storage-download-not-found — { error } not checked
  const { data } = await supabase.storage.from('private-files').download(path);
  return data;
}

async function missingCreateSignedUrl(path: string) {
  // SHOULD_FIRE: storage-signed-url-not-found — { error } not checked
  const { data } = await supabase.storage.from('private-files').createSignedUrl(path, 3600);
  return data?.signedUrl;
}

async function properStorageDownload(path: string) {
  // SHOULD_NOT_FIRE: error checked, 404 vs 403 collapsed for security
  const { data, error } = await supabase.storage.from('private-files').download(path);
  if (error) {
    // Don't leak the difference between not-found and unauthorized to end users.
    throw new Error('File unavailable');
  }
  return data;
}

async function properCreateSignedUrl(path: string) {
  // SHOULD_NOT_FIRE: error checked before returning the signed URL
  const { data, error } = await supabase.storage
    .from('private-files')
    .createSignedUrl(path, 3600);
  if (error) {
    throw new Error(`Could not generate signed URL: ${error.message}`);
  }
  return data.signedUrl;
}

// ──────────────────────────────────────────────────────────────────────────────
// auth.getUserIdentities
// ──────────────────────────────────────────────────────────────────────────────

async function missingGetUserIdentities() {
  // FUTURE_FIRE: auth-get-identities-no-session — { error } not checked, session may be missing (scanner concern queued: concern-20260625-supabase-js-deepen-1)
  const { data } = await supabase.auth.getUserIdentities();
  return data?.identities;
}

async function properGetUserIdentities() {
  // SHOULD_NOT_FIRE: error checked before accessing identities
  const { data, error } = await supabase.auth.getUserIdentities();
  if (error) {
    throw new Error(`Failed to get identities: ${error.message}`);
  }
  return data.identities;
}

// ──────────────────────────────────────────────────────────────────────────────
// auth.linkIdentity
// ──────────────────────────────────────────────────────────────────────────────

async function missingLinkIdentity() {
  // FUTURE_FIRE: auth-link-identity-already-exists — { error } not checked for identity_already_exists (scanner concern queued: concern-20260625-supabase-js-deepen-2)
  const { data } = await supabase.auth.linkIdentity({ provider: 'github' });
  return data;
}

async function properLinkIdentity() {
  // SHOULD_NOT_FIRE: error checked and identity_already_exists handled explicitly
  const { data, error } = await supabase.auth.linkIdentity({ provider: 'github' });
  if (error) {
    if ((error as any).code === 'identity_already_exists') {
      throw new Error('This GitHub account is already linked to your profile.');
    }
    if ((error as any).code === 'manual_linking_disabled') {
      throw new Error('Account linking is not available.');
    }
    throw error;
  }
  return data;
}

// ──────────────────────────────────────────────────────────────────────────────
// auth.unlinkIdentity
// ──────────────────────────────────────────────────────────────────────────────

async function missingUnlinkIdentity(identity: any) {
  // FUTURE_FIRE: auth-unlink-identity-single-identity — { error } not checked before completing unlink (DATA_LOSS: user lockout) (scanner concern queued: concern-20260625-supabase-js-deepen-3)
  const { data } = await supabase.auth.unlinkIdentity(identity);
  return data;
}

async function properUnlinkIdentity(identity: any) {
  // SHOULD_NOT_FIRE: single_identity_not_deletable checked explicitly (DATA_LOSS guard)
  const { data, error } = await supabase.auth.unlinkIdentity(identity);
  if (error) {
    if ((error as any).code === 'single_identity_not_deletable') {
      throw new Error(
        'Cannot remove your only sign-in method. Set a password first.'
      );
    }
    if ((error as any).code === 'email_conflict_identity_not_deletable') {
      throw new Error('Cannot unlink this identity due to an email conflict.');
    }
    throw error;
  }
  return data;
}

// ──────────────────────────────────────────────────────────────────────────────
// storage.update
// ──────────────────────────────────────────────────────────────────────────────

async function missingStorageUpdate(path: string, file: File) {
  // FUTURE_FIRE: storage-update-not-found — { error } not checked; object may not exist (scanner concern queued: concern-20260625-supabase-js-deepen-4)
  const { data } = await supabase.storage
    .from('avatars')
    .update(path, file);
  return data;
}

async function properStorageUpdate(path: string, file: File) {
  // SHOULD_NOT_FIRE: error checked before treating update as successful
  const { data, error } = await supabase.storage
    .from('avatars')
    .update(path, file);
  if (error) {
    throw new Error(`Storage update failed: ${error.message}`);
  }
  return data;
}

// ──────────────────────────────────────────────────────────────────────────────
// storage.createSignedUploadUrl
// ──────────────────────────────────────────────────────────────────────────────

async function missingCreateSignedUploadUrl(path: string) {
  // FUTURE_FIRE: storage-create-signed-upload-url-no-token — { error } not checked (scanner concern queued: concern-20260625-supabase-js-deepen-5)
  const { data } = await supabase.storage
    .from('uploads')
    .createSignedUploadUrl(path);
  return data?.signedUrl;
}

async function properCreateSignedUploadUrl(path: string) {
  // SHOULD_NOT_FIRE: error checked before returning signed URL to client
  const { data, error } = await supabase.storage
    .from('uploads')
    .createSignedUploadUrl(path);
  if (error) {
    throw new Error(`Failed to create upload URL: ${error.message}`);
  }
  return data.signedUrl;
}

// ──────────────────────────────────────────────────────────────────────────────
// storage.uploadToSignedUrl
// ──────────────────────────────────────────────────────────────────────────────

async function missingUploadToSignedUrl(path: string, token: string, file: File) {
  // FUTURE_FIRE: storage-upload-to-signed-url-expired-token — { error } not checked; token may be expired (scanner concern queued: concern-20260625-supabase-js-deepen-6)
  const { data } = await supabase.storage
    .from('uploads')
    .uploadToSignedUrl(path, token, file);
  return data;
}

async function properUploadToSignedUrl(path: string, token: string, file: File) {
  // SHOULD_NOT_FIRE: error checked and token-expiry handled with clear user message
  const { data, error } = await supabase.storage
    .from('uploads')
    .uploadToSignedUrl(path, token, file);
  if (error) {
    if (error.message?.includes('expired') || error.message?.includes('Invalid token')) {
      throw new Error('Upload link expired. Please request a new upload link.');
    }
    throw new Error(`Upload failed: ${error.message}`);
  }
  return data;
}
