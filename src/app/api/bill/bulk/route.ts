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

export async function POST(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    const { bills } = await req.json();

    if (!bills || !Array.isArray(bills) || bills.length === 0) {
      return NextResponse.json(
        { success: false, message: "ต้องส่งข้อมูลบิลอย่างน้อย 1 รายการ" },
        { status: 400 }
      );
    }

    // Validate room ownership for all bills
    const roomIds = [...new Set(bills.map((bill) => bill.roomId))];
    const rooms = await prisma.room.findMany({
      where: {
        id: { in: roomIds },
        dormitory: {
          ownerId: userId,
        },
      },
      select: { id: true },
    });

    if (rooms.length !== roomIds.length) {
      return NextResponse.json(
        { success: false, message: "ไม่มีสิทธิ์เข้าถึงห้องบางห้อง" },
        { status: 403 }
      );
    }

    // Validate tenants for all bills
    const tenantIds = [...new Set(bills.map((bill) => bill.tenantId))];
    const tenants = await prisma.tenant.findMany({
      where: {
        id: { in: tenantIds },
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
      select: { id: true },
    });

    if (tenants.length !== tenantIds.length) {
      return NextResponse.json(
        { success: false, message: "ไม่พบผู้เช่าบางคน" },
        { status: 400 }
      );
    }

    // Bulk create bills
    const results = await Promise.allSettled(
      bills.map(async (billData: any) => {
        return await prisma.bill.create({
          data: {
            billDate: billData.billDate
              ? new Date(billData.billDate)
              : new Date(),
            tenantId: Number(billData.tenantId),
            water: Number(billData.water) || 0,
            electric: Number(billData.electric) || 0,
            common: Number(billData.common) || 0,
            other: Number(billData.other) || 0,
            rent: Number(billData.rent) || 0,
            discount: Number(billData.discount) || 0,
            total: Number(billData.total) || 0,
            meterWaterStart: billData.meterWaterStart
              ? Number(billData.meterWaterStart)
              : null,
            meterWaterEnd: billData.meterWaterEnd
              ? Number(billData.meterWaterEnd)
              : null,
            meterElectricStart: billData.meterElectricStart
              ? Number(billData.meterElectricStart)
              : null,
            meterElectricEnd: billData.meterElectricEnd
              ? Number(billData.meterElectricEnd)
              : null,
            roomId: Number(billData.roomId),
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
      })
    );

    const successful = results.filter(
      (result) => result.status === "fulfilled"
    );
    const failed = results.filter((result) => result.status === "rejected");

    return NextResponse.json({
      success: true,
      message: `Import สำเร็จ ${successful.length} รายการ${
        failed.length > 0 ? `, ไม่สำเร็จ ${failed.length} รายการ` : ""
      }`,
      successCount: successful.length,
      failedCount: failed.length,
      bills: successful.map(
        (result) => (result as PromiseFulfilledResult<any>).value
      ),
      errors: failed.map((result) => (result as PromiseRejectedResult).reason),
    });
  } catch (error) {
    console.error("Error in bulk bill import:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการ Import บิล" },
      { status: 500 }
    );
  }
}
