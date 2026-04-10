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
