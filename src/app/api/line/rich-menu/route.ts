import { NextRequest, NextResponse } from "next/server";
import {
  createRichMenu,
  uploadRichMenuImage,
  setDefaultRichMenu,
  getRichMenuList,
  getRichMenu,
  deleteRichMenu,
} from "@/lib/line-rich-menu";
import fs from "fs";
import path from "path";

// ==========================================
// Rich Menu Templates
// ==========================================

// 1. Default Rich Menu - สำหรับ user ที่ยังไม่ได้เลือก role (2500x843 - compact)
const DEFAULT_RICH_MENU_TEMPLATE = {
  size: { width: 2500, height: 843 },
  selected: true,
  name: "Dormy - Select Role",
  chatBarText: "เลือกประเภทผู้ใช้",
  areas: [
    {
      // Left: เจ้าของหอพัก
      bounds: { x: 0, y: 0, width: 1250, height: 843 },
      action: {
        type: "postback",
        data: "action=select_role&role=owner",
        displayText: "เจ้าของหอพัก",
      },
    },
    {
      // Right: ผู้เช่า
      bounds: { x: 1250, y: 0, width: 1250, height: 843 },
      action: {
        type: "postback",
        data: "action=select_role&role=tenant",
        displayText: "ผู้เช่า",
      },
    },
  ],
};

// 2. Owner Rich Menu - สำหรับเจ้าของหอพัก (2500x1686 - large)
const OWNER_RICH_MENU_TEMPLATE = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: "Dormy - Owner Menu",
  chatBarText: "เมนูเจ้าของ",
  areas: [
    // Row 1
    {
      bounds: { x: 0, y: 0, width: 833, height: 843 },
      action: {
        type: "postback",
        data: "action=dashboard",
        displayText: "Dashboard",
      },
    },
    {
      bounds: { x: 833, y: 0, width: 833, height: 843 },
      action: {
        type: "postback",
        data: "action=bills",
        displayText: "Bills",
      },
    },
    {
      bounds: { x: 1666, y: 0, width: 834, height: 843 },
      action: {
        type: "postback",
        data: "action=tenants",
        displayText: "Tenants",
      },
    },
    // Row 2
    {
      bounds: { x: 0, y: 843, width: 833, height: 843 },
      action: {
        type: "postback",
        data: "action=expenses",
        displayText: "Expenses",
      },
    },
    {
      bounds: { x: 833, y: 843, width: 833, height: 843 },
      action: {
        type: "postback",
        data: "action=rooms",
        displayText: "Rooms",
      },
    },
    {
      bounds: { x: 1666, y: 843, width: 834, height: 843 },
      action: {
        type: "postback",
        data: "action=logout",
        displayText: "ออกจากระบบ",
      },
    },
  ],
};

// 3. Tenant Rich Menu - สำหรับผู้เช่า (2500x1686 - large)
const TENANT_RICH_MENU_TEMPLATE = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: "Dormy - Tenant Menu",
  chatBarText: "เมนูผู้เช่า",
  areas: [
    // Row 1
    {
      bounds: { x: 0, y: 0, width: 833, height: 843 },
      action: {
        type: "postback",
        data: "action=my_room",
        displayText: "ห้องของฉัน",
      },
    },
    {
      bounds: { x: 833, y: 0, width: 833, height: 843 },
      action: {
        type: "postback",
        data: "action=my_bills",
        displayText: "บิลค่าเช่า",
      },
    },
    {
      bounds: { x: 1666, y: 0, width: 834, height: 843 },
      action: {
        type: "postback",
        data: "action=payment",
        displayText: "ชำระเงิน",
      },
    },
    // Row 2
    {
      bounds: { x: 0, y: 843, width: 833, height: 843 },
      action: {
        type: "postback",
        data: "action=maintenance",
        displayText: "แจ้งซ่อม",
      },
    },
    {
      bounds: { x: 833, y: 843, width: 833, height: 843 },
      action: {
        type: "postback",
        data: "action=contact_owner",
        displayText: "ติดต่อเจ้าของ",
      },
    },
    {
      bounds: { x: 1666, y: 843, width: 834, height: 843 },
      action: {
        type: "postback",
        data: "action=logout",
        displayText: "ออกจากระบบ",
      },
    },
  ],
};

// Map template names to configs
const RICH_MENU_TEMPLATES: Record<string, typeof DEFAULT_RICH_MENU_TEMPLATE> = {
  default: DEFAULT_RICH_MENU_TEMPLATE,
  owner: OWNER_RICH_MENU_TEMPLATE,
  tenant: TENANT_RICH_MENU_TEMPLATE,
};

// Export templates for use in other modules
export { DEFAULT_RICH_MENU_TEMPLATE, OWNER_RICH_MENU_TEMPLATE, TENANT_RICH_MENU_TEMPLATE };

// GET: ดึงรายการ Rich Menu
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const richMenuId = searchParams.get("id");

    if (richMenuId) {
      // ดึง Rich Menu เฉพาะ
      const richMenu = await getRichMenu(richMenuId);
      return NextResponse.json({ success: true, richMenu });
    } else {
      // ดึงรายการ Rich Menu ทั้งหมด
      const list = await getRichMenuList();
      return NextResponse.json({ success: true, ...list });
    }
  } catch (error: any) {
    console.error("Error getting rich menu:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: สร้าง Rich Menu
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { template, imagePath, setAsDefault } = body;

    // ใช้ template หรือ custom rich menu
    const richMenuConfig = template && RICH_MENU_TEMPLATES[template]
      ? RICH_MENU_TEMPLATES[template]
      : body.richMenu;

    if (!richMenuConfig) {
      return NextResponse.json(
        { success: false, error: "Rich menu configuration is required" },
        { status: 400 }
      );
    }

    // สร้าง Rich Menu
    const richMenuId = await createRichMenu(richMenuConfig);
    console.log("✅ Rich Menu created:", richMenuId);

    let imageUploaded = false;
    let imageUploadWarning: string | null = null;

    // อัปโหลด image (ถ้ามี)
    if (imagePath) {
      try {
        const imagePathResolved = path.resolve(process.cwd(), imagePath);
        if (fs.existsSync(imagePathResolved)) {
          const imageBuffer = fs.readFileSync(imagePathResolved);
          await uploadRichMenuImage(richMenuId, imageBuffer);
          console.log("✅ Rich Menu image uploaded");
          imageUploaded = true;
        } else {
          imageUploadWarning = `Image file not found: ${imagePathResolved}`;
          console.warn("⚠️", imageUploadWarning);
        }
      } catch (error: any) {
        imageUploadWarning = error?.message || "Failed to upload image";
        console.error("⚠️ Failed to upload image:", imageUploadWarning);
        // ไม่ throw error เพราะ rich menu สร้างสำเร็จแล้ว
      }
    }

    // ตั้งค่าเป็น default (ถ้าต้องการ) - ต้องมี image ก่อน
    if (setAsDefault) {
      if (imageUploaded) {
        try {
          await setDefaultRichMenu(richMenuId);
          console.log("✅ Rich Menu set as default");
        } catch (error: any) {
          console.error("⚠️ Failed to set as default:", error.message);
          // ไม่ throw error แต่แจ้งเตือน
          return NextResponse.json({
            success: true,
            richMenuId,
            message: "Rich Menu created successfully, but failed to set as default",
            warning: error.message || "Please upload image and set as default manually",
          });
        }
      } else {
        console.warn("⚠️ Cannot set as default: Image not uploaded");
        return NextResponse.json({
          success: true,
          richMenuId,
          message: "Rich Menu created successfully",
          warning:
            imageUploadWarning ||
            "Image must be uploaded before setting as default. Please upload image via LINE Developer Console or API, then set as default.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      richMenuId,
      message: "Rich Menu created successfully",
    });
  } catch (error: any) {
    console.error("Error creating rich menu:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT: ตั้งค่า Rich Menu เป็น default
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const richMenuId = searchParams.get("id");
    const action = searchParams.get("action");

    if (!richMenuId) {
      return NextResponse.json(
        { success: false, error: "Rich Menu ID is required" },
        { status: 400 }
      );
    }

    if (action === "set-default") {
      await setDefaultRichMenu(richMenuId);
      console.log("✅ Rich Menu set as default:", richMenuId);
      return NextResponse.json({
        success: true,
        message: "Rich Menu set as default successfully",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error setting default rich menu:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: ลบ Rich Menu
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const richMenuId = searchParams.get("id");

    if (!richMenuId) {
      return NextResponse.json(
        { success: false, error: "Rich Menu ID is required" },
        { status: 400 }
      );
    }

    await deleteRichMenu(richMenuId);
    console.log("✅ Rich Menu deleted:", richMenuId);

    return NextResponse.json({
      success: true,
      message: "Rich Menu deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting rich menu:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

