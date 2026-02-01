import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

// Ensure Node.js runtime (bcrypt/jsonwebtoken are not Edge-compatible)
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = body?.email;
    const password = body?.password;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    // Helpful server-side warnings for production debugging (see Vercel logs)
    if (!process.env.DATABASE_URL) {
      console.error("[/api/login] DATABASE_URL is not set");
    }
    if (!process.env.JWT_SECRET) {
      console.error("[/api/login] JWT_SECRET is not set (fallback in use)");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Safety: if some legacy users were created without a password, treat as invalid creds
    if (!user.password) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return user data without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("[/api/login] error:", {
      message: error?.message,
      code: error?.code,
      name: error?.name,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
