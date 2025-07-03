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
  const expiring = searchParams.get("expiring");
  const roomId = searchParams.get("roomId");

  let whereCondition: any = {
    room: {
      dormitory: { ownerId: userId },
    },
  };

  if (roomId) {
    whereCondition.roomId = parseInt(roomId);
  }

  if (expiring) {
    const daysFromNow = new Date();
    daysFromNow.setDate(daysFromNow.getDate() + parseInt(expiring));

    whereCondition.endDate = {
      lte: daysFromNow,
      gte: new Date(),
    };
  }

  const contracts = await prisma.rentalContract.findMany({
    where: whereCondition,
    include: {
      tenant: {
        select: { id: true, name: true, phone: true },
      },
      room: {
        select: {
          id: true,
          name: true,
          dormitory: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { endDate: "asc" },
  });

  return NextResponse.json({
    success: true,
    contracts,
  });
}

export async function POST(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const body = await req.json();
  const { roomId, tenantId, startDate, endDate, deposit, insurance } = body;

  // Debug logging
  console.log("📝 CREATE CONTRACT - Received data:", {
    roomId,
    tenantId,
    startDate,
    endDate,
    deposit,
    insurance,
  });

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

  console.log("💾 Creating contract with data:", {
    tenantId: Number(tenantId),
    roomId: Number(roomId),
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    deposit: deposit ? Number(deposit) : null,
    insurance: insurance ? Number(insurance) : null,
  });

  const contract = await prisma.rentalContract.create({
    data: {
      tenantId: Number(tenantId),
      roomId: Number(roomId),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      deposit: deposit ? Number(deposit) : null,
      insurance: insurance ? Number(insurance) : null,
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

  console.log("✅ Contract created successfully:", {
    id: contract.id,
    deposit: contract.deposit,
    insurance: contract.insurance,
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
  const { id, roomId, tenantId, startDate, endDate, deposit, insurance } = body;

  // Debug logging
  console.log("✏️ UPDATE CONTRACT - Received data:", {
    id,
    roomId,
    tenantId,
    startDate,
    endDate,
    deposit,
    insurance,
  });

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

  // Handle deposit - always update if provided in request (even if undefined)
  if ("deposit" in body) {
    updateData.deposit = deposit ? Number(deposit) : null;
  }

  // Handle insurance - always update if provided in request (even if undefined)
  if ("insurance" in body) {
    updateData.insurance = insurance ? Number(insurance) : null;
  }

  console.log("🔍 DEBUG - deposit value:", { deposit, type: typeof deposit });
  console.log("🔍 DEBUG - insurance value:", {
    insurance,
    type: typeof insurance,
  });
  console.log("💾 Updating contract with data:", updateData);

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

  console.log("✅ Contract updated successfully:", {
    id: contract.id,
    deposit: contract.deposit,
    insurance: contract.insurance,
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
