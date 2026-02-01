import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, phone, email, password, promptpay } = await req.json();
    if (!name || !phone || !email || !password) {
      return NextResponse.json(
        { success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered." },
        { status: 409 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        promptpay: promptpay || null,
      },
    });
    return NextResponse.json({
      success: true,
      message: "User registered successfully.",
      user: { id: user.id, email: user.email },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error",
        error: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}
