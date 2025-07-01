import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

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

  const { dormitoryId } = Object.fromEntries(new URL(req.url).searchParams);

  if (dormitoryId) {
    // ถ้าระบุ dormitoryId ให้ดึงห้องของหอพักนั้นเท่านั้น
    const dorm = await prisma.dormitory.findFirst({
      where: { id: Number(dormitoryId), ownerId: userId },
    });
    if (!dorm)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    const rooms = await prisma.room.findMany({
      where: { dormitoryId: Number(dormitoryId) },
      include: {
        dormitory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return NextResponse.json({ success: true, rooms });
  } else {
    // ถ้าไม่ระบุ dormitoryId ให้ดึงห้องทั้งหมดของ user
    const rooms = await prisma.room.findMany({
      where: {
        dormitory: {
          ownerId: userId,
        },
      },
      include: {
        dormitory: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ dormitory: { name: "asc" } }, { name: "asc" }],
    });
    return NextResponse.json({ success: true, rooms });
  }
}

export async function POST(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  const {
    dormitoryId,
    name,
    price,
    waterRate,
    electricRate,
    waterFlat,
    electricFlat,
    commonFee,
    otherFee,
  } = await req.json();
  if (!dormitoryId || !name || !price)
    return NextResponse.json(
      { success: false, message: "ข้อมุลไม่ครบ" },
      { status: 400 }
    );
  // ตรวจสอบสิทธิ์
  const dorm = await prisma.dormitory.findFirst({
    where: { id: Number(dormitoryId), ownerId: userId },
  });
  if (!dorm)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  const room = await prisma.room.create({
    data: {
      dormitoryId: Number(dormitoryId),
      name,
      price: Number(price),
      waterRate: waterRate ? parseFloat(waterRate) : null,
      electricRate: electricRate ? parseFloat(electricRate) : null,
      waterFlat: waterFlat ? Number(waterFlat) : null,
      electricFlat: electricFlat ? Number(electricFlat) : null,
      commonFee: commonFee ? Number(commonFee) : null,
      otherFee: otherFee ? Number(otherFee) : null,
    },
  });
  return NextResponse.json({ success: true, room });
}

export async function PUT(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  const {
    id,
    dormitoryId,
    name,
    price,
    waterRate,
    electricRate,
    waterFlat,
    electricFlat,
    commonFee,
    otherFee,
  } = await req.json();
  if (!id || !dormitoryId || !name || !price)
    return NextResponse.json(
      { success: false, message: "ข้อมุลไม่ครบ" },
      { status: 400 }
    );
  // ตรวจสอบสิทธิ์
  const dorm = await prisma.dormitory.findFirst({
    where: { id: Number(dormitoryId), ownerId: userId },
  });
  if (!dorm)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  const room = await prisma.room.update({
    where: { id: Number(id), dormitoryId: Number(dormitoryId) },
    data: {
      name,
      price: Number(price),
      waterRate: waterRate ? parseFloat(waterRate) : null,
      electricRate: electricRate ? parseFloat(electricRate) : null,
      waterFlat: waterFlat ? Number(waterFlat) : null,
      electricFlat: electricFlat ? Number(electricFlat) : null,
      commonFee: commonFee ? Number(commonFee) : null,
      otherFee: otherFee ? Number(otherFee) : null,
    },
  });
  return NextResponse.json({ success: true, room });
}

export async function DELETE(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  const { id, dormitoryId } = await req.json();
  if (!id || !dormitoryId)
    return NextResponse.json(
      { success: false, message: "ข้อมูลไม่ครบ" },
      { status: 400 }
    );
  // ตรวจสอบสิทธิ์
  const dorm = await prisma.dormitory.findFirst({
    where: { id: Number(dormitoryId), ownerId: userId },
  });
  if (!dorm)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  await prisma.room.delete({
    where: { id: Number(id), dormitoryId: Number(dormitoryId) },
  });
  return NextResponse.json({ success: true });
}
