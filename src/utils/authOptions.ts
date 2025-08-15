// next
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// project imports
import axios from '@/utils/axios';

const users = [
  {
    id: 1,
    name: 'Jone Doe',
    email: 'info@codedthemes.com',
    password: '123456'
  },
  {
    id: 2,
    name: 'Phoenix Coded',
    email: 'info@phoenixcoded.co',
    password: '123456'
  }
];

declare module 'next-auth' {
  interface User {
    accessToken?: string;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: 'login',
      name: 'login',
      credentials: {
        email: { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter Email' },
        password: { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter Password' }
      },
      async authorize(credentials) {
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/account/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              password: credentials?.password,
              email: credentials?.email
            })
          });

          const data = await response.json();

          if (response.ok && data?.user) {
            // Add access token to user data for login
            data.user.accessToken = data.serviceToken;
            return data.user;
          }
          return null;
        } catch (e: any) {
          const errorMessage = e?.message || 'Something went wrong!';
          throw new Error(errorMessage);
        }
      }
    }),
    CredentialsProvider({
      id: 'register',
      name: 'Register',
      credentials: {
        firstname: { name: 'firstname', label: 'Firstname', type: 'text', placeholder: 'Enter Firstname' },
        lastname: { name: 'lastname', label: 'Lastname', type: 'text', placeholder: 'Enter Lastname' },
        email: { name: 'email', label: 'Email', type: 'email', placeholder: 'Enter Email' },
        company: { name: 'company', label: 'Company', type: 'text', placeholder: 'Enter Company' },
        password: { name: 'password', label: 'Password', type: 'password', placeholder: 'Enter Password' }
      },
      async authorize(credentials) {
        try {
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/account/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              firstName: credentials?.firstname,
              lastName: credentials?.lastname,
              company: credentials?.company,
              password: credentials?.password,
              email: credentials?.email
            })
          });

          const data = await response.json();

          if (response.ok && data?.user) {
            // For registration, we don't want to create a session
            // Just return the user data to indicate success
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email
              // Don't include accessToken for registration
            };
          }
          return null;
        } catch (e: any) {
          const errorMessage = e?.message || 'Something went wrong!';
          throw new Error(errorMessage);
        }
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;

        // Only add accessToken for login, not registration
        if (account?.provider === 'login' && user.accessToken) {
          token.accessToken = user.accessToken;
        }
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        (session as any).id = token.id;
        (session as any).provider = token.provider;
        (session as any).token = token;
      }
      return session;
    },
    async signIn(params) {
      // For registration, allow the sign-in but don't create a session
      if (params.account?.provider === 'register') {
        return true; // Allow registration to proceed
      }
      return true;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: Number(process.env.NEXT_APP_JWT_TIMEOUT || '86400')
  },
  jwt: {
    secret: process.env.JWT_SECRET
  },
  pages: {
    signIn: '/login',
    newUser: '/register'
  }
};
