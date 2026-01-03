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

    // ดึง query parameters
    const { searchParams } = new URL(req.url);
    const dormitoryId = searchParams.get("dormitoryId");
    const type = searchParams.get("type");
    const isActive = searchParams.get("isActive");

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

    if (isActive !== null && isActive !== undefined) {
      whereCondition.isActive = isActive === "true";
    }

    const recurringExpenses = await prisma.recurringExpense.findMany({
      where: whereCondition,
      include: {
        dormitory: {
          select: { id: true, name: true },
        },
        room: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // ดึงสถิติ
    const stats = await prisma.recurringExpense.aggregate({
      where: whereCondition,
      _sum: { amount: true },
      _count: { id: true },
    });

    return NextResponse.json({
      recurringExpenses,
      stats: {
        totalAmount: stats._sum.amount || 0,
        totalCount: stats._count || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching recurring expenses:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    const body = await req.json();
    const {
      dormitoryId,
      roomId,
      type,
      description,
      amount,
      frequency,
      dayOfMonth,
      isActive,
    } = body;

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

    // Validate frequency and dayOfMonth
    if (frequency === "monthly" && (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31)) {
      return NextResponse.json(
        { error: "วันที่ต้องอยู่ระหว่าง 1-31 สำหรับรายเดือน" },
        { status: 400 }
      );
    }

    const recurringExpense = await prisma.recurringExpense.create({
      data: {
        dormitoryId,
        roomId: roomId || null,
        type,
        description,
        amount: parseFloat(amount),
        frequency,
        dayOfMonth: frequency === "monthly" ? parseInt(dayOfMonth) : null,
        isActive: isActive !== undefined ? isActive : true,
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

    return NextResponse.json(recurringExpense);
  } catch (error) {
    console.error("Error creating recurring expense:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการสร้างรายการค่าใช้จ่ายประจำ" },
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    const body = await req.json();
    const {
      id,
      dormitoryId,
      roomId,
      type,
      description,
      amount,
      frequency,
      dayOfMonth,
      isActive,
    } = body;

    // ตรวจสอบว่าเป็นเจ้าของหอพัก
    const existingRecurringExpense =
      await prisma.recurringExpense.findFirst({
        where: {
          id: id,
          dormitory: { ownerId: decoded.userId },
        },
      });

    if (!existingRecurringExpense) {
      return NextResponse.json(
        { error: "ไม่พบรายการค่าใช้จ่ายประจำหรือไม่มีสิทธิ์เข้าถึง" },
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

    // Validate frequency and dayOfMonth
    if (frequency === "monthly" && (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31)) {
      return NextResponse.json(
        { error: "วันที่ต้องอยู่ระหว่าง 1-31 สำหรับรายเดือน" },
        { status: 400 }
      );
    }

    const recurringExpense = await prisma.recurringExpense.update({
      where: { id: id },
      data: {
        dormitoryId,
        roomId: roomId || null,
        type,
        description,
        amount: parseFloat(amount),
        frequency,
        dayOfMonth: frequency === "monthly" ? parseInt(dayOfMonth) : null,
        isActive: isActive !== undefined ? isActive : true,
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

    return NextResponse.json(recurringExpense);
  } catch (error) {
    console.error("Error updating recurring expense:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตรายการค่าใช้จ่ายประจำ" },
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
    };

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ไม่พบ ID รายการค่าใช้จ่ายประจำ" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าเป็นเจ้าของหอพัก
    const existingRecurringExpense =
      await prisma.recurringExpense.findFirst({
        where: {
          id: parseInt(id),
          dormitory: { ownerId: decoded.userId },
        },
      });

    if (!existingRecurringExpense) {
      return NextResponse.json(
        { error: "ไม่พบรายการค่าใช้จ่ายประจำหรือไม่มีสิทธิ์เข้าถึง" },
        { status: 403 }
      );
    }

    await prisma.recurringExpense.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      message: "ลบรายการค่าใช้จ่ายประจำสำเร็จ",
    });
  } catch (error) {
    console.error("Error deleting recurring expense:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบรายการค่าใช้จ่ายประจำ" },
      { status: 500 }
    );
  }
}

