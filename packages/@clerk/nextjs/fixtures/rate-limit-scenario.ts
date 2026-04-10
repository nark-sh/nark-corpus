/**
 * @clerk/nextjs - Rate Limit Scenario Testing
 *
 * Tests detection of rate limit risks from multiple currentUser() calls.
 * Next.js 15 removed automatic fetch() caching, causing this to be a common issue.
 *
 * Critical Pattern: Multiple currentUser() calls in same render = rate limit risk
 * Limit: 100 requests per 10 seconds per IP
 * Impact: Shared IPs (Vercel) hit limits faster
 */

import { currentUser } from '@clerk/nextjs/server';
import { cache } from 'react';

// ❌ VIOLATION: Multiple currentUser() calls without caching
// This is the exact pattern that causes rate limiting on Next.js 15
export async function RootLayout_RateLimitRisk({ children }: { children: React.ReactNode }) {
  // Each call is a separate API request to Clerk
  const userForNav = await currentUser();    // API call #1
  const userForSidebar = await currentUser(); // API call #2 (duplicate!)
  const userForFooter = await currentUser();  // API call #3 (duplicate!)

  return (
    <html>
      <body>
        <nav>User: {userForNav?.firstName}</nav>
        <aside>Email: {userForSidebar?.emailAddresses[0]?.emailAddress}</aside>
        <main>{children}</main>
        <footer>Logged in as: {userForFooter?.username}</footer>
      </body>
    </html>
  );
}

// ❌ VIOLATION: Nested layouts both call currentUser()
export async function NestedLayout_RateLimitRisk({ children }: { children: React.ReactNode }) {
  const user = await currentUser(); // API call #1

  return (
    <div>
      <Header user={user} />
      {children}
    </div>
  );
}

async function Header({ user }: { user: any }) {
  // Another currentUser() call in nested component
  const freshUser = await currentUser(); // API call #2 (unnecessary!)

  return <header>{freshUser?.firstName}</header>;
}

// ❌ VIOLATION: Page component calls currentUser() when layout already did
export async function ProfilePage() {
  const user = await currentUser(); // API call #N

  return (
    <div>
      <h1>{user?.firstName}'s Profile</h1>
      <UserStats userId={user?.id} />
    </div>
  );
}

async function UserStats({ userId }: { userId?: string }) {
  // Yet another call in a child component
  const user = await currentUser(); // API call #N+1

  return <div>Stats for {user?.username}</div>;
}

// ❌ VIOLATION: Multiple parallel API routes each call currentUser()
// When hit simultaneously, causes rate limit burst
export async function GET_Route1(req: Request) {
  const user = await currentUser();
  return Response.json({ user });
}

export async function GET_Route2(req: Request) {
  const user = await currentUser();
  return Response.json({ user });
}

export async function GET_Route3(req: Request) {
  const user = await currentUser();
  return Response.json({ user });
}

export async function GET_Route4(req: Request) {
  const user = await currentUser();
  return Response.json({ user });
}

export async function GET_Route5(req: Request) {
  const user = await currentUser();
  return Response.json({ user });
}

// ✅ CORRECT: Using cache() wrapper prevents duplicate calls
const getCachedUser = cache(async () => {
  return await currentUser(); // Only called once per request
});

export async function RootLayout_Cached({ children }: { children: React.ReactNode }) {
  const user = await getCachedUser(); // First call - makes API request

  return (
    <html>
      <body>
        <nav>User: {user?.firstName}</nav>           {/* Uses cached result */}
        <aside>Email: {user?.emailAddresses[0]?.emailAddress}</aside> {/* Uses cached result */}
        <main>{children}</main>
        <footer>Logged in as: {user?.username}</footer> {/* Uses cached result */}
      </body>
    </html>
  );
}

export async function NestedLayout_Cached({ children }: { children: React.ReactNode }) {
  const user = await getCachedUser(); // Uses same cache as parent layout

  return (
    <div>
      <header>{user?.firstName}</header>
      {children}
    </div>
  );
}

// ❌ VIOLATION: High-frequency polling without caching
export async function PollingComponent() {
  // Imagine this is called every 5 seconds
  // 12 calls per minute = 720 calls per hour
  // Easily hits 100 req/10s limit with multiple users
  const user = await currentUser();

  return <div>Last updated: {user?.updatedAt}</div>;
}

// ❌ VIOLATION: Dashboard with many user-dependent components
export async function Dashboard() {
  // Each widget calls currentUser() independently
  return (
    <div className="grid">
      <UserGreeting />
      <UserStats_Widget />
      <UserNotifications />
      <UserSettings />
      <UserActivity />
      <UserBilling />
    </div>
  );
}

async function UserGreeting() {
  const user = await currentUser(); // Call #1
  return <div>Hello {user?.firstName}</div>;
}

async function UserStats_Widget() {
  const user = await currentUser(); // Call #2
  return <div>Stats for {user?.id}</div>;
}

async function UserNotifications() {
  const user = await currentUser(); // Call #3
  return <div>Notifications: {user?.id}</div>;
}

async function UserSettings() {
  const user = await currentUser(); // Call #4
  return <div>Settings: {user?.id}</div>;
}

async function UserActivity() {
  const user = await currentUser(); // Call #5
  return <div>Activity: {user?.id}</div>;
}

async function UserBilling() {
  const user = await currentUser(); // Call #6
  return <div>Billing: {user?.id}</div>;
}

// ✅ CORRECT: Pass user as prop instead of fetching in each component
export async function Dashboard_Optimized() {
  const user = await getCachedUser(); // Single call

  return (
    <div className="grid">
      <UserGreeting_Optimized user={user} />
      <UserStats_Optimized user={user} />
      <UserNotifications_Optimized user={user} />
      <UserSettings_Optimized user={user} />
      <UserActivity_Optimized user={user} />
      <UserBilling_Optimized user={user} />
    </div>
  );
}

function UserGreeting_Optimized({ user }: { user: any }) {
  return <div>Hello {user?.firstName}</div>;
}

function UserStats_Optimized({ user }: { user: any }) {
  return <div>Stats for {user?.id}</div>;
}

function UserNotifications_Optimized({ user }: { user: any }) {
  return <div>Notifications: {user?.id}</div>;
}

function UserSettings_Optimized({ user }: { user: any }) {
  return <div>Settings: {user?.id}</div>;
}

function UserActivity_Optimized({ user }: { user: any }) {
  return <div>Activity: {user?.id}</div>;
}

function UserBilling_Optimized({ user }: { user: any }) {
  return <div>Billing: {user?.id}</div>;
}

// Export test scenarios
export {
  RootLayout_RateLimitRisk,
  NestedLayout_RateLimitRisk,
  ProfilePage,
  GET_Route1,
  GET_Route2,
  GET_Route3,
  GET_Route4,
  GET_Route5,
  RootLayout_Cached,
  NestedLayout_Cached,
  PollingComponent,
  Dashboard,
  Dashboard_Optimized,
};
