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

// POST: สร้าง linkCode ใหม่สำหรับ tenant
export async function POST(req: Request) {
  const userId = getUserIdFromAuth(req);
  if (!userId)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );

  try {
    const { tenantId } = await req.json();
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, message: "ต้องระบุ tenantId" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่า tenant เป็นของ user นี้
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: Number(tenantId),
        rooms: {
          some: {
            room: {
              dormitory: {
                ownerId: userId,
              },
            },
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, message: "ไม่พบผู้เช่าหรือไม่มีสิทธิ์" },
        { status: 404 }
      );
    }

    // สร้าง linkCode ใหม่
    const newLinkCode = crypto.randomUUID();
    
    const updatedTenant = await prisma.tenant.update({
      where: { id: Number(tenantId) },
      data: { linkCode: newLinkCode },
      select: { id: true, linkCode: true },
    });

    return NextResponse.json({
      success: true,
      tenantId: updatedTenant.id,
      linkCode: updatedTenant.linkCode,
      message: "สร้างรหัสเชื่อมต่อใหม่เรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Error regenerating tenant link code:", error);
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการสร้างรหัสเชื่อมต่อใหม่" },
      { status: 500 }
    );
  }
}




