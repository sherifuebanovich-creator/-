import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          let lang = 'en';
          try {
            const state = JSON.parse((account.state as string) || '{}');
            lang = state.lang || 'en';
          } catch {}

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
          const res = await fetch(`${apiUrl}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              displayName: user.name,
              avatar: user.image,
              googleId: account.providerAccountId,
              lang,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.data?.accessToken) {
              (user as any).accessToken = data.data.accessToken;
              (user as any).refreshToken = data.data.refreshToken;
              (user as any).rovxUser = data.data.user;
            } else {
              console.error('[Auth] Backend returned OK but no accessToken');
              return false;
            }
          } else {
            const errBody = await res.text().catch(() => '');
            console.error(`[Auth] Backend rejected Google sign-in [${res.status}]: ${errBody.slice(0, 200)}`);
            return false;
          }
        } catch (err) {
          console.error('[Auth] Backend unreachable (API server at ' + process.env.NEXT_PUBLIC_API_URL + '):', (err as Error).message);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.rovxUser = (user as any).rovxUser;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;
      session.rovxUser = token.rovxUser;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
