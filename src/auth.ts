import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { platformApiBaseUrl } from "@/lib/platform-api-url";

export async function validatePlatformSession(accessToken: string): Promise<boolean> {
  const me = await sessionUser(accessToken);
  return me !== "invalid" && me !== "unknown";
}

const PLATFORM_SESSION_CHECK_MS = 5 * 60 * 1000;

async function sessionUser(accessToken: string) {
  try {
    const res = await fetch(`${platformApiBaseUrl()}/v1/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (res.status === 401 || res.status === 403) return "invalid" as const;
    if (!res.ok) return "unknown" as const;
    const user = (await res.json()) as { name?: string; email?: string };
    return user;
  } catch {
    return "unknown" as const;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username || "").trim().toLowerCase();
        const password = String(credentials?.password || "");
        if (!username || !password) return null;

        let res: Response;
        try {
          res = await fetch(`${platformApiBaseUrl()}/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            signal: AbortSignal.timeout(20_000),
          });
        } catch {
          return null;
        }
        if (!res.ok) return null;
        const data = await res.json();
        const user = data.user;
        if (!user?.id || !data.accessToken) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          accessToken: data.accessToken as string,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.userId = user.id;
        token.name = user.name;
        token.email = user.email;
        return token;
      }
      const accessToken = token.accessToken as string | undefined;
      if (!accessToken) return null;
      const lastCheck = token.platformCheckedAt as number | undefined;
      const now = Date.now();
      if (!lastCheck || now - lastCheck > PLATFORM_SESSION_CHECK_MS) {
        const me = await sessionUser(accessToken);
        if (me === "invalid") return null;
        if (me !== "unknown") {
          if (me.name) token.name = me.name;
          if (me.email) token.email = me.email;
        }
        token.platformCheckedAt = now;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      if (session.user) {
        session.user.id = (token.userId ?? token.sub) as string;
      }
      return session;
    },
  },
});
