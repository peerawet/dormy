import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

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

// GET: /api/tenant - ดึง tenant ทั้งหมดของ user
export async function GET(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  let whereClause: any = {
    rooms: {
      some: {
        room: {
          dormitory: {
            ownerId: userId,
          },
        },
      },
    },
  };

  // ถ้าระบุ roomId ให้ filter ตาม roomId
  if (roomId) {
    whereClause.rooms = {
      some: {
        roomId: Number(roomId),
        room: {
          dormitory: {
            ownerId: userId,
          },
        },
      },
    };
  }

  const tenants = await prisma.tenant.findMany({
    where: whereClause,
    include: {
      rooms: {
        include: {
          room: {
            select: {
              id: true,
              name: true,
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
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ success: true, tenants });
}

// POST: create tenant (แยกจากสัญญาเช่า)
export async function POST(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const { name, phone, idCard, address, password, roomIds } = await req.json();

  if (
    !name ||
    !phone ||
    !address ||
    !password ||
    !roomIds ||
    !Array.isArray(roomIds) ||
    roomIds.length === 0
  )
    return NextResponse.json(
      { success: false, message: "ข้อมูลไม่ครบ" },
      { status: 400 }
    );

  // ตรวจสอบว่า rooms ที่ระบุเป็นของ user หรือไม่
  const rooms = await prisma.room.findMany({
    where: {
      id: { in: roomIds.map(Number) },
      dormitory: {
        ownerId: userId,
      },
    },
  });

  if (rooms.length !== roomIds.length) {
    return NextResponse.json(
      { success: false, message: "มีห้องที่ไม่พบหรือไม่ได้เป็นของคุณ" },
      { status: 404 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const tenant = await prisma.tenant.create({
    data: {
      name,
      phone,
      idCard: idCard || null,
      address,
      password: hashedPassword,
      rooms: {
        create: roomIds.map((roomId: number) => ({
          roomId: Number(roomId),
        })),
      },
    },
    include: {
      rooms: {
        include: {
          room: {
            select: {
              id: true,
              name: true,
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

  return NextResponse.json({
    success: true,
    tenant: {
      id: tenant.id,
      name: tenant.name,
      phone: tenant.phone,
      idCard: tenant.idCard,
      address: tenant.address,
      rooms: tenant.rooms,
      // ไม่ส่ง password กลับไป
    },
  });
}

// PUT: update tenant (แยกจากสัญญาเช่า)
export async function PUT(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const { id, name, phone, idCard, address, password, roomIds } =
    await req.json();

  if (!id || !name || !phone || !address)
    return NextResponse.json(
      { success: false, message: "ข้อมูลไม่ครบ" },
      { status: 400 }
    );

  // ตรวจสอบว่า rooms ที่ระบุเป็นของ user หรือไม่ (ถ้ามีการส่ง roomIds มา)
  if (roomIds && Array.isArray(roomIds) && roomIds.length > 0) {
    const rooms = await prisma.room.findMany({
      where: {
        id: { in: roomIds.map(Number) },
        dormitory: {
          ownerId: userId,
        },
      },
    });

    if (rooms.length !== roomIds.length) {
      return NextResponse.json(
        { success: false, message: "มีห้องที่ไม่พบหรือไม่ได้เป็นของคุณ" },
        { status: 404 }
      );
    }
  }

  // ตรวจสอบว่า tenant มีอยู่จริงและเป็นของ user
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: Number(id),
      rooms: {
        some: {
          room: {
            dormitory: {
              ownerId: userId,
            },
          },
        },
      },
    },
  });

  if (!tenant)
    return NextResponse.json(
      { success: false, message: "ไม่พบผู้เช่า" },
      { status: 404 }
    );

  // เตรียมข้อมูลสำหรับอัพเดท
  const updateData: any = {
    name,
    phone,
    idCard: idCard || null,
    address,
  };

  // Hash password ใหม่ถ้ามีการส่งมา
  if (password && password.trim()) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  // อัปเดต rooms ถ้ามีการส่งมา
  if (roomIds && Array.isArray(roomIds)) {
    updateData.rooms = {
      deleteMany: {}, // ลบ rooms เก่าทั้งหมด
      create: roomIds.map((roomId: number) => ({
        roomId: Number(roomId),
      })),
    };
  }

  const updated = await prisma.tenant.update({
    where: { id: Number(id) },
    data: updateData,
    include: {
      rooms: {
        include: {
          room: {
            select: {
              id: true,
              name: true,
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

  return NextResponse.json({
    success: true,
    tenant: {
      id: updated.id,
      name: updated.name,
      phone: updated.phone,
      idCard: updated.idCard,
      address: updated.address,
      rooms: updated.rooms,
      // ไม่ส่ง password กลับไป
    },
  });
}

// DELETE: delete tenant
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

  // ตรวจสอบว่า tenant มีอยู่จริงและเป็นของ user นี้
  const tenant = await prisma.tenant.findFirst({
    where: {
      id: Number(id),
      rooms: {
        some: {
          room: {
            dormitory: {
              ownerId: userId,
            },
          },
        },
      },
    },
  });

  if (!tenant)
    return NextResponse.json(
      { success: false, message: "ไม่พบผู้เช่าหรือไม่มีสิทธิ์ลบ" },
      { status: 404 }
    );

  // ใช้ transaction เพื่อลบข้อมูลที่เกี่ยวข้องทั้งหมด
  try {
    await prisma.$transaction(async (tx) => {
      // 1. ลบ Bills ที่เกี่ยวข้อง
      await tx.bill.deleteMany({
        where: {
          tenantId: Number(id),
        },
      });

      // 2. ลบ RentalContracts ที่เกี่ยวข้อง
      await tx.rentalContract.deleteMany({
        where: {
          tenantId: Number(id),
        },
      });

      // 3. ลบ TenantRoom relationships
      await tx.tenantRoom.deleteMany({
        where: {
          tenantId: Number(id),
        },
      });

      // 4. ลบ Tenant
      await tx.tenant.delete({
        where: {
          id: Number(id),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "ลบผู้เช่าและข้อมูลที่เกี่ยวข้องเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error deleting tenant:", error);
    return NextResponse.json(
      {
        success: false,
        message: "เกิดข้อผิดพลาดในการลบผู้เช่า",
      },
      { status: 500 }
    );
  }
}
