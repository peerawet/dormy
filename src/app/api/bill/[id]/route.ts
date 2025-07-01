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

  const billId = Number(id);

  // ดึงข้อมูล bill พร้อมข้อมูลที่เกี่ยวข้องสำหรับใบเสร็จ
  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          phone: true,
          idCard: true,
        },
      },
      room: {
        include: {
          dormitory: {
            select: {
              id: true,
              name: true,
              address: true,
              ownerId: true,
              owner: {
                select: {
                  name: true,
                  phone: true,
                  promptpay: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!bill || (bill as any).room?.dormitory?.ownerId !== userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  return NextResponse.json({ success: true, bill });
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
  const { roomId, billDate, tenantId } = body;
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

  const updateData: any = {
    billDate: billDate ? new Date(billDate) : undefined,
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
    updateData.tenantId = Number(tenantId);
  }

  const bill = await prisma.bill.update({
    where: { id: billId },
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

  if (!bill || (bill as any).room?.dormitory?.ownerId !== userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  await prisma.bill.delete({ where: { id: billId } });
  return NextResponse.json({ success: true });
}
