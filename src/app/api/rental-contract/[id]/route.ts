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

  const contractId = Number(id);

  // ดึงข้อมูล rental contract พร้อมข้อมูลที่เกี่ยวข้องทั้งหมด
  const contract = await prisma.rentalContract.findUnique({
    where: { id: contractId },
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
                },
              },
            },
          },
        },
      },
    },
  });

  if (!contract)
    return NextResponse.json(
      { success: false, message: "ไม่พบสัญญาเช่า" },
      { status: 404 }
    );

  // ตรวจสอบสิทธิ์ - ต้องเป็นเจ้าของหอพัก
  if (contract.room.dormitory.ownerId !== userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  return NextResponse.json({ success: true, contract });
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
  const { tenantId, startDate, endDate } = body;
  const contractId = Number(id);

  // ตรวจสอบว่าสัญญาเช่ามีอยู่และเป็นของเจ้าของหอพัก
  const existingContract = await prisma.rentalContract.findUnique({
    where: { id: contractId },
    include: {
      room: {
        include: { dormitory: true },
      },
    },
  });

  if (!existingContract)
    return NextResponse.json(
      { success: false, message: "ไม่พบสัญญาเช่า" },
      { status: 404 }
    );

  if (existingContract.room.dormitory.ownerId !== userId)
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
    where: { id: contractId },
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
                },
              },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ success: true, contract });
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

  const contractId = Number(id);

  // ตรวจสอบว่าสัญญาเช่ามีอยู่และเป็นของเจ้าของหอพัก
  const contract = await prisma.rentalContract.findUnique({
    where: { id: contractId },
    include: {
      room: {
        include: { dormitory: true },
      },
    },
  });

  if (!contract)
    return NextResponse.json(
      { success: false, message: "ไม่พบสัญญาเช่า" },
      { status: 404 }
    );

  if (contract.room.dormitory.ownerId !== userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  await prisma.rentalContract.delete({ where: { id: contractId } });
  return NextResponse.json({ success: true });
}
