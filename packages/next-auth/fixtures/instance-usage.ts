/**
 * Fixtures testing additional next-auth patterns.
 * Tests signIn() usage and getToken() patterns.
 */
import { getToken } from "next-auth/jwt";
import type { NextApiRequest } from "next";

// ✅ getToken() is safe without try/catch — it handles decode errors internally
// and only throws for missing `req`. This should NOT trigger violations.
async function getSessionFromRequest(req: NextApiRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return null;
  return { userId: token.sub, email: token.email };
}

// ✅ getToken() in middleware — no try/catch needed (returns null on decode failure)
async function getTokenForMiddleware(req: NextApiRequest) {
  const token = await getToken({ req });
  return token;
}

// ✅ encode() inside NextAuth jwt.encode callback — framework wraps this
// This pattern is common in cal.com. While it can throw, NextAuth handles it.
// This should be considered a lower-priority warning context.
const nextAuthOptions = {
  jwt: {
    encode: async ({ token, secret, maxAge }: { token: object; secret: string; maxAge?: number }) => {
      const { encode } = await import("next-auth/jwt");
      return encode({ token, secret, maxAge });
    },
  },
};
