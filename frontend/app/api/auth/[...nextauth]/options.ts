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
        password: { label: "Password", type: "password" },
        mfaToken: { label: "MFA Token", type: "text" }
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

          const data = await response.json();

          // If MFA is required, throw an error with status 202
          if (response.status === 202) {
            throw new Error('MFA_REQUIRED');
          }

          if (response.ok && data) {
            const cookies = response.headers.get('set-cookie');
            const authToken = cookies?.split(';').find(c => c.trim().startsWith('auth_token='));
            
            if (authToken) {
              data.auth_token = authToken.split('=')[1];
            }
            
            return data;
          }

          // If login failed, throw the error message
          throw new Error(data.message || 'Authentication failed');
        } catch (error) {
          throw error;
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
    error: '/signin'  // Redirect to signin page on error
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
}