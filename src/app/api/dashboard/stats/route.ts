import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function GET(req: NextRequest) {
  try {
    // ตรวจสอบ authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "ไม่พบ token" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
    };

    const { searchParams } = new URL(req.url);
    const month = parseInt(
      searchParams.get("month") || new Date().getMonth() + 1 + ""
    );
    const year = parseInt(
      searchParams.get("year") || new Date().getFullYear() + ""
    );

    // ดึงข้อมูลหอพักของผู้ใช้
    const userDormitories = await prisma.dormitory.findMany({
      where: { ownerId: decoded.userId },
      include: {
        rooms: {
          include: {
            tenantRooms: {
              include: { tenant: true },
            },
            bills: true,
          },
        },
      },
    });

    if (!userDormitories.length) {
      return NextResponse.json({
        overview: {
          totalRooms: 0,
          occupiedRooms: 0,
          availableRooms: 0,
          occupancyRate: "0%",
          totalTenants: 0,

          monthlyRevenue: 0,
          totalBills: 0,
        },
        monthlyData: [],
        monthlyGrowth: null,
      });
    }

    // คำนวณสถิติพื้นฐาน
    const totalRooms = userDormitories.reduce(
      (sum, dorm) => sum + dorm.rooms.length,
      0
    );
    const occupiedRooms = userDormitories.reduce(
      (sum, dorm) =>
        sum + dorm.rooms.filter((room) => room.tenantRooms.length > 0).length,
      0
    );
    const availableRooms = totalRooms - occupiedRooms;
    const occupancyRate =
      totalRooms > 0
        ? ((occupiedRooms / totalRooms) * 100).toFixed(1) + "%"
        : "0%";

    // นับจำนวนผู้เช่าทั้งหมด (unique tenants)
    const uniqueTenantIds = new Set();
    userDormitories.forEach((dorm) => {
      dorm.rooms.forEach((room) => {
        room.tenantRooms.forEach((tr) => {
          uniqueTenantIds.add(tr.tenantId);
        });
      });
    });
    const totalTenants = uniqueTenantIds.size;

    // คำนวณรายได้
    const allBills = userDormitories.flatMap((dorm) =>
      dorm.rooms.flatMap((room) => room.bills)
    );

    // รายได้เดือนปัจจุบัน
    const currentMonthBills = allBills.filter((bill) => {
      const billDate = new Date(bill.billDate);
      return (
        billDate.getMonth() + 1 === month && billDate.getFullYear() === year
      );
    });
    const monthlyRevenue = currentMonthBills.reduce(
      (sum, bill) => sum + bill.total,
      0
    );

    const totalBills = allBills.length;

    // นับสัญญาใกล้หมดอายุ (30 วัน)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // ข้อมูลรายได้รายเดือน (6 เดือนล่าสุด)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const targetMonth = month - i;
      const targetYear = targetMonth <= 0 ? year - 1 : year;
      const adjustedMonth = targetMonth <= 0 ? targetMonth + 12 : targetMonth;

      const monthBills = allBills.filter((bill) => {
        const billDate = new Date(bill.billDate);
        return (
          billDate.getMonth() + 1 === adjustedMonth &&
          billDate.getFullYear() === targetYear
        );
      });

      const monthRevenue = monthBills.reduce(
        (sum, bill) => sum + bill.total,
        0
      );

      const monthNames = [
        "ม.ค.",
        "ก.พ.",
        "มี.ค.",
        "เม.ย.",
        "พ.ค.",
        "มิ.ย.",
        "ก.ค.",
        "ส.ค.",
        "ก.ย.",
        "ต.ค.",
        "พ.ย.",
        "ธ.ค.",
      ];

      monthlyData.push({
        month: monthNames[adjustedMonth - 1],
        revenue: monthRevenue,
      });
    }

    // คำนวณการเติบโตรายเดือน
    let monthlyGrowth = null;
    if (monthlyData.length >= 2) {
      const currentRevenue = monthlyData[monthlyData.length - 1].revenue;
      const previousRevenue = monthlyData[monthlyData.length - 2].revenue;

      if (previousRevenue > 0) {
        const change = currentRevenue - previousRevenue;
        const percentage = (change / previousRevenue) * 100;
        monthlyGrowth = {
          change,
          percentage,
          isPositive: change >= 0,
        };
      }
    }

    return NextResponse.json({
      overview: {
        totalRooms,
        occupiedRooms,
        availableRooms,
        occupancyRate,
        totalTenants,

        monthlyRevenue,
        totalBills,
      },
      monthlyData,
      monthlyGrowth,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}
