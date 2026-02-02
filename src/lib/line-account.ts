/**
 * LINE Account Management
 * จัดการการเชื่อม LINE User ID กับ User/Tenant ในระบบ
 */

import { prisma } from "@/lib/prisma";
import { setUserRichMenu } from "@/lib/line-rich-menu";

export type LineAccountRole = "owner" | "tenant";

export interface LineAccountInfo {
  lineUserId: string;
  role: LineAccountRole;
  userId?: number;
  tenantId?: number;
  displayName?: string;
  pictureUrl?: string;
  isVerified: boolean;
}

/**
 * ดึงข้อมูล LINE Account จาก LINE User ID
 */
export async function getLineAccount(lineUserId: string) {
  return prisma.lineAccount.findUnique({
    where: { lineUserId },
    include: {
      user: true,
      tenant: true,
    },
  });
}

/**
 * สร้าง LINE Account ใหม่ (ยังไม่ verified)
 * เรียกตอน user เลือก role ครั้งแรก
 */
export async function createLineAccount(
  lineUserId: string,
  role: LineAccountRole,
  displayName?: string,
  pictureUrl?: string
) {
  return prisma.lineAccount.create({
    data: {
      lineUserId,
      role,
      displayName,
      pictureUrl,
      isVerified: false,
    },
  });
}

/**
 * อัปเดตข้อมูล LINE Account
 */
export async function updateLineAccount(
  lineUserId: string,
  data: {
    role?: LineAccountRole;
    userId?: number;
    tenantId?: number;
    displayName?: string;
    pictureUrl?: string;
    richMenuId?: string;
    isVerified?: boolean;
  }
) {
  return prisma.lineAccount.update({
    where: { lineUserId },
    data,
  });
}

/**
 * Link LINE Account กับ User (เจ้าของหอพัก)
 */
export async function linkLineAccountToUser(lineUserId: string, userId: number) {
  return prisma.lineAccount.update({
    where: { lineUserId },
    data: {
      userId,
      tenantId: null, // clear tenant if was set
      role: "owner",
      isVerified: true,
    },
  });
}

/**
 * Link LINE Account กับ Tenant (ผู้เช่า)
 */
export async function linkLineAccountToTenant(lineUserId: string, tenantId: number) {
  return prisma.lineAccount.update({
    where: { lineUserId },
    data: {
      tenantId,
      userId: null, // clear user if was set
      role: "tenant",
      isVerified: true,
    },
  });
}

/**
 * ตั้ง Rich Menu ให้ LINE User ตาม role
 */
export async function setRichMenuForUser(
  lineUserId: string,
  richMenuId: string
) {
  try {
    await setUserRichMenu(lineUserId, richMenuId);
    await updateLineAccount(lineUserId, { richMenuId });
    return true;
  } catch (error) {
    console.error("Failed to set rich menu for user:", error);
    return false;
  }
}

/**
 * ดึงรายการ LINE Accounts ทั้งหมดของ User
 */
export async function getLineAccountsByUserId(userId: number) {
  return prisma.lineAccount.findMany({
    where: { userId },
  });
}

/**
 * ดึงรายการ LINE Accounts ทั้งหมดของ Tenant
 */
export async function getLineAccountsByTenantId(tenantId: number) {
  return prisma.lineAccount.findMany({
    where: { tenantId },
  });
}

/**
 * ลบ LINE Account
 */
export async function deleteLineAccount(lineUserId: string) {
  return prisma.lineAccount.delete({
    where: { lineUserId },
  });
}

/**
 * ตรวจสอบว่า LINE User นี้ลงทะเบียนแล้วหรือยัง
 */
export async function isLineUserRegistered(lineUserId: string): Promise<boolean> {
  const account = await getLineAccount(lineUserId);
  return account !== null && account.isVerified;
}

/**
 * สร้าง link token สำหรับ verification
 * ใช้ตอนส่ง link ให้ user ไป login บนเว็บ
 */
export function generateLinkToken(lineUserId: string, role: LineAccountRole): string {
  // Simple base64 encode (ในการใช้งานจริงควรใช้ JWT หรือ encryption)
  const payload = JSON.stringify({
    lineUserId,
    role,
    exp: Date.now() + 30 * 60 * 1000, // 30 minutes
  });
  return Buffer.from(payload).toString("base64url");
}

/**
 * ตรวจสอบและ decode link token
 */
export function verifyLinkToken(token: string): {
  lineUserId: string;
  role: LineAccountRole;
  valid: boolean;
} | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString());
    if (payload.exp < Date.now()) {
      return { ...payload, valid: false };
    }
    return { ...payload, valid: true };
  } catch {
    return null;
  }
}




