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
  const dorms = await prisma.dormitory.findMany({
    where: { ownerId: userId },
    include: {
      rooms: {
        include: {
          tenantRooms: {
            include: {
              tenant: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  address: true,
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
                },
              },
            },
          },
        },
      },
    },
  });
  return NextResponse.json({ success: true, dorms });
}

export async function POST(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  const { name, address } = await req.json();
  if (!name || !address)
    return NextResponse.json(
      { success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
      { status: 400 }
    );
  const dorm = await prisma.dormitory.create({
    data: { name, address, ownerId: userId },
    include: { rooms: true },
  });
  return NextResponse.json({ success: true, dorm });
}

export async function PUT(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  const { id, name, address } = await req.json();
  if (!id || !name || !address)
    return NextResponse.json(
      { success: false, message: "ข้อมูลไม่ครบ" },
      { status: 400 }
    );
  const dorm = await prisma.dormitory.update({
    where: { id, ownerId: userId },
    data: { name, address },
    include: { rooms: true },
  });
  return NextResponse.json({ success: true, dorm });
}

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
      { success: false, message: "ข้อมูลไม่ครบ" },
      { status: 400 }
    );
  await prisma.dormitory.delete({ where: { id, ownerId: userId } });
  return NextResponse.json({ success: true });
}
