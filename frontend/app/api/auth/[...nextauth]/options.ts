import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Session } from "next-auth";
import jwt from 'jsonwebtoken';

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    name?: string;
    user_id?: string;
    role?: string;
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
        
        try {
          if (typeof user.auth_token === 'string') {
            const decoded = jwt.decode(user.auth_token) as unknown as { user_id: string; role: string, name: string };
            //console.log('Decoded token:', decoded);
            //console.log('Raw token:', user.auth_token);
            token.user_id = decoded.user_id;
            token.role = decoded.role;
            token.name = decoded.name;
          }
        } catch (error) {
          console.error('Error decoding JWT:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      
      if (token.accessToken) {
        const decoded = jwt.decode(token.accessToken as string) as unknown as { user_id: string; role: string, name: string };
        console.log('Decoded session token:', decoded); // Debug log
        session.user_id = decoded.user_id;
        session.role = decoded.role;
        session.name = decoded.name;
      }
      
      return session;
    }
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
    error: '/error'
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}