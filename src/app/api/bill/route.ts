import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import type { Prisma } from "@prisma/client";

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

interface BillPayload {
  id?: number;
  roomId: number;
  tenantId?: number;
  billDate?: string;
  water?: number;
  electric?: number;
  common?: number;
  other?: number;
  rent?: number;
  discount?: number;
  total?: number;
  meterWaterStart?: number | null;
  meterWaterEnd?: number | null;
  meterElectricStart?: number | null;
  meterElectricEnd?: number | null;
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
  const bills = await prisma.bill.findMany({
    where: { roomId: Number(roomId) },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
    orderBy: { billDate: "desc" },
  });
  return NextResponse.json({ success: true, bills });
}

export async function POST(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  const body: BillPayload = await req.json();
  const { roomId, billDate, tenantId } = body;
  if (!roomId || !tenantId)
    return NextResponse.json(
      { success: false, message: "ต้องระบุ roomId และ tenantId" },
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

  // ตรวจสอบว่า tenant อยู่ในห้องนี้
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: Number(tenantId),
      rooms: {
        some: {
          roomId: Number(roomId),
        },
      },
    },
  });
  if (!tenant)
    return NextResponse.json(
      { success: false, message: "ไม่พบผู้เช่าในห้องนี้" },
      { status: 400 }
    );

  const bill = await prisma.bill.create({
    data: {
      billDate: billDate ? new Date(billDate) : new Date(),
      tenantId: Number(tenantId),
      water: Number(body.water) || 0,
      electric: Number(body.electric) || 0,
      common: Number(body.common) || 0,
      other: Number(body.other) || 0,
      rent: Number(body.rent) || 0,
      discount: Number(body.discount) || 0,
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
      roomId: Number(roomId),
    },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
  });
  return NextResponse.json({ success: true, bill });
}

export async function PUT(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  const body: BillPayload = await req.json();
  const { id, roomId, tenantId } = body;
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

  // ตรวจสอบว่า tenant อยู่ในห้องนี้ (ถ้ามีการเปลี่ยน tenantId)
  if (tenantId) {
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: Number(tenantId),
        rooms: {
          some: {
            roomId: Number(roomId),
          },
        },
      },
    });
    if (!tenant)
      return NextResponse.json(
        { success: false, message: "ไม่พบผู้เช่าในห้องนี้" },
        { status: 400 }
      );
  }

  const updateData: Prisma.BillUpdateInput = {
    billDate: body.billDate ? new Date(body.billDate) : undefined,
    water: Number(body.water) || 0,
    electric: Number(body.electric) || 0,
    common: Number(body.common) || 0,
    other: Number(body.other) || 0,
    rent: Number(body.rent) || 0,
    discount: Number(body.discount) || 0,
    total: Number(body.total) || 0,
    meterWaterStart: body.meterWaterStart ? Number(body.meterWaterStart) : null,
    meterWaterEnd: body.meterWaterEnd ? Number(body.meterWaterEnd) : null,
    meterElectricStart: body.meterElectricStart
      ? Number(body.meterElectricStart)
      : null,
    meterElectricEnd: body.meterElectricEnd
      ? Number(body.meterElectricEnd)
      : null,
  };

  if (tenantId) {
    updateData.tenant = { connect: { id: Number(tenantId) } };
  }

  const bill = await prisma.bill.update({
    where: { id: Number(id) },
    data: updateData,
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
  });
  return NextResponse.json({ success: true, bill });
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
  await prisma.bill.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
