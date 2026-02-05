import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyLinkToken,
  linkLineAccountToUser,
  linkLineAccountToTenant,
  setRichMenuForUser,
} from "@/lib/line-account";
import { pushMessage } from "@/lib/line";

// Rich Menu IDs from environment
const RICH_MENU_IDS = {
  owner: process.env.LINE_RICHMENU_OWNER || "",
  tenant: process.env.LINE_RICHMENU_TENANT || "",
};

/**
 * POST /api/line/link
 * Link LINE account to User or Tenant
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, userId, tenantId } = body;

    // Verify link token
    const tokenData = verifyLinkToken(token);

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 400 }
      );
    }

    if (!tokenData.valid) {
      return NextResponse.json(
        { success: false, error: "Token expired" },
        { status: 400 }
      );
    }

    const { lineUserId, role } = tokenData;

    // Link to user or tenant based on role
    if (role === "owner" && userId) {
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      // Link LINE account to user
      await linkLineAccountToUser(lineUserId, userId);

      // Set owner rich menu
      if (RICH_MENU_IDS.owner) {
        await setRichMenuForUser(lineUserId, RICH_MENU_IDS.owner);
      }

      // Send confirmation message to LINE
      await pushMessage(lineUserId, [
        {
          type: "text",
          text: `✅ เชื่อมต่อบัญชีสำเร็จ!\n\nสวัสดีคุณ ${user.name}\nตอนนี้คุณสามารถใช้งาน Dormy ผ่าน LINE ได้แล้ว\n\nใช้เมนูด้านล่างเพื่อจัดการหอพักของคุณ`,
        },
      ]);

      return NextResponse.json({
        success: true,
        message: "LINE account linked to user successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } else if (role === "tenant" && tenantId) {
      // Verify tenant exists
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
          rooms: {
            include: {
              room: {
                include: {
                  dormitory: true,
                },
              },
            },
          },
        },
      });

      if (!tenant) {
        return NextResponse.json(
          { success: false, error: "Tenant not found" },
          { status: 404 }
        );
      }

      // Link LINE account to tenant
      await linkLineAccountToTenant(lineUserId, tenantId);

      // Set tenant rich menu
      if (RICH_MENU_IDS.tenant) {
        await setRichMenuForUser(lineUserId, RICH_MENU_IDS.tenant);
      }

      // Get room info
      const roomInfo = tenant.rooms[0]
        ? `ห้อง ${tenant.rooms[0].room.name} - ${tenant.rooms[0].room.dormitory.name}`
        : "ยังไม่มีข้อมูลห้อง";

      // Send confirmation message to LINE
      await pushMessage(lineUserId, [
        {
          type: "text",
          text: `✅ เชื่อมต่อบัญชีสำเร็จ!\n\nสวัสดีคุณ ${tenant.name}\n${roomInfo}\n\nตอนนี้คุณสามารถดูบิล ชำระเงิน และแจ้งซ่อมผ่าน LINE ได้แล้ว`,
        },
      ]);

      return NextResponse.json({
        success: true,
        message: "LINE account linked to tenant successfully",
        tenant: {
          id: tenant.id,
          name: tenant.name,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid request - userId or tenantId required" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error linking LINE account:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/line/link?token=xxx
 * Verify link token and return LINE user info
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    const tokenData = verifyLinkToken(token);

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 400 }
      );
    }

    if (!tokenData.valid) {
      return NextResponse.json(
        { success: false, error: "Token expired" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      lineUserId: tokenData.lineUserId,
      role: tokenData.role,
    });
  } catch (error: any) {
    console.error("Error verifying token:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}







