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

    // ดึง query parameters
    const { searchParams } = new URL(req.url);
    const dormitoryId = searchParams.get("dormitoryId");
    const type = searchParams.get("type");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const limit = searchParams.get("limit");
    const sort = searchParams.get("sort");
    const groupBy = searchParams.get("groupBy");
    const monthsParam = parseInt(searchParams.get("months") || "1");

    // ตรวจสอบสิทธิ์เข้าถึงหอพัก
    const whereCondition: any = {
      dormitory: { ownerId: decoded.userId },
    };

    if (dormitoryId) {
      whereCondition.dormitoryId = parseInt(dormitoryId);
    }

    if (type) {
      whereCondition.type = type;
    }

    // กรองตามเดือน/ปี
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      whereCondition.expenseDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const expenses = await prisma.expense.findMany({
      where: whereCondition,
      include: {
        dormitory: {
          select: { id: true, name: true },
        },
        room: {
          select: { id: true, name: true },
        },
      },
      orderBy: { expenseDate: sort === "asc" ? "asc" : "desc" },
      take: limit ? parseInt(limit) : undefined,
    });

    // ดึงสถิติ
    const stats = await prisma.expense.aggregate({
      where: whereCondition,
      _sum: { amount: true },
      _count: { id: true },
    });

    // ดึงรายการตามประเภท
    const expensesByType = await prisma.expense.groupBy({
      by: ["type"],
      where: whereCondition,
      _sum: { amount: true },
      _count: { id: true },
    });

    if (groupBy === "month") {
      // compute expenses summed by month for recent monthsParam months ending at specified month/year or current
      const baseMonth = month ? parseInt(month) : new Date().getMonth() + 1;
      const baseYear = year ? parseInt(year) : new Date().getFullYear();

      const monthNamesShort = [
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

      const results: { month: string; expense: number }[] = [];

      for (let i = monthsParam - 1; i >= 0; i--) {
        let targetMonth = baseMonth - i;
        let targetYear = baseYear;
        if (targetMonth <= 0) {
          targetMonth += 12;
          targetYear -= 1;
        }

        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        const aggregate = await prisma.expense.aggregate({
          where: {
            dormitory: { ownerId: decoded.userId },
            expenseDate: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
        });

        results.push({
          month: monthNamesShort[targetMonth - 1],
          expense: aggregate._sum.amount || 0,
        });
      }

      return NextResponse.json({ monthlyExpenses: results });
    }

    if (groupBy === "type") {
      // Aggregate expenses by type
      if (monthsParam > 1) {
        // Aggregate expenses by type over the past `monthsParam` months ending at given month/year
        const baseMonth = month ? parseInt(month) : new Date().getMonth() + 1;
        const baseYear = year ? parseInt(year) : new Date().getFullYear();

        let startMonth = baseMonth - (monthsParam - 1);
        let startYear = baseYear;
        if (startMonth <= 0) {
          startYear -= Math.ceil(Math.abs(startMonth) / 12);
          startMonth = ((startMonth % 12) + 12) % 12; // convert to positive month 1-12
          if (startMonth === 0) startMonth = 12;
        }

        const startDate = new Date(startYear, startMonth - 1, 1);
        const endDate = new Date(baseYear, baseMonth, 0, 23, 59, 59);

        const expensesByType = await prisma.expense.groupBy({
          by: ["type"],
          where: {
            dormitory: { ownerId: decoded.userId },
            expenseDate: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
          _count: { id: true },
        });

        return NextResponse.json({ expensesByType });
      } else {
        // Single month - use existing expensesByType from above
        return NextResponse.json({ expensesByType });
      }
    }

    return NextResponse.json({
      expenses,
      stats: {
        totalAmount: stats._sum.amount || 0,
        totalCount: stats._count || 0,
      },
      expensesByType,
    });
  } catch (error: any) {
    console.error("Error fetching expenses:", error);
    // Log more details in production for debugging
    const errorMessage = error?.message || "Unknown error";
    const errorStack = process.env.NODE_ENV === "development" ? error?.stack : undefined;
    
    return NextResponse.json(
      { 
        error: "เกิดข้อผิดพลาดในการดึงข้อมูล",
        message: process.env.NODE_ENV === "development" ? errorMessage : undefined,
        stack: errorStack
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { dormitoryId, roomId, type, description, amount, expenseDate } =
      body;

    // ตรวจสอบว่าเป็นเจ้าของหอพัก
    const dormitory = await prisma.dormitory.findFirst({
      where: { id: dormitoryId, ownerId: decoded.userId },
    });

    if (!dormitory) {
      return NextResponse.json(
        { error: "ไม่พบหอพักหรือไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    // ตรวจสอบห้อง (ถ้ามี)
    if (roomId) {
      const room = await prisma.room.findFirst({
        where: { id: roomId, dormitoryId: dormitoryId },
      });

      if (!room) {
        return NextResponse.json(
          { error: "ไม่พบห้องในหอพักนี้" },
          { status: 400 }
        );
      }
    }

    const expense = await prisma.expense.create({
      data: {
        dormitoryId,
        roomId: roomId || null,
        type,
        description,
        amount: parseFloat(amount),
        expenseDate: new Date(expenseDate),
      },
      include: {
        dormitory: {
          select: { id: true, name: true },
        },
        room: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างรายการค่าใช้จ่าย" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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

    const body = await req.json();
    const { id, dormitoryId, roomId, type, description, amount, expenseDate } =
      body;

    // ตรวจสอบว่าเป็นเจ้าของหอพัก
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: id,
        dormitory: { ownerId: decoded.userId },
      },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: "ไม่พบรายการค่าใช้จ่ายหรือไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    // ตรวจสอบห้อง (ถ้ามี)
    if (roomId) {
      const room = await prisma.room.findFirst({
        where: { id: roomId, dormitoryId: dormitoryId },
      });

      if (!room) {
        return NextResponse.json(
          { error: "ไม่พบห้องในหอพักนี้" },
          { status: 400 }
        );
      }
    }

    const expense = await prisma.expense.update({
      where: { id: id },
      data: {
        dormitoryId,
        roomId: roomId || null,
        type,
        description,
        amount: parseFloat(amount),
        expenseDate: new Date(expenseDate),
      },
      include: {
        dormitory: {
          select: { id: true, name: true },
        },
        room: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตรายการค่าใช้จ่าย" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ไม่พบ ID รายการค่าใช้จ่าย" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าเป็นเจ้าของหอพัก
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: parseInt(id),
        dormitory: { ownerId: decoded.userId },
      },
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: "ไม่พบรายการค่าใช้จ่ายหรือไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    await prisma.expense.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "ลบรายการค่าใช้จ่ายสำเร็จ" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบรายการค่าใช้จ่าย" },
      { status: 500 }
    );
  }
}
