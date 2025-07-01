import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

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
      email: string;
    };

    // Check if user owns any dormitories
    const userDormitories = await prisma.dormitory.count({
      where: { ownerId: decoded.userId },
    });

    if (userDormitories === 0) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์เข้าถึง - ไม่พบหอพักที่เป็นเจ้าของ" },
        { status: 403 }
      );
    }

    // ดึง query parameters
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth() + 1;

    // วันที่เริ่มต้นและสิ้นสุดของเดือน
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // ดึงข้อมูลห้องทั้งหมด
    const totalRooms = await prisma.room.count({
      where: { dormitory: { ownerId: decoded.userId } },
    });

    // ดึงข้อมูลห้องที่มีผู้เช่า
    const occupiedRooms = await prisma.tenantRoom.count({
      where: {
        room: { dormitory: { ownerId: decoded.userId } },
      },
    });

    // ดึงข้อมูลรายได้ในเดือนที่เลือก
    const monthlyBills = await prisma.bill.findMany({
      where: {
        room: { dormitory: { ownerId: decoded.userId } },
        billDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        tenant: { select: { name: true } },
        room: { select: { name: true } },
      },
    });

    const monthlyRevenue = monthlyBills.reduce(
      (sum, bill) => sum + bill.total,
      0
    );
    const totalBills = monthlyBills.length;

    // ดึงข้อมูลรายได้รวมทั้งหมด
    const allBills = await prisma.bill.findMany({
      where: {
        room: { dormitory: { ownerId: decoded.userId } },
      },
    });

    const totalRevenue = allBills.reduce((sum, bill) => sum + bill.total, 0);

    // ดึงข้อมูลผู้เช่าทั้งหมด
    const totalTenants = await prisma.tenant.count({
      where: {
        rooms: {
          some: {
            room: { dormitory: { ownerId: decoded.userId } },
          },
        },
      },
    });

    // ดึงข้อมูลสัญญาเช่าที่ใกล้หมดอายุ (30 วันข้างหน้า)
    const upcomingExpiry = new Date();
    upcomingExpiry.setDate(upcomingExpiry.getDate() + 30);

    const expiringContracts = await prisma.rentalContract.count({
      where: {
        tenant: {
          rooms: {
            some: {
              room: { dormitory: { ownerId: decoded.userId } },
            },
          },
        },
        endDate: {
          lte: upcomingExpiry,
          gte: new Date(),
        },
      },
    });

    // ดึงข้อมูลรายได้ 6 เดือนย้อนหลัง สำหรับกราฟ
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(targetYear, targetMonth - 1 - i, 1);
      const nextDate = new Date(targetYear, targetMonth - i, 0, 23, 59, 59);

      const bills = await prisma.bill.findMany({
        where: {
          room: { dormitory: { ownerId: decoded.userId } },
          billDate: {
            gte: date,
            lte: nextDate,
          },
        },
      });

      const revenue = bills.reduce((sum, bill) => sum + bill.total, 0);
      const billCount = bills.length;

      monthlyData.push({
        month: date.toLocaleDateString("th-TH", {
          month: "short",
          year: "numeric",
        }),
        revenue,
        billCount,
        date: date.toISOString(),
      });
    }

    // ดึงข้อมูลรายได้ตามประเภท
    const revenueByType = await prisma.bill.aggregate({
      where: {
        room: { dormitory: { ownerId: decoded.userId } },
        billDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        rent: true,
        water: true,
        electric: true,
        common: true,
        other: true,
      },
    });

    // ดึงข้อมูลห้องว่าง
    const availableRooms = totalRooms - occupiedRooms;

    // ดึงข้อมูล top 5 ห้องที่มีรายได้สูงสุด
    // First get room IDs owned by user
    const userRooms = await prisma.room.findMany({
      where: { dormitory: { ownerId: decoded.userId } },
      select: { id: true },
    });
    const roomIds = userRooms.map((room) => room.id);

    const topRooms = await prisma.bill.groupBy({
      by: ["roomId"],
      where: {
        roomId: { in: roomIds },
        billDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          total: "desc",
        },
      },
      take: 5,
    });

    // ดึงข้อมูลรายละเอียดของห้องที่มีรายได้สูงสุด
    const topRoomsData = await Promise.all(
      topRooms.map(async (room) => {
        const roomData = await prisma.room.findUnique({
          where: { id: room.roomId },
          select: { name: true },
        });

        return {
          roomName: roomData?.name || "",
          revenue: room._sum.total || 0,
          billCount: room._count.id,
        };
      })
    );

    const dashboardStats = {
      overview: {
        totalRooms,
        occupiedRooms,
        availableRooms,
        occupancyRate:
          totalRooms > 0
            ? ((occupiedRooms / totalRooms) * 100).toFixed(1)
            : "0",
        totalTenants,
        totalRevenue,
        monthlyRevenue,
        totalBills,
        expiringContracts,
      },
      monthlyData,
      revenueByType: {
        rent: revenueByType._sum.rent || 0,
        water: revenueByType._sum.water || 0,
        electric: revenueByType._sum.electric || 0,
        common: revenueByType._sum.common || 0,
        other: revenueByType._sum.other || 0,
      },
      topRooms: topRoomsData,
      period: {
        month: targetMonth,
        year: targetYear,
        monthName: startDate.toLocaleDateString("th-TH", {
          month: "long",
          year: "numeric",
        }),
      },
    };

    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}
