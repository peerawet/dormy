import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { linkCode, lineUserId } = await req.json();

    if (!linkCode) {
      return NextResponse.json(
        { success: false, message: "linkCode is required" },
        { status: 400 }
      );
    }

    // Find tenant by linkCode
    const tenant = await prisma.tenant.findUnique({
      where: { linkCode },
      include: {
        lineAccounts: true,
        rooms: {
          include: {
            room: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, message: "Invalid link code" },
        { status: 404 }
      );
    }

    // If lineUserId is provided, link or update LINE account
    if (lineUserId) {
      // Check if this LINE account already exists
      const existingLineAccount = await prisma.lineAccount.findUnique({
        where: { lineUserId },
      });

      if (existingLineAccount) {
        // Update existing LINE account
        await prisma.lineAccount.update({
          where: { lineUserId },
          data: {
            tenantId: tenant.id,
            role: "tenant",
            isVerified: true,
          },
        });
      } else {
        // Create new LINE account
        await prisma.lineAccount.create({
          data: {
            lineUserId,
            role: "tenant",
            tenantId: tenant.id,
            isVerified: true,
          },
        });
      }
    }

    // Create JWT token
    const token = jwt.sign(
      {
        tenantId: tenant.id,
        role: "tenant",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    // Get LINE account info if exists
    const lineAccount = tenant.lineAccounts.find(
      (acc) => acc.lineUserId === lineUserId
    );

    return NextResponse.json({
      success: true,
      token,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        phone: tenant.phone,
        address: tenant.address,
        lineUserId: lineAccount?.lineUserId,
        displayName: lineAccount?.displayName,
        pictureUrl: lineAccount?.pictureUrl,
      },
    });
  } catch (error: any) {
    console.error("[tenant-auth/login-link] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

