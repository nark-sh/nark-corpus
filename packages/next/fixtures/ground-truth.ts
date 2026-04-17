/**
 * Ground-truth fixtures for next package behavioral contracts.
 * Tests the new postconditions added in depth pass 2026-04-17.
 *
 * Annotations:
 *   @expect-violation: <postcondition-id>  — scanner SHOULD flag this
 *   @expect-clean                           — scanner should NOT flag this
 */

import { NextRequest, NextResponse } from 'next/server';
import { redirect, notFound, permanentRedirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { unstable_cache, revalidatePath, revalidateTag } from 'next/cache';

// ============================================================
// redirect() inside try-catch — VIOLATION (redirect-inside-try-catch)
// ============================================================

// @expect-violation: redirect-inside-try-catch
async function redirectInsideTryCatch(userId: string) {
  try {
    const user = await fetchUser(userId);
    if (!user) redirect('/login');  // redirect silently swallowed by catch!
    return user;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// @expect-clean
async function redirectOutsideTryCatch(userId: string) {
  let user;
  try {
    user = await fetchUser(userId);
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  if (!user) redirect('/login');  // redirect OUTSIDE try-catch — correct
  return user;
}

// ============================================================
// notFound() inside try-catch — VIOLATION (not-found-inside-try-catch)
// ============================================================

// @expect-violation: not-found-inside-try-catch
async function notFoundInsideTryCatch(postId: string) {
  try {
    const post = await fetchPost(postId);
    if (!post) notFound();  // notFound throw swallowed by catch!
    return post;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// @expect-clean
async function notFoundOutsideTryCatch(postId: string) {
  let post;
  try {
    post = await fetchPost(postId);
  } catch (error) {
    console.error('DB error:', error);
    throw error;
  }
  if (!post) notFound();  // notFound OUTSIDE try-catch — correct
  return post;
}

// ============================================================
// Server Action without auth check — VIOLATION (server-action-missing-auth-check)
// ============================================================

// @expect-violation: server-action-missing-auth-check
async function deletePostNoAuth(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  await deleteFromDB(id);  // no auth check — anyone can delete!
  revalidatePath('/posts');
}

// @expect-clean
async function deletePostWithAuth(formData: FormData) {
  'use server';
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  const id = formData.get('id') as string;
  await deleteFromDB(id);
  revalidatePath('/posts');
}

// ============================================================
// Server Action with redirect inside try-catch — VIOLATION (server-action-redirect-in-try-catch)
// ============================================================

// @expect-violation: server-action-redirect-in-try-catch
async function createPostWithRedirectInCatch(formData: FormData) {
  'use server';
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');

  try {
    const post = await createInDB({ title: formData.get('title') as string });
    redirect(`/posts/${post.id}`);  // redirect silently swallowed!
  } catch (error) {
    console.error('Error:', error);  // logs NEXT_REDIRECT error!
  }
}

// @expect-clean
async function createPostWithRedirectAfterCatch(formData: FormData) {
  'use server';
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');

  let postId: string;
  try {
    const post = await createInDB({ title: formData.get('title') as string });
    postId = post.id;
  } catch (error) {
    console.error('DB error:', error);
    return { error: 'Failed to create post' };
  }

  revalidatePath('/posts');
  redirect(`/posts/${postId}`);  // redirect OUTSIDE try-catch — correct
}

// ============================================================
// revalidatePath after redirect — VIOLATION (revalidate-after-redirect)
// ============================================================

// @expect-violation: revalidate-after-redirect
async function updatePostRevalidateAfterRedirect(formData: FormData) {
  'use server';
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');
  await updateInDB({ id: formData.get('id') as string });
  redirect('/posts');         // throws here
  revalidatePath('/posts');   // DEAD CODE — never executes!
}

// @expect-clean
async function updatePostRevalidateBeforeRedirect(formData: FormData) {
  'use server';
  const session = await getSession();
  if (!session?.user) throw new Error('Unauthorized');
  await updateInDB({ id: formData.get('id') as string });
  revalidatePath('/posts');  // revalidate BEFORE redirect — correct
  redirect('/posts');
}

// ============================================================
// Route handler without error handling — VIOLATION (route-handler-no-error-handling)
// ============================================================

// @expect-violation: route-handler-no-error-handling
export async function GET_no_error_handling(request: NextRequest) {
  const data = await fetchDataFromDB();  // no try-catch!
  return NextResponse.json({ data });
}

// @expect-clean
export async function GET_with_error_handling(request: NextRequest) {
  try {
    const data = await fetchDataFromDB();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================================================
// unstable_cache with context API inside — VIOLATION (unstable-cache-context-api-inside)
// ============================================================

// @expect-violation: unstable-cache-context-api-inside
const getCachedUserWrong = unstable_cache(
  async (userId: string) => {
    const cookieStore = await cookies();  // cookies() inside cache scope!
    const token = cookieStore.get('token')?.value;
    return fetchUserWithToken(userId, token ?? '');
  },
  ['user-data']
);

// @expect-clean
async function getCachedUserCorrect(userId: string) {
  const cookieStore = await cookies();  // cookies() OUTSIDE cache scope — correct
  const token = cookieStore.get('token')?.value;

  const getCached = unstable_cache(
    async (uid: string, authToken: string) => {
      return fetchUserWithToken(uid, authToken);  // no request-scoped APIs inside
    },
    [userId, 'user-data'],
    { tags: ['user-data'], revalidate: 60 }
  );

  return getCached(userId, token ?? '');
}

// ============================================================
// Stub functions (not part of behavioral contract tests)
// ============================================================

declare function fetchUser(id: string): Promise<{ id: string; name: string } | null>;
declare function fetchPost(id: string): Promise<{ id: string; title: string } | null>;
declare function deleteFromDB(id: string): Promise<void>;
declare function createInDB(data: { title: string }): Promise<{ id: string }>;
declare function updateInDB(data: { id: string }): Promise<void>;
declare function fetchDataFromDB(): Promise<unknown>;
declare function fetchUserWithToken(userId: string, token: string): Promise<unknown>;
declare function getSession(): Promise<{ user: { id: string } } | null>;
