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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromAuth(req);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;
  const billId = Number(id);

  if (!billId) {
    return NextResponse.json(
      { success: false, message: "ต้องระบุ billId" },
      { status: 400 }
    );
  }

  // ดึงข้อมูลบิลพร้อมตรวจสอบสิทธิ์
  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: {
      room: {
        include: {
          dormitory: true,
        },
      },
    },
  });

  if (!bill) {
    return NextResponse.json(
      { success: false, message: "ไม่พบบิล" },
      { status: 404 }
    );
  }

  if (bill.room.dormitory.ownerId !== userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { isPaid } = body;

  if (typeof isPaid !== "boolean") {
    return NextResponse.json(
      { success: false, message: "ต้องระบุ isPaid เป็น boolean" },
      { status: 400 }
    );
  }

  const updatedBill = await prisma.bill.update({
    where: { id: billId },
    data: { isPaid },
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

  return NextResponse.json({ success: true, bill: updatedBill });
}

