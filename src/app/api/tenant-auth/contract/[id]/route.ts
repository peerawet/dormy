import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const contractId = (await params).id;

    // Get contract with all related data
    const contract = await prisma.rentalContract.findUnique({
      where: { id: Number(contractId) },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            phone: true,
            idCard: true,
            address: true,
          },
        },
        room: {
          include: {
            dormitory: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                    address: true,
                    idCard: true,
                    promptpay: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { success: false, message: "Contract not found" },
        { status: 404 }
      );
    }

    // Verify that the contract belongs to this tenant
    if (contract.tenantId !== decoded.tenantId) {
      return NextResponse.json(
        { success: false, message: "Forbidden - This contract does not belong to you" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      contract,
    });
  } catch (error: any) {
    console.error("[tenant-auth/contract/[id]] Error:", error);

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

