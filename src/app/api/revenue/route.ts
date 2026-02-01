import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

export async function GET(req: NextRequest) {
  try {
    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "ไม่พบ token" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
    };

    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");
    const monthsParam = parseInt(searchParams.get("months") || "1");
    const month = monthParam ? parseInt(monthParam) : new Date().getMonth() + 1;
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    // helper to accumulate
    const sums: Record<string, number> = {
      rent: 0,
      water: 0,
      electric: 0,
      common: 0,
      other: 0,
    };

    const monthsToFetch = Math.max(monthsParam, 1);

    for (let i = 0; i < monthsToFetch; i++) {
      let targetMonth = month - i;
      let targetYear = year;
      if (targetMonth <= 0) {
        targetMonth += 12;
        targetYear -= 1;
      }

      const bills = await prisma.bill.findMany({
        where: {
          room: {
            dormitory: { ownerId: decoded.userId },
          },
          billDate: {
            gte: new Date(targetYear, targetMonth - 1, 1),
            lte: new Date(targetYear, targetMonth, 0, 23, 59, 59),
          },
        },
        select: {
          rent: true,
          water: true,
          electric: true,
          common: true,
          other: true,
        },
      });

      bills.forEach((b) => {
        sums.rent += b.rent || 0;
        sums.water += b.water || 0;
        sums.electric += b.electric || 0;
        sums.common += b.common || 0;
        sums.other += b.other || 0;
      });
    }

    const revenueByType = Object.entries(sums).map(([type, amount]) => ({
      type,
      amount,
    }));

    return NextResponse.json({ revenueByType });
  } catch (error) {
    console.error("Error fetching revenue by type:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}
