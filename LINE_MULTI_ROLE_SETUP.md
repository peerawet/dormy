# LINE Multi-Role Rich Menu Setup

## Overview

ระบบ Rich Menu หลาย Role สำหรับ Dormy LINE OA:

1. **Default Menu** - สำหรับ user ที่ยังไม่ได้เลือก role (ให้เลือกระหว่างเจ้าของ/ผู้เช่า)
2. **Owner Menu** - สำหรับเจ้าของหอพัก (Dashboard, Bills, Tenants, Expenses, Rooms, Settings)
3. **Tenant Menu** - สำหรับผู้เช่า (ห้องของฉัน, บิลค่าเช่า, ชำระเงิน, แจ้งซ่อม, ติดต่อเจ้าของ, Settings)

## Flow การทำงาน

```
User เพิ่ม LINE OA เป็นเพื่อน
         │
         ▼
   แสดง Default Menu
   (เลือก: เจ้าของ / ผู้เช่า)
         │
         ▼
   User เลือก Role
         │
    ┌────┴────┐
    ▼         ▼
 เจ้าของ     ผู้เช่า
    │         │
    ▼         ▼
 ส่ง Link   ส่ง Link
 Login      Login
    │         │
    ▼         ▼
 Login สำเร็จ → Link LINE ID กับ Account
         │
         ▼
 เปลี่ยน Rich Menu ตาม Role
```

## Setup Steps

### 1. Update Database Schema

```bash
# สร้าง migration สำหรับ LineAccount model
npx prisma migrate dev --name add_line_account

# หรือถ้าใช้ push
npx prisma db push
npx prisma generate
```

### 2. Deploy Rich Menus

```bash
# ตรวจสอบว่า dev server รันอยู่
npm run dev

# Generate PNG images จาก SVG
npm run rich-menu:img

# Deploy ทุก rich menu
npm run rich-menu:deploy-all
```

### 3. Update Environment Variables

หลังจาก deploy จะได้ Rich Menu IDs - เพิ่มใน `.env.local`:

```env
# LINE Rich Menu IDs
LINE_RICHMENU_DEFAULT=richmenu-xxx
LINE_RICHMENU_OWNER=richmenu-xxx
LINE_RICHMENU_TENANT=richmenu-xxx
```

### 4. Update LINE Developer Console

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Channel
3. Messaging API → Webhook settings
4. ตั้ง Webhook URL: `https://your-domain.com/api/line/webhook`
5. เปิด "Use webhook"

## Rich Menu Designs

### Default Menu (2500x843)

```
┌─────────────────────┬─────────────────────┐
│                     │                     │
│    🏢 เจ้าของหอพัก    │      👤 ผู้เช่า       │
│                     │                     │
└─────────────────────┴─────────────────────┘
```

### Owner Menu (2500x1686)

```
┌─────────┬─────────┬─────────┐
│Dashboard│  Bills  │ Tenants │
├─────────┼─────────┼─────────┤
│Expenses │  Rooms  │Settings │
└─────────┴─────────┴─────────┘
```

### Tenant Menu (2500x1686)

```
┌─────────────┬─────────────┬─────────────┐
│  ห้องของฉัน   │  บิลค่าเช่า   │   ชำระเงิน   │
├─────────────┼─────────────┼─────────────┤
│   แจ้งซ่อม    │ ติดต่อเจ้าของ  │  Settings  │
└─────────────┴─────────────┴─────────────┘
```

## Database Schema

```prisma
model LineAccount {
  id           Int       @id @default(autoincrement())
  lineUserId   String    @unique  // LINE User ID (U...)
  role         String    // "owner" หรือ "tenant"
  userId       Int?      // FK to User (สำหรับ owner)
  tenantId     Int?      // FK to Tenant (สำหรับ tenant)
  displayName  String?   // ชื่อที่แสดงใน LINE
  pictureUrl   String?   // รูปโปรไฟล์ LINE
  richMenuId   String?   // Rich Menu ID ที่กำลังใช้อยู่
  isVerified   Boolean   @default(false)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @default(now()) @updatedAt
  user         User?     @relation(fields: [userId], references: [id])
  tenant       Tenant?   @relation(fields: [tenantId], references: [id])
}
```

## API Endpoints

### Webhook
- `POST /api/line/webhook` - รับ events จาก LINE

### Link Account
- `GET /api/line/link?token=xxx` - ตรวจสอบ link token
- `POST /api/line/link` - Link LINE account กับ User/Tenant

### Rich Menu
- `GET /api/line/rich-menu` - ดึงรายการ Rich Menu
- `POST /api/line/rich-menu` - สร้าง Rich Menu
- `PUT /api/line/rich-menu?id=xxx&action=set-default` - ตั้งเป็น default
- `DELETE /api/line/rich-menu?id=xxx` - ลบ Rich Menu

## Linking Flow

### Owner Login
1. User เลือก "เจ้าของหอพัก" จาก Rich Menu
2. ระบบส่ง link: `https://domain.com/line-link?token=xxx&action=login`
3. User login ด้วย email/password
4. ระบบ link LINE ID กับ User
5. เปลี่ยน Rich Menu เป็น Owner Menu

### Tenant Login
1. User เลือก "ผู้เช่า" จาก Rich Menu
2. ระบบส่ง link: `https://domain.com/line-link?token=xxx&action=tenant-login`
3. User login ด้วยเบอร์โทร/password
4. ระบบ link LINE ID กับ Tenant
5. เปลี่ยน Rich Menu เป็น Tenant Menu

## Files

### Rich Menu SVGs
- `public/rich-menu-default.svg` - Default menu (role selection)
- `public/rich-menu-owner.svg` - Owner menu
- `public/rich-menu-tenant.svg` - Tenant menu

### Scripts
- `scripts/generate-rich-menu-image.mjs` - Generate PNG from SVG
- `scripts/deploy-all-rich-menus.ps1` - Deploy all rich menus

### API Routes
- `src/app/api/line/webhook/route.ts` - Webhook handler
- `src/app/api/line/rich-menu/route.ts` - Rich menu management
- `src/app/api/line/link/route.ts` - Account linking

### Libraries
- `src/lib/line.ts` - LINE Messaging API utilities
- `src/lib/line-rich-menu.ts` - Rich Menu API utilities
- `src/lib/line-account.ts` - LINE Account management

## Troubleshooting

### Rich Menu ไม่แสดง
1. ตรวจสอบว่า upload image แล้ว
2. ตรวจสอบว่าตั้งเป็น default แล้ว
3. ลอง unfollow แล้ว follow ใหม่

### Webhook ไม่ทำงาน
1. ตรวจสอบ Webhook URL ใน LINE Console
2. ตรวจสอบว่าเปิด "Use webhook" แล้ว
3. ตรวจสอบ LINE_CHANNEL_SECRET

### Link Account ไม่สำเร็จ
1. ตรวจสอบว่า token ยังไม่หมดอายุ (30 นาที)
2. ตรวจสอบว่า User/Tenant มีอยู่ในระบบ







