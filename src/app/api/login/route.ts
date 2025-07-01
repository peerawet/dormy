import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Email and password are required." },
      { status: 400 }
    );
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
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
  const { password: _, ...userWithoutPassword } = user;

  return NextResponse.json({
    success: true,
    token,
    user: userWithoutPassword,
  });
}
