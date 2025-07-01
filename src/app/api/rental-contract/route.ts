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
    },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json({ success: true, contracts });
}

export async function POST(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const body = await req.json();
  const { roomId, tenantId, startDate, endDate } = body;

  if (!roomId || !tenantId || !startDate || !endDate)
    return NextResponse.json(
      { success: false, message: "ต้องระบุข้อมูลครบถ้วน" },
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

  // ตรวจสอบว่า tenant มีจริง
  const tenant = await prisma.tenant.findUnique({
    where: { id: Number(tenantId) },
  });

  if (!tenant)
    return NextResponse.json(
      { success: false, message: "ไม่พบผู้เช่า" },
      { status: 400 }
    );

  const contract = await prisma.rentalContract.create({
    data: {
      tenantId: Number(tenantId),
      roomId: Number(roomId),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
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
    },
  });

  return NextResponse.json({ success: true, contract });
}

export async function PUT(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const body = await req.json();
  const { id, roomId, tenantId, startDate, endDate } = body;

  if (!id || !roomId)
    return NextResponse.json(
      { success: false, message: "ต้องระบุ id และ roomId" },
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

  // ตรวจสอบว่า tenant มีจริง (ถ้ามีการเปลี่ยน tenantId)
  if (tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: Number(tenantId) },
    });

    if (!tenant)
      return NextResponse.json(
        { success: false, message: "ไม่พบผู้เช่า" },
        { status: 400 }
      );
  }

  const updateData: any = {};
  if (tenantId) updateData.tenantId = Number(tenantId);
  if (startDate) updateData.startDate = new Date(startDate);
  if (endDate) updateData.endDate = new Date(endDate);

  const contract = await prisma.rentalContract.update({
    where: { id: Number(id) },
    data: updateData,
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
    },
  });

  return NextResponse.json({ success: true, contract });
}

export async function DELETE(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const body = await req.json();
  const { id, roomId } = body;

  if (!id || !roomId)
    return NextResponse.json(
      { success: false, message: "ต้องระบุ id และ roomId" },
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

  await prisma.rentalContract.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
