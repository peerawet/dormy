import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  const prisma = new PrismaClient();
  try {
    // Try to connect to the database
    await prisma.$connect();
    await prisma.$disconnect();
    return NextResponse.json({
      success: true,
      message: "Database connection successful.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
