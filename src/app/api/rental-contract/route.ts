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

// GET: /api/rental-contract?roomId=xxx
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
  const contracts = await prisma.rentalContract.findMany({
    where: { roomId: Number(roomId) },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json({ success: true, contracts });
}

// POST: create
export async function POST(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  const {
    tenantAddress,
    startDate,
    endDate,
    tenantName,
    tenantPhone,
    tenantIdCard,
    roomId,
  } = await req.json();
  if (
    !tenantAddress ||
    !startDate ||
    !endDate ||
    !tenantName ||
    !tenantPhone ||
    !roomId
  )
    return NextResponse.json(
      { success: false, message: "ข้อมูลไม่ครบ" },
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
  const contract = await prisma.rentalContract.create({
    data: {
      tenantAddress,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      tenantName,
      tenantPhone,
      tenantIdCard: tenantIdCard || null,
      roomId: Number(roomId),
    },
  });
  return NextResponse.json({ success: true, contract });
}

// PUT: update
export async function PUT(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  const {
    id,
    tenantAddress,
    startDate,
    endDate,
    tenantName,
    tenantPhone,
    tenantIdCard,
    roomId,
  } = await req.json();
  if (
    !id ||
    !tenantAddress ||
    !startDate ||
    !endDate ||
    !tenantName ||
    !tenantPhone ||
    !roomId
  )
    return NextResponse.json(
      { success: false, message: "ข้อมูลไม่ครบ" },
      { status: 400 }
    );
  // ตรวจสอบสิทธิ์
  const contract = await prisma.rentalContract.findUnique({
    where: { id: Number(id) },
    include: { room: { include: { dormitory: true } } },
  });
  if (!contract || contract.room.dormitory.ownerId !== userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  const updated = await prisma.rentalContract.update({
    where: { id: Number(id) },
    data: {
      tenantAddress,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      tenantName,
      tenantPhone,
      tenantIdCard: tenantIdCard || null,
      roomId: Number(roomId),
    },
  });
  return NextResponse.json({ success: true, contract: updated });
}

// DELETE: delete
export async function DELETE(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  const { id } = await req.json();
  if (!id)
    return NextResponse.json(
      { success: false, message: "ต้องระบุ id" },
      { status: 400 }
    );
  // ตรวจสอบสิทธิ์
  const contract = await prisma.rentalContract.findUnique({
    where: { id: Number(id) },
    include: { room: { include: { dormitory: true } } },
  });
  if (!contract || contract.room.dormitory.ownerId !== userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  await prisma.rentalContract.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
