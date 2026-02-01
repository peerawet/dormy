import NextAuth from "next-auth";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const authOptions = {
  providers: [],
  callbacks: {
    async jwt({ token, account }) {
      return token;
    },
    async session({ session, token }) {
      session.appToken = token.appToken;
      session.userId = token.sub;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
