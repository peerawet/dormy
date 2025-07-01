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

// GET: /api/tenant/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const tenantId = params.id;
  if (!tenantId)
    return NextResponse.json(
      { success: false, message: "ต้องระบุ tenant ID" },
      { status: 400 }
    );

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: Number(tenantId) },
      include: {
        rooms: {
          include: {
            room: {
              include: {
                dormitory: {
                  select: {
                    id: true,
                    name: true,
                    ownerId: true,
                  },
                },
              },
            },
          },
        },
        rentalContracts: {
          include: {
            room: {
              include: {
                dormitory: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้เช่า" },
        { status: 404 }
      );
    }

    // ตรวจสอบสิทธิ์ - ต้องเป็นเจ้าของหอพักที่ผู้เช่าคนนี้เช่าอยู่
    const isOwner = tenant.rooms.some(
      (tenantRoom) => tenantRoom.room.dormitory.ownerId === userId
    );

    if (!isOwner) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        phone: tenant.phone,
        idCard: tenant.idCard,
        address: tenant.address,
        rooms: tenant.rooms,
        rentalContracts: tenant.rentalContracts,
      },
    });
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}
