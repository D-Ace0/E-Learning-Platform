import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: any;
  }
}

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const response = await fetch("http://localhost:5000/auth/login", {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: { 
              "Content-Type": "application/json",
            },
            credentials: 'include',
          });

          const user = await response.json();

          if (response.ok && user) {
            const cookies = response.headers.get('set-cookie');
            const authToken = cookies?.split(';').find(c => c.trim().startsWith('auth_token='));
            
            if (authToken) {
              user.auth_token = authToken.split('=')[1];
            }
            
            return user;
          }
          return null;
        } catch (error) {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && typeof user === 'object' && 'auth_token' in user) {
        token.accessToken = user.auth_token;
        token.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as any;
      session.accessToken = token.accessToken as string;
      return session;
    }
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}