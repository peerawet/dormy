import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { replyMessage, getUserProfile } from "@/lib/line";
import { prisma } from "@/lib/prisma";
import { setUserRichMenu, unlinkUserRichMenu } from "@/lib/line-rich-menu";

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";
const BASE_URL = process.env.NEXTAUTH_URL || "https://dormy.forifi.xyz";

// Rich Menu IDs - ตั้งค่าหลังจาก deploy rich menus
const RICH_MENU_IDS = {
  default: process.env.LINE_RICHMENU_DEFAULT || "",
  owner: process.env.LINE_RICHMENU_OWNER || "",
  tenant: process.env.LINE_RICHMENU_TENANT || "",
};

// เก็บสถานะการรอรับ linkCode (in-memory, production ควรใช้ Redis)
const pendingLinkSessions = new Map<string, { role: "owner" | "tenant"; timestamp: number }>();

// Verify LINE webhook signature
function verifySignature(body: string, signature: string): boolean {
  if (!LINE_CHANNEL_SECRET) {
    console.error("LINE_CHANNEL_SECRET is not set");
    return false;
  }

  const hash = crypto
    .createHmac("sha256", LINE_CHANNEL_SECRET)
    .update(body)
    .digest("base64");

  return hash === signature;
}

// Handle LINE webhook events
async function handleLineEvents(events: any[]) {
  for (const event of events) {
    console.log("LINE Event:", event.type, event);

    switch (event.type) {
      case "message":
        await handleMessageEvent(event);
        break;
      case "follow":
        await handleFollowEvent(event);
        break;
      case "unfollow":
        await handleUnfollowEvent(event);
        break;
      case "postback":
        await handlePostbackEvent(event);
        break;
      default:
        console.log("Unhandled event type:", event.type);
    }
  }
}

// Handle message events
async function handleMessageEvent(event: any) {
  const { message, replyToken, source } = event;
  const lineUserId = source.userId;

  if (message.type === "text") {
    const userMessage = message.text.trim();
    console.log("📨 User message:", userMessage);

    // ตรวจสอบว่ากำลังรอรับ linkCode หรือไม่
    const pendingSession = pendingLinkSessions.get(lineUserId);
    
    if (pendingSession) {
      // ตรวจสอบว่า session หมดอายุหรือยัง (30 นาที)
      if (Date.now() - pendingSession.timestamp > 30 * 60 * 1000) {
        pendingLinkSessions.delete(lineUserId);
        await replyMessage(replyToken, [
          { type: "text", text: "Session หมดอายุแล้ว กรุณาเลือก role ใหม่จากเมนูด้านล่าง" },
        ]);
        return;
      }

      // User กำลังส่ง linkCode มา
      await handleLinkCode(replyToken, lineUserId, userMessage, pendingSession.role);
      return;
    }

    // ตรวจสอบว่า user ลงทะเบียนแล้วหรือยัง
    const account = await getLineAccount(lineUserId);

    if (!account || !account.isVerified) {
      await replyMessage(replyToken, [
        {
          type: "text",
          text: "สวัสดีครับ! กรุณาเลือกประเภทผู้ใช้งานจากเมนูด้านล่างเพื่อเริ่มต้นใช้งาน",
        },
      ]);
      return;
    }

    // User ลงทะเบียนแล้ว - ตอบกลับปกติ
    if (account.role === "owner") {
      await replyMessage(replyToken, [
        {
          type: "text",
          text: `สวัสดีคุณ ${account.user?.name || account.displayName || "เจ้าของ"}!\n\nใช้เมนูด้านล่างเพื่อจัดการหอพักของคุณ`,
        },
      ]);
    } else {
      await replyMessage(replyToken, [
        {
          type: "text",
          text: `สวัสดีคุณ ${account.tenant?.name || account.displayName || "ผู้เช่า"}!\n\nใช้เมนูด้านล่างเพื่อดูข้อมูลห้องพักของคุณ`,
        },
      ]);
    }
  }
}

// Handle linkCode verification
async function handleLinkCode(
  replyToken: string,
  lineUserId: string,
  linkCode: string,
  role: "owner" | "tenant"
) {
  try {
    // ลบ session ออก
    pendingLinkSessions.delete(lineUserId);

    // Get LINE profile
    const profile = await getUserProfile(lineUserId);

    if (role === "owner") {
      // หา User จาก linkCode
      const user = await prisma.user.findUnique({
        where: { linkCode },
      });

      if (!user) {
        await replyMessage(replyToken, [
          {
            type: "text",
            text: "❌ ไม่พบรหัสเชื่อมต่อนี้\n\nกรุณาตรวจสอบรหัสอีกครั้ง หรือดูรหัสได้ที่หน้า Settings ในเว็บไซต์",
          },
        ]);
        return;
      }

      // สร้างหรืออัปเดต LineAccount
      await prisma.lineAccount.upsert({
        where: { lineUserId },
        create: {
          lineUserId,
          role: "owner",
          userId: user.id,
          displayName: profile?.displayName,
          pictureUrl: profile?.pictureUrl,
          isVerified: true,
        },
        update: {
          role: "owner",
          userId: user.id,
          tenantId: null,
          displayName: profile?.displayName,
          pictureUrl: profile?.pictureUrl,
          isVerified: true,
        },
      });

      // เปลี่ยน Rich Menu
      if (RICH_MENU_IDS.owner) {
        await setUserRichMenu(lineUserId, RICH_MENU_IDS.owner);
      }

      await replyMessage(replyToken, [
        {
          type: "text",
          text: `✅ เชื่อมต่อสำเร็จ!\n\nสวัสดีคุณ ${user.name}\nตอนนี้คุณสามารถใช้งาน Dormy ผ่าน LINE ได้แล้ว\n\nใช้เมนูด้านล่างเพื่อจัดการหอพักของคุณ`,
        },
      ]);

      console.log(`✅ Linked LINE ${lineUserId} to User ${user.id} (${user.name})`);
    } else {
      // หา Tenant จาก linkCode
      const tenant = await prisma.tenant.findUnique({
        where: { linkCode },
        include: {
          rooms: {
            include: {
              room: {
                include: { dormitory: true },
              },
            },
          },
        },
      });

      if (!tenant) {
        await replyMessage(replyToken, [
          {
            type: "text",
            text: "❌ ไม่พบรหัสเชื่อมต่อนี้\n\nกรุณาติดต่อเจ้าของหอพักเพื่อขอรหัสเชื่อมต่อ",
          },
        ]);
        return;
      }

      // สร้างหรืออัปเดต LineAccount
      await prisma.lineAccount.upsert({
        where: { lineUserId },
        create: {
          lineUserId,
          role: "tenant",
          tenantId: tenant.id,
          displayName: profile?.displayName,
          pictureUrl: profile?.pictureUrl,
          isVerified: true,
        },
        update: {
          role: "tenant",
          tenantId: tenant.id,
          userId: null,
          displayName: profile?.displayName,
          pictureUrl: profile?.pictureUrl,
          isVerified: true,
        },
      });

      // เปลี่ยน Rich Menu
      if (RICH_MENU_IDS.tenant) {
        await setUserRichMenu(lineUserId, RICH_MENU_IDS.tenant);
      }

      // Get room info
      const roomInfo = tenant.rooms[0]
        ? `ห้อง ${tenant.rooms[0].room.name} - ${tenant.rooms[0].room.dormitory.name}`
        : "";

      await replyMessage(replyToken, [
        {
          type: "text",
          text: `✅ เชื่อมต่อสำเร็จ!\n\nสวัสดีคุณ ${tenant.name}\n${roomInfo}\n\nตอนนี้คุณสามารถดูบิล ชำระเงิน และแจ้งซ่อมผ่าน LINE ได้แล้ว`,
        },
      ]);

      console.log(`✅ Linked LINE ${lineUserId} to Tenant ${tenant.id} (${tenant.name})`);
    }
  } catch (error: any) {
    console.error("❌ Failed to link account:", error.message);
    await replyMessage(replyToken, [
      {
        type: "text",
        text: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      },
    ]);
  }
}

// Get LINE account from database
async function getLineAccount(lineUserId: string) {
  try {
    return await prisma.lineAccount.findUnique({
      where: { lineUserId },
      include: {
        user: true,
        tenant: true,
      },
    });
  } catch (error) {
    console.error("Error getting LINE account:", error);
    return null;
  }
}

// Handle follow events (when user adds your LINE OA)
async function handleFollowEvent(event: any) {
  const lineUserId = event.source.userId;
  const replyToken = event.replyToken;

  console.log("👤 User followed:", lineUserId);

  try {
    const profile = await getUserProfile(lineUserId);
    const existing = await getLineAccount(lineUserId);

    if (existing?.isVerified) {
      await replyMessage(replyToken, [
        {
          type: "text",
          text: `ยินดีต้อนรับกลับคุณ ${profile?.displayName || ""}! 👋\n\nใช้เมนูด้านล่างเพื่อเริ่มต้นใช้งาน`,
        },
      ]);
    } else {
      await replyMessage(replyToken, [
        {
          type: "text",
          text: `สวัสดีครับ ${profile?.displayName || ""}! 👋\n\nยินดีต้อนรับสู่ Dormy - ระบบจัดการหอพัก\n\n📌 กรุณาเลือกประเภทผู้ใช้งานจากเมนูด้านล่าง:\n\n🏢 เจ้าของหอพัก - จัดการหอพัก บิล ผู้เช่า\n👤 ผู้เช่า - ดูบิล ชำระเงิน แจ้งซ่อม`,
        },
      ]);
    }

    // Set default rich menu
    if (RICH_MENU_IDS.default && !existing?.isVerified) {
      await setUserRichMenu(lineUserId, RICH_MENU_IDS.default);
    }
  } catch (error: any) {
    console.error("❌ Failed to handle follow event:", error.message);
  }
}

// Handle unfollow events
async function handleUnfollowEvent(event: any) {
  const lineUserId = event.source.userId;
  console.log("👋 User unfollowed:", lineUserId);
}

// Handle postback events (button clicks)
async function handlePostbackEvent(event: any) {
  const { postback, replyToken, source } = event;
  const lineUserId = source.userId;
  const data = postback.data;

  console.log("🔘 Postback received:", data);

  try {
    const params = new URLSearchParams(data);
    const action = params.get("action");
    const account = await getLineAccount(lineUserId);

    // Actions ที่ไม่ต้อง verify
    const publicActions = ["select_role", "logout"];

    // ตรวจสอบว่า account verified หรือไม่ (ยกเว้น public actions)
    if (!publicActions.includes(action || "") && (!account?.isVerified)) {
      // ไม่มี linkCode หรือยังไม่ verified → force logout และกลับไปเลือก role
      await forceLogout(replyToken, lineUserId, account);
      return;
    }

    switch (action) {
      // ==========================================
      // Role Selection (Public)
      // ==========================================
      case "select_role": {
        const role = params.get("role") as "owner" | "tenant";
        await handleRoleSelection(replyToken, lineUserId, role);
        break;
      }

      // ==========================================
      // Owner Actions (Require verified linkCode)
      // ==========================================
      case "dashboard":
        await replyWithLink(replyToken, "📊 Dashboard", "/dashboard", account);
        break;

      case "bills":
        await replyWithLink(replyToken, "💰 Bills", "/dormitory", account);
        break;

      case "tenants":
        await replyWithLink(replyToken, "👥 Tenants", "/tenants", account);
        break;

      case "expenses":
        await replyWithLink(replyToken, "💸 Expenses", "/expenses", account);
        break;

      case "rooms":
        await replyWithLink(replyToken, "🏠 Rooms", "/dormitory", account);
        break;

      // ==========================================
      // Tenant Actions (Require verified linkCode)
      // ==========================================
      case "my_room":
        await replyWithLink(replyToken, "🏠 ห้องของฉัน", "/tenant/room", account);
        break;

      case "my_bills":
        await replyWithLink(replyToken, "💰 บิลค่าเช่า", "/tenant/bills", account);
        break;

      case "payment":
        await replyWithLink(replyToken, "💳 ชำระเงิน", "/tenant/payment", account);
        break;

      case "maintenance":
        if (!account?.isVerified) {
          await forceLogout(replyToken, lineUserId, account);
          return;
        }
        await replyMessage(replyToken, [
          {
            type: "text",
            text: "🔧 แจ้งซ่อม\n\nกรุณาพิมพ์รายละเอียดปัญหาที่ต้องการแจ้งซ่อม",
          },
        ]);
        break;

      case "contact_owner":
        await handleContactOwner(replyToken, account);
        break;

      // ==========================================
      // Logout - ออกจากระบบ (Public)
      // ==========================================
      case "logout":
        await handleLogout(replyToken, lineUserId, account);
        break;

      default:
        await replyMessage(replyToken, [
          { type: "text", text: "ไม่พบคำสั่งที่ต้องการ" },
        ]);
    }
  } catch (error: any) {
    console.error("❌ Failed to handle postback:", error.message);
  }
}

// Handle role selection - ถาม linkCode
async function handleRoleSelection(
  replyToken: string,
  lineUserId: string,
  role: "owner" | "tenant"
) {
  // บันทึก session รอรับ linkCode
  pendingLinkSessions.set(lineUserId, {
    role,
    timestamp: Date.now(),
  });

  if (role === "owner") {
    await replyMessage(replyToken, [
      {
        type: "text",
        text: `🏢 เจ้าของหอพัก\n\nกรุณาพิมพ์รหัสเชื่อมต่อ (Link Code) ของคุณ\n\n💡 ดูรหัสได้ที่:\n${BASE_URL}/settings\n\nหากยังไม่มีบัญชี กรุณาลงทะเบียนที่:\n${BASE_URL}/register`,
      },
    ]);
  } else {
    await replyMessage(replyToken, [
      {
        type: "text",
        text: `👤 ผู้เช่า\n\nกรุณาพิมพ์รหัสเชื่อมต่อ (Link Code) ของคุณ\n\n💡 ขอรหัสได้จากเจ้าของหอพักของคุณ`,
      },
    ]);
  }
}

// Helper: Reply with link
async function replyWithLink(
  replyToken: string,
  title: string,
  path: string,
  account: any
) {
  const url = `${BASE_URL}${path}`;

  if (!account?.isVerified) {
    await replyMessage(replyToken, [
      {
        type: "text",
        text: `${title}\n\nกรุณาเชื่อมต่อบัญชีก่อนใช้งาน\nเลือกประเภทผู้ใช้งานจากเมนูด้านล่าง`,
      },
    ]);
    return;
  }

  await replyMessage(replyToken, [
    { type: "text", text: `${title}\n\n${url}` },
  ]);
}

// Helper: Contact owner
async function handleContactOwner(replyToken: string, account: any) {
  if (!account?.isVerified || !account?.tenant) {
    await replyMessage(replyToken, [
      {
        type: "text",
        text: "กรุณาเชื่อมต่อบัญชีก่อนใช้งานฟีเจอร์นี้",
      },
    ]);
    return;
  }

  try {
    // Get owner info from tenant's room
    const tenantRoom = await prisma.tenantRoom.findFirst({
      where: { tenantId: account.tenantId },
      include: {
        room: {
          include: {
            dormitory: {
              include: { owner: true },
            },
          },
        },
      },
    });

    if (tenantRoom?.room?.dormitory?.owner) {
      const owner = tenantRoom.room.dormitory.owner;
      await replyMessage(replyToken, [
        {
          type: "text",
          text: `📞 ติดต่อเจ้าของหอพัก\n\n🏢 ${tenantRoom.room.dormitory.name}\n👤 คุณ ${owner.name}\n📱 ${owner.phone}`,
        },
      ]);
    } else {
      await replyMessage(replyToken, [
        {
          type: "text",
          text: "ไม่พบข้อมูลเจ้าของหอพัก",
        },
      ]);
    }
  } catch (error) {
    console.error("Error getting owner info:", error);
    await replyMessage(replyToken, [
      {
        type: "text",
        text: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      },
    ]);
  }
}

// Force logout - บังคับออกจากระบบเมื่อไม่มี linkCode หรือยังไม่ verified
async function forceLogout(replyToken: string, lineUserId: string, account: any) {
  try {
    console.log(`⚠️ Force logout for ${lineUserId} - not verified or no linkCode`);

    // ลบ LineAccount ถ้ามี
    if (account) {
      try {
        await prisma.lineAccount.delete({
          where: { lineUserId },
        });
      } catch {
        // ignore if not found
      }
    }

    // Clear pending sessions
    pendingLinkSessions.delete(lineUserId);

    // เปลี่ยน Rich Menu กลับไปเป็น default
    if (RICH_MENU_IDS.default) {
      await setUserRichMenu(lineUserId, RICH_MENU_IDS.default);
    } else {
      await unlinkUserRichMenu(lineUserId);
    }

    await replyMessage(replyToken, [
      {
        type: "text",
        text: "⚠️ เซสชันหมดอายุหรือยังไม่ได้เชื่อมต่อบัญชี\n\nกรุณาเลือกประเภทผู้ใช้งานจากเมนูด้านล่างเพื่อเริ่มต้นใหม่",
      },
    ]);
  } catch (error: any) {
    console.error("❌ Failed to force logout:", error.message);
    await replyMessage(replyToken, [
      {
        type: "text",
        text: "กรุณาเลือกประเภทผู้ใช้งานจากเมนูด้านล่าง",
      },
    ]);
  }
}

// Handle logout - ออกจากระบบ
async function handleLogout(replyToken: string, lineUserId: string, account: any) {
  try {
    if (!account?.isVerified) {
      await replyMessage(replyToken, [
        {
          type: "text",
          text: "คุณยังไม่ได้เชื่อมต่อบัญชี\n\nกรุณาเลือกประเภทผู้ใช้งานจากเมนูด้านล่าง",
        },
      ]);
      return;
    }

    const displayName = account.displayName || account.user?.name || account.tenant?.name || "";
    const role = account.role === "owner" ? "เจ้าของหอพัก" : "ผู้เช่า";

    // ลบ LineAccount ออกจากฐานข้อมูล
    await prisma.lineAccount.delete({
      where: { lineUserId },
    });

    // เปลี่ยน Rich Menu กลับไปเป็น default
    if (RICH_MENU_IDS.default) {
      await setUserRichMenu(lineUserId, RICH_MENU_IDS.default);
    } else {
      // ถ้าไม่มี default rich menu ให้ unlink เพื่อใช้ default ของ LINE OA
      await unlinkUserRichMenu(lineUserId);
    }

    await replyMessage(replyToken, [
      {
        type: "text",
        text: `👋 ออกจากระบบสำเร็จ\n\nขอบคุณ ${displayName} ที่ใช้งาน Dormy (${role})\n\nหากต้องการใช้งานอีกครั้ง กรุณาเลือกประเภทผู้ใช้งานจากเมนูด้านล่าง`,
      },
    ]);

    console.log(`✅ User ${lineUserId} logged out (was: ${role})`);
  } catch (error: any) {
    console.error("❌ Failed to logout:", error.message);
    await replyMessage(replyToken, [
      {
        type: "text",
        text: "เกิดข้อผิดพลาดในการออกจากระบบ กรุณาลองใหม่อีกครั้ง",
      },
    ]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-line-signature");

    if (!signature) {
      console.error("No signature found");
      return NextResponse.json({ error: "No signature" }, { status: 401 });
    }

    if (!verifySignature(body, signature)) {
      console.error("Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const webhook = JSON.parse(body);

    if (webhook.events && Array.isArray(webhook.events)) {
      await handleLineEvents(webhook.events);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("LINE webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "LINE Webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
