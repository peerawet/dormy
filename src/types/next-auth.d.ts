import NextAuth, { DefaultSession, DefaultUser, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
    appToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    appToken?: string;
  }
}

export {};
