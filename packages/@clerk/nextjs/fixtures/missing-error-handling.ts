/**
 * @clerk/nextjs - Missing Error Handling Examples
 *
 * All examples demonstrate INCORRECT error handling patterns.
 * Should produce multiple violations.
 */

import { auth, currentUser, getToken } from '@clerk/nextjs/server';
import { useSignIn, useSignUp, useClerk } from '@clerk/nextjs';
import { useState } from 'react';

// ❌ VIOLATION: auth() called but no middleware.ts file exists
// This represents the case where middleware is missing entirely
// (In a real scenario, this would be detected by checking for src/middleware.ts)

// ❌ VIOLATION: auth() result used without null check
export async function GET_UnprotectedRoute(req: Request) {
  const { userId } = await auth();

  // No check for null/undefined - will crash if not authenticated
  return Response.json({ userId });
}

// ❌ VIOLATION: auth.protect() without try-catch
export async function POST_ProtectWithoutCatch(req: Request) {
  // This will throw if not authenticated, but no try-catch
  await (await auth()).protect();

  const { userId } = await auth();
  return Response.json({ userId });
}

// ❌ VIOLATION: currentUser() without null check
export async function GET_CurrentUserNoCheck(req: Request) {
  const user = await currentUser();

  // Directly accessing properties without null check
  return Response.json({
    email: user.emailAddresses[0].emailAddress, // Will crash if user is null
  });
}

// ❌ VIOLATION: Multiple currentUser() calls without caching (Rate limit risk)
export async function Layout_MultipleCurrentUserCalls({ children }: { children: React.ReactNode }) {
  const user1 = await currentUser(); // API call #1
  const user2 = await currentUser(); // API call #2 (duplicate!)
  const user3 = await currentUser(); // API call #3 (duplicate!)

  return (
    <html>
      <body>
        <Navbar user={user1} />
        <Sidebar user={user2} />
        <Footer user={user3} />
        {children}
      </body>
    </html>
  );
}

// Mock components
function Navbar({ user }: { user: any }) { return null; }
function Sidebar({ user }: { user: any }) { return null; }
function Footer({ user }: { user: any }) { return null; }

// ❌ VIOLATION: getToken() result used without null check
export async function GET_TokenNoCheck(req: Request) {
  const token = await getToken();

  // Using token without checking if null
  return Response.json({ token: token.substring(0, 10) }); // Will crash if token is null
}

// ❌ VIOLATION: signIn.create() without try-catch
export function SignInForm_NoErrorHandling() {
  const { signIn, setActive } = useSignIn();

  const handleSubmit = async (email: string, password: string) => {
    // No try-catch - errors will be unhandled
    const result = await signIn?.create({
      identifier: email,
      password,
    });

    if (result?.status === 'complete') {
      await setActive({ session: result.createdSessionId });
    }
  };

  // No error display
  return <div>{/* form fields */}</div>;
}

// ❌ VIOLATION: signIn.create() catches error but doesn't display it to user
export function SignInForm_NoErrorDisplay() {
  const { signIn, setActive } = useSignIn();

  const handleSubmit = async (email: string, password: string) => {
    try {
      const result = await signIn?.create({
        identifier: email,
        password,
      });

      if (result?.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      }
    } catch (err) {
      // Error caught but not displayed - silent failure
      console.log('Error occurred:', err);
    }
  };

  // No error state or display
  return <div>{/* form fields */}</div>;
}

// ❌ VIOLATION: user_locked error doesn't show lockout_expires_in_seconds
export function SignInForm_NoLockoutMeta() {
  const { signIn, setActive } = useSignIn();
  const [error, setError] = useState<string>('');

  const handleSubmit = async (email: string, password: string) => {
    try {
      const result = await signIn?.create({
        identifier: email,
        password,
      });

      if (result?.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      }
    } catch (err: any) {
      if (err.errors?.[0]?.code === 'user_locked') {
        // Missing: lockout_expires_in_seconds from meta
        setError('Account locked. Try again later.');
      } else {
        setError('Sign in failed');
      }
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

// ❌ VIOLATION: signUp.create() without try-catch
export function SignUpForm_NoErrorHandling() {
  const { signUp, setActive } = useSignUp();

  const handleSubmit = async (email: string, password: string) => {
    // No try-catch - errors will be unhandled
    const result = await signUp?.create({
      emailAddress: email,
      password,
    });

    if (result?.status === 'complete') {
      await setActive({ session: result.createdSessionId });
    }
  };

  return <div>{/* form fields */}</div>;
}

// ❌ VIOLATION: Webhook endpoint without signature verification
export async function POST_WebhookInsecure(req: Request) {
  const event = await req.json();

  // CRITICAL SECURITY FLAW: No signature verification
  // Processes any webhook payload without validating it came from Clerk
  if (event.type === 'user.created') {
    console.log('User created:', event.data);
    // Process unverified data - allows forgery
  }

  return Response.json({ success: true });
}

// ❌ VIOLATION: Webhook verify() without try-catch
export async function POST_WebhookVerifyNoCatch(req: Request) {
  const payload = await req.text();
  const headers = {
    'svix-id': req.headers.get('svix-id')!,
    'svix-timestamp': req.headers.get('svix-timestamp')!,
    'svix-signature': req.headers.get('svix-signature')!,
  };

  const { Webhook } = require('svix');
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  // No try-catch - invalid signature will cause uncaught error
  const event = wh.verify(payload, headers);

  return Response.json({ success: true });
}

// ❌ VIOLATION: setActive() without try-catch
export function SessionActivation_NoCatch() {
  const { setActive } = useClerk();

  const activateSession = async (sessionId: string) => {
    // No try-catch - will fail silently if session invalid
    await setActive({ session: sessionId });
  };

  return <div></div>;
}

// ❌ VIOLATION: useClerk() potentially outside ClerkProvider
// (This is hard to detect statically, but represents the runtime error)
export function Component_NoProvider() {
  // If this component is rendered outside ClerkProvider, it will throw
  const clerk = useClerk();

  return <div>{clerk.loaded ? 'Loaded' : 'Loading...'}</div>;
}

// ❌ VIOLATION: Multiple issues combined
export async function API_MultipleViolations(req: Request) {
  // No auth check
  const { userId } = await auth(); // Missing null check

  const user = await currentUser(); // Missing null check
  const token = await getToken(); // Missing null check

  // Using all without null checks
  return Response.json({
    userId,
    email: user.emailAddresses[0].emailAddress,
    tokenPreview: token.substring(0, 10),
  });
}

// Export all violation examples
export {
  GET_UnprotectedRoute,
  POST_ProtectWithoutCatch,
  GET_CurrentUserNoCheck,
  Layout_MultipleCurrentUserCalls,
  GET_TokenNoCheck,
  SignInForm_NoErrorHandling,
  SignInForm_NoErrorDisplay,
  SignInForm_NoLockoutMeta,
  SignUpForm_NoErrorHandling,
  POST_WebhookInsecure,
  POST_WebhookVerifyNoCatch,
  SessionActivation_NoCatch,
  Component_NoProvider,
  API_MultipleViolations,
};
