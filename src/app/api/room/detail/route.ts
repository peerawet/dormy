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

export async function GET(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  if (!roomId)
    return NextResponse.json(
      { success: false, message: "ต้องระบุ roomId" },
      { status: 400 }
    );
  const room = await prisma.room.findUnique({
    where: { id: Number(roomId) },
    include: {
      tenantRooms: {
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              phone: true,
              idCard: true,
              address: true,
              // ไม่ส่ง password กลับไป
            },
          },
        },
      },
      rentalContracts: {
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              phone: true,
              idCard: true,
              address: true,
              // ไม่ส่ง password กลับไป
            },
          },
        },
        orderBy: { startDate: "desc" },
      },
    },
  });
  if (!room)
    return NextResponse.json(
      { success: false, message: "ไม่พบห้องพัก" },
      { status: 404 }
    );
  // ตรวจสอบสิทธิ์ (user ต้องเป็นเจ้าของ dorm)
  const dorm = await prisma.dormitory.findFirst({
    where: { id: room.dormitoryId, ownerId: userId },
  });
  if (!dorm)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  return NextResponse.json({ success: true, room, dormitory: dorm });
}
