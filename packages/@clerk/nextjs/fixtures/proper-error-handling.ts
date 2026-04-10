/**
 * @clerk/nextjs - Proper Error Handling Examples
 *
 * All examples demonstrate CORRECT error handling patterns.
 * Should produce 0 violations.
 */

import { auth, currentUser, clerkMiddleware, getToken } from '@clerk/nextjs/server';
import { useSignIn, useSignUp, useClerk, isClerkAPIResponseError } from '@clerk/nextjs';
import { Webhook } from 'svix';
import { cache } from 'react';
import { useState } from 'react';

// ✅ CORRECT: Middleware properly configured
// File: src/middleware.ts
export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/'],
};

// ✅ CORRECT: auth() with null check
export async function GET_ProtectedRoute(req: Request) {
  const { userId, isAuthenticated } = await auth();

  if (!isAuthenticated || !userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return Response.json({ userId });
}

// ✅ CORRECT: Using auth.protect() with try-catch
export async function POST_ProtectedWithProtect(req: Request) {
  try {
    await (await auth()).protect();
    const { userId } = await auth();
    return Response.json({ userId });
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// ✅ CORRECT: currentUser() with null check
export async function GET_CurrentUser(req: Request) {
  const user = await currentUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return Response.json({ user });
}

// ✅ CORRECT: Cached currentUser() to avoid rate limits
const getCachedUser = cache(async () => {
  return await currentUser();
});

export async function Layout_WithCachedUser({ children }: { children: React.ReactNode }) {
  const user = await getCachedUser();

  return (
    <html>
      <body>
        <Navbar user={user} />
        <Sidebar user={user} />
        {children}
      </body>
    </html>
  );
}

// Mock components
function Navbar({ user }: { user: any }) { return null; }
function Sidebar({ user }: { user: any }) { return null; }

// ✅ CORRECT: getToken() with null check
export async function GET_WithToken(req: Request) {
  const token = await getToken();

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return Response.json({ token });
}

// ✅ CORRECT: signIn.create() with error handling
export function SignInForm_Proper() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [error, setError] = useState<string>('');

  const handleSubmit = async (email: string, password: string) => {
    if (!isLoaded || !signIn) return;

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result?.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        const error = err.errors[0];

        // Handle user lockout with meta information
        if (error?.code === 'user_locked') {
          const expiresIn = error.meta?.lockout_expires_in_seconds || 900;
          const unlockTime = new Date(Date.now() + expiresIn * 1000);
          setError(`Account locked until ${unlockTime.toLocaleTimeString()}`);
          return;
        }

        setError(error?.longMessage || 'Sign in failed');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {/* form fields */}
    </div>
  );
}

// ✅ CORRECT: signUp.create() with error handling
export function SignUpForm_Proper() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [error, setError] = useState<string>('');

  const handleSubmit = async (email: string, password: string) => {
    if (!isLoaded || !signUp) return;

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      if (result?.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        const errorMessage = err.errors[0]?.longMessage || 'Sign up failed';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {/* form fields */}
    </div>
  );
}

// ✅ CORRECT: Webhook signature verification
export async function POST_WebhookSecure(req: Request) {
  const payload = await req.text();
  const headers = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  };

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  const wh = new Webhook(webhookSecret);

  try {
    const event = wh.verify(payload, headers);

    // Safe to process verified event
    if (event.type === 'user.created') {
      console.log('User created:', event.data);
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }
}

// ✅ CORRECT: setActive() with error handling
export function SessionActivation_Proper() {
  const { setActive } = useClerk();
  const [error, setError] = useState<string>('');

  const activateSession = async (sessionId: string) => {
    try {
      await setActive({ session: sessionId });
    } catch (err) {
      setError('Failed to activate session');
      console.error(err);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

// ✅ CORRECT: useClerk() inside ClerkProvider context
export function Component_WithClerkProvider() {
  const clerk = useClerk();

  // This is safe because component is wrapped in ClerkProvider
  return <div>{clerk.loaded ? 'Clerk loaded' : 'Loading...'}</div>;
}

// Export all examples
export {
  GET_ProtectedRoute,
  POST_ProtectedWithProtect,
  GET_CurrentUser,
  Layout_WithCachedUser,
  GET_WithToken,
  SignInForm_Proper,
  SignUpForm_Proper,
  POST_WebhookSecure,
  SessionActivation_Proper,
  Component_WithClerkProvider,
};
