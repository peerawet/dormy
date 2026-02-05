import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadToS3, deleteFromS3, getKeyFromUrl } from "@/lib/s3";
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

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const billId = Number(id);

  // ตรวจสอบสิทธิ์
  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: {
      room: {
        include: { dormitory: true },
      },
    },
  });

  if (!bill || bill.room.dormitory.ownerId !== userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "ไม่พบไฟล์" },
        { status: 400 }
      );
    }

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "ประเภทไฟล์ไม่ถูกต้อง (รองรับ: JPG, PNG, PDF)" },
        { status: 400 }
      );
    }

    // ตรวจสอบขนาดไฟล์ (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "ไฟล์ใหญ่เกินไป (สูงสุด 10MB)" },
        { status: 400 }
      );
    }

    // ลบไฟล์เก่า (ถ้ามี)
    if (bill.slipUrl) {
      const oldKey = getKeyFromUrl(bill.slipUrl);
      if (oldKey) {
        try {
          await deleteFromS3(oldKey);
        } catch (e) {
          console.warn("Failed to delete old slip:", e);
        }
      }
    }

    // สร้างชื่อไฟล์: bills/{dormitoryId}/{roomId}/{billId}/{timestamp}.{ext}
    const timestamp = Date.now();
    const ext = file.name.split(".").pop() || "jpg";
    const key = `bills/${bill.room.dormitoryId}/${bill.roomId}/${billId}/${timestamp}.${ext}`;

    // อัปโหลดไปยัง S3
    const buffer = Buffer.from(await file.arrayBuffer());
    const slipUrl = await uploadToS3(buffer, key, file.type);

    // อัปเดต Bill ในฐานข้อมูล
    const updatedBill = await prisma.bill.update({
      where: { id: billId },
      data: { slipUrl },
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

    return NextResponse.json({
      success: true,
      slipUrl,
      bill: updatedBill,
    });
  } catch (error: any) {
    console.error("Error uploading slip:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาดในการอัปโหลด" },
      { status: 500 }
    );
  }
}

// ลบสลิป
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  const billId = Number(id);

  // ตรวจสอบสิทธิ์
  const bill = await prisma.bill.findUnique({
    where: { id: billId },
    include: {
      room: {
        include: { dormitory: true },
      },
    },
  });

  if (!bill || bill.room.dormitory.ownerId !== userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  if (!bill.slipUrl) {
    return NextResponse.json(
      { success: false, message: "ไม่มีสลิปให้ลบ" },
      { status: 400 }
    );
  }

  try {
    // ลบไฟล์จาก S3
    const key = getKeyFromUrl(bill.slipUrl);
    if (key) {
      await deleteFromS3(key);
    }

    // อัปเดต Bill ในฐานข้อมูล
    const updatedBill = await prisma.bill.update({
      where: { id: billId },
      data: { slipUrl: null },
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

    return NextResponse.json({
      success: true,
      bill: updatedBill,
    });
  } catch (error: any) {
    console.error("Error deleting slip:", error);
    return NextResponse.json(
      { success: false, message: error.message || "เกิดข้อผิดพลาดในการลบ" },
      { status: 500 }
    );
  }
}


