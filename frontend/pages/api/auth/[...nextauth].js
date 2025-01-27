import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { LOGIN_URL, GOOGLE_LOGIN_URL } from "../../../constants";

export default NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 5 * 60 * 60, // 5 hours
    updateAge: 2 * 60 * 60, // 2 hours
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: "Username", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const res = await fetch(LOGIN_URL, {
          method: 'POST',
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" }
        })
        const user = await res.json()
        // If no error and we have user data, return it
        if (res.ok && user) {
          return user
        }
        return Promise.reject(new Error(user?.errors));
      }
    }),
    GoogleProvider({
      clientId: '1038975993001-95g7rrnusvjvu71r4ng7mleh2lecfp1t.apps.googleusercontent.com',
      clientSecret: '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'
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        try {
          const response = await fetch(GOOGLE_LOGIN_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name,
              googleId: profile.sub
            })
          });
          
          const data = await response.json();
          if (response.ok) {
            console.log('Google auth response:', data);
            user.user_id = data.user_id; // Store the user_id from your API
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error during Google auth:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        token.user_id = user.user_id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.user_id = token.user_id;
      }
      console.log("Session callback:", session);
      return session;
    }
  },
  pages:{
    signIn:'../../Login',
  },
  secret: process.env.NEXTAUTH_SECRET
})