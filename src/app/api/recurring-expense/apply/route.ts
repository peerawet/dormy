import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "changeme";

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
    const { recurringExpenseId, expenseDate } = body;

    if (!recurringExpenseId) {
      return NextResponse.json(
        { error: "ไม่พบ ID ค่าใช้จ่ายประจำ" },
        { status: 400 }
      );
    }

    // ดึงข้อมูล recurring expense
    const recurringExpense = await prisma.recurringExpense.findFirst({
      where: {
        id: recurringExpenseId,
        dormitory: { ownerId: decoded.userId },
        isActive: true,
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

    if (!recurringExpense) {
      return NextResponse.json(
        { error: "ไม่พบค่าใช้จ่ายประจำหรือไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    // สร้าง expense จาก recurring expense
    const expenseDateToUse = expenseDate
      ? new Date(expenseDate)
      : new Date();

    const expense = await prisma.expense.create({
      data: {
        dormitoryId: recurringExpense.dormitoryId,
        roomId: recurringExpense.roomId || null,
        type: recurringExpense.type,
        description: recurringExpense.description,
        amount: recurringExpense.amount,
        expenseDate: expenseDateToUse,
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

    return NextResponse.json({
      success: true,
      expense,
      message: "สร้างค่าใช้จ่ายสำเร็จ",
    });
  } catch (error) {
    console.error("Error applying recurring expense:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างค่าใช้จ่าย" },
      { status: 500 }
    );
  }
}

