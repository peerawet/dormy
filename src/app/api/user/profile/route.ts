import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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

// GET: ดึงข้อมูลโปรไฟล์ผู้ใช้
export async function GET(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        idCard: true,
        promptpay: true,
        linkCode: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "ไม่พบผู้ใช้" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้" },
      { status: 500 }
    );
  }
}

// PUT: อัปเดตข้อมูลโปรไฟล์ผู้ใช้
export async function PUT(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    const { name, phone, address, idCard, promptpay } = await req.json();

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "ชื่อและเบอร์โทรศัพท์จำเป็นต้องกรอก" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        address: address || null,
        idCard: idCard || null,
        promptpay: promptpay || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        idCard: true,
        promptpay: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้" },
      { status: 500 }
    );
  }
}

// PATCH: สร้าง linkCode ใหม่
export async function PATCH(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    const newLinkCode = crypto.randomUUID();
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { linkCode: newLinkCode },
      select: { linkCode: true },
    });

    return NextResponse.json({ 
      success: true, 
      linkCode: updatedUser.linkCode,
      message: "สร้างรหัสเชื่อมต่อใหม่เรียบร้อยแล้ว"
    });
  } catch (error) {
    console.error("Error regenerating link code:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการสร้างรหัสเชื่อมต่อใหม่" },
      { status: 500 }
    );
  }
}
