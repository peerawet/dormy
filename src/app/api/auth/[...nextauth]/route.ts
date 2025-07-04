import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { google } from "googleapis";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 10000,
      },
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/spreadsheets",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account && account.provider === "google") {
        // Ensure local user exists and generate our app token
        const email = token.email as string;
        let localUser = await prisma.user.findUnique({ where: { email } });
        if (!localUser) {
          localUser = await prisma.user.create({
            data: {
              email,
              name: token.name || "",
              password: "", // Google users don't need password
              phone: "",
            },
          });
        }

        token.appToken = jwt.sign(
          { userId: localUser.id },
          process.env.JWT_SECRET!,
          { expiresIn: "30d" }
        );

        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = Date.now() + (account.expires_in ?? 0) * 1000;
      }
      // refresh if expired
      if (
        token.refreshToken &&
        Date.now() > (token.expiresAt as number) - 60 * 1000
      ) {
        try {
          const oAuth2 = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
          );
          oAuth2.setCredentials({
            refresh_token: token.refreshToken as string,
          });
          const { credentials } = await oAuth2.refreshAccessToken();
          token.accessToken = credentials.access_token;
          token.expiresAt =
            Date.now() + (credentials.expiry_date ?? 0) - Date.now();
        } catch (e) {
          console.error("Refresh error", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.appToken = token.appToken;
      session.userId = token.sub;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
