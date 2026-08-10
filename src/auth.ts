import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const API = (
  process.env.SUBSCRIPTIONS_API_URL || "http://127.0.0.1:8002"
).replace("://localhost", "://127.0.0.1");

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username || "").trim();
        const password = String(credentials?.password || "");
        if (!username || !password) return null;

        const res = await fetch(`${API}/v1/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
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
