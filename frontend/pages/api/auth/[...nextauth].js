import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { LOGIN_URL } from "../../../constants";
export default NextAuth ({
   session: {
    strategy: "jwt",
    maxAge: 15 * 60 //15 minutes
    //TODO: set updateAge, and figure out writing to database to extend jwt life
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
    })
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return user
    },
    async jwt({ token,user, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.user_id = user.user_id
      }
      return token
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.user.user_id = token.user_id
      
      return session
    } 
  },
  pages:{
    signIn:'../../Login',
  },
  secret: process.env.NEXTAUTH_SECRET
})