import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

function getUserIdFromAuth(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  try {
    const token = auth.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    return payload.userId;
  } catch {
    return null;
  }
}

// GET: /api/rental-contract/[id]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const contractId = params.id;
  if (!contractId)
    return NextResponse.json(
      { success: false, message: "ต้องระบุ contract ID" },
      { status: 400 }
    );

  try {
    const contract = await prisma.rentalContract.findUnique({
      where: { id: Number(contractId) },
      include: {
        room: {
          include: {
            dormitory: {
              include: {
                owner: true,
              },
            },
          },
        },
      },
    });

    if (!contract) {
      return NextResponse.json(
        { success: false, message: "ไม่พบสัญญาเช่า" },
        { status: 404 }
      );
    }

    // ตรวจสอบสิทธิ์
    if (contract.room.dormitory.ownerId !== userId) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึงสัญญาเช่านี้" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, contract });
  } catch (error) {
    console.error("Error fetching contract:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลสัญญาเช่า" },
      { status: 500 }
    );
  }
}
