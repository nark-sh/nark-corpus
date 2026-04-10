/**
 * Supabase Fixtures - Missing Error Handling
 *
 * These examples demonstrate INCORRECT error handling (missing try-catch).
 * Should trigger ERROR violations if analyzer can detect builder patterns.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://example.supabase.co',
  process.env.SUPABASE_KEY || 'dummy-key'
);

/**
 * ❌ Missing try-catch for select query
 * Should trigger ERROR violation (if detected)
 */
async function fetchUsersWithoutErrorHandling() {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  // ❌ No try-catch, no error check
  return data;
}

/**
 * ❌ Missing try-catch for insert
 * Should trigger ERROR violation (if detected)
 */
async function insertUserWithoutErrorHandling(user: { name: string; email: string }) {
  const { data } = await supabase
    .from('users')
    .insert(user);
  
  return data;
}

/**
 * ❌ Missing try-catch for update
 * Should trigger ERROR violation (if detected)
 */
async function updateUserWithoutErrorHandling(id: number, name: string) {
  const { data } = await supabase
    .from('users')
    .update({ name })
    .eq('id', id);
  
  return data;
}

/**
 * ❌ Missing try-catch for delete
 * Should trigger ERROR violation (if detected)
 */
async function deleteUserWithoutErrorHandling(id: number) {
  const { data } = await supabase
    .from('users')
    .delete()
    .eq('id', id);
  
  return data;
}

/**
 * ❌ Missing try-catch for RPC call
 * Should trigger ERROR violation (if detected)
 */
async function callRpcWithoutErrorHandling(param: string) {
  const { data } = await supabase
    .rpc('my_function', { param });
  
  return data;
}
