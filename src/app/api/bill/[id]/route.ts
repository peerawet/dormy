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

export async function PUT(
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

  const body = await req.json();
  const { roomId, billDate } = body;
  const billId = Number(id);

  if (!roomId)
    return NextResponse.json(
      { success: false, message: "ต้องระบุ roomId" },
      { status: 400 }
    );

  // ตรวจสอบสิทธิ์
  const room = await prisma.room.findUnique({
    where: { id: Number(roomId) },
    include: { dormitory: true },
  });

  if (!room || room.dormitory.ownerId !== userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const bill = await prisma.bill.update({
    where: { id: billId },
    data: {
      billDate: billDate ? new Date(billDate) : undefined,
      tenantName: body.tenantName,
      water: Number(body.water) || 0,
      electric: Number(body.electric) || 0,
      common: Number(body.common) || 0,
      other: Number(body.other) || 0,
      rent: Number(body.rent) || 0,
      total: Number(body.total) || 0,
      meterWaterStart: body.meterWaterStart
        ? Number(body.meterWaterStart)
        : null,
      meterWaterEnd: body.meterWaterEnd ? Number(body.meterWaterEnd) : null,
      meterElectricStart: body.meterElectricStart
        ? Number(body.meterElectricStart)
        : null,
      meterElectricEnd: body.meterElectricEnd
        ? Number(body.meterElectricEnd)
        : null,
    },
  });

  return NextResponse.json({ success: true, bill });
}

export async function DELETE(
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

  const billId = Number(id);

  // ตรวจสอบสิทธิ์โดยหา bill และ room
  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: {
      room: {
        include: { dormitory: true },
      },
    },
  });

  if (!bill || bill.room.dormitory.ownerId !== userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  await prisma.bill.delete({ where: { id: billId } });
  return NextResponse.json({ success: true });
}
