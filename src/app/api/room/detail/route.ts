import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    // ตรวจสอบ authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "ไม่พบ token" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    const { searchParams } = new URL(req.url);
    const roomIdParam = searchParams.get("roomId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const monthNum = month ? parseInt(month) : null;
    const yearNum = year ? parseInt(year) : null;

    // หากมี roomId → คืนรายละเอียดห้องเดียว
    if (roomIdParam) {
      const room = await prisma.room.findFirst({
        where: {
          id: parseInt(roomIdParam),
          dormitory: { ownerId: decoded.userId },
        },
        include: {
          dormitory: { select: { id: true, name: true, address: true } },
          tenantRooms: {
            include: {
              tenant: { select: { id: true, name: true, phone: true } },
            },
          },
          rentalContracts: true,
          bills: true,
        },
      });

      if (!room)
        return NextResponse.json({ success: false, message: "ไม่พบห้อง" });

      return NextResponse.json({
        success: true,
        room,
        dormitory: room.dormitory,
      });
    }

    // Otherwise list top rooms
    const rooms = await prisma.room.findMany({
      where: {
        dormitory: { ownerId: decoded.userId },
      },
      include: {
        dormitory: {
          select: { id: true, name: true },
        },
        bills: {
          select: { total: true, billDate: true },
        },
        tenantRooms: {
          include: {
            tenant: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    const roomsComputed = rooms
      .map((room) => {
        let currentRevenue = 0;
        let prevRevenue = 0;
        room.bills.forEach((bill) => {
          const d = new Date(bill.billDate);
          const m = d.getMonth() + 1;
          const y = d.getFullYear();
          if (monthNum && yearNum) {
            if (m === monthNum && y === yearNum) currentRevenue += bill.total;
            const prevM = monthNum === 1 ? 12 : monthNum - 1;
            const prevY = monthNum === 1 ? yearNum - 1 : yearNum;
            if (m === prevM && y === prevY) prevRevenue += bill.total;
          } else {
            currentRevenue += bill.total; // fallback
          }
        });
        const change = currentRevenue - prevRevenue;
        const percentage =
          prevRevenue > 0 ? (change / prevRevenue) * 100 : null;

        return {
          id: room.id.toString(),
          name: room.name,
          dormitoryName: room.dormitory.name,
          totalRevenue: currentRevenue,
          prevRevenue,
          change,
          percentage,
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    return NextResponse.json({ rooms: roomsComputed });
  } catch (error) {
    console.error("Error fetching room details:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}
