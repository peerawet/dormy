import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      tenantId: number;
      role: string;
    };

    if (decoded.role !== "tenant") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    // Get tenant info
    const tenant = await prisma.tenant.findUnique({
      where: { id: decoded.tenantId },
      include: {
        lineAccounts: true,
        rooms: {
          include: {
            room: {
              include: {
                dormitory: true,
              },
            },
          },
        },
        bills: {
          include: {
            room: true,
          },
          orderBy: {
            billDate: "desc",
          },
          take: 10,
        },
        rentalContracts: {
          include: {
            room: {
              include: {
                dormitory: true,
              },
            },
          },
          orderBy: {
            startDate: "desc",
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, message: "Tenant not found" },
        { status: 404 }
      );
    }

    // Get LINE account info if exists
    const lineAccount = tenant.lineAccounts[0]; // Get first LINE account

    // Debug logging
    console.log("📊 [tenant-auth/me] Tenant ID:", tenant.id);
    console.log("📊 [tenant-auth/me] Tenant name:", tenant.name);
    console.log("📊 [tenant-auth/me] Bills count:", tenant.bills?.length || 0);
    console.log("📊 [tenant-auth/me] Rooms count:", tenant.rooms?.length || 0);
    console.log("📊 [tenant-auth/me] Contracts count:", tenant.rentalContracts?.length || 0);
    console.log("📊 [tenant-auth/me] Bills data:", JSON.stringify(tenant.bills, null, 2));
    console.log("📊 [tenant-auth/me] Rooms data:", JSON.stringify(tenant.rooms, null, 2));

    const responseData = {
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        phone: tenant.phone,
        address: tenant.address,
        lineUserId: lineAccount?.lineUserId,
        displayName: lineAccount?.displayName,
        pictureUrl: lineAccount?.pictureUrl,
        rooms: tenant.rooms || [],
        bills: tenant.bills || [],
        contracts: tenant.rentalContracts || [],
      },
    };

    console.log("📤 [tenant-auth/me] Response data:", JSON.stringify(responseData, null, 2));

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("[tenant-auth/me] Error:", error);
    
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

