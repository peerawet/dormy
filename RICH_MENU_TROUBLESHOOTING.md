# 🔧 Rich Menu Troubleshooting

## ❌ ปัญหา: Rich Menu ไม่เห็นขึ้นมา

Rich Menu ไม่แสดงใน LINE app มีหลายสาเหตุที่เป็นไปได้:

## ✅ ตรวจสอบทีละขั้นตอน

### 1. ตรวจสอบว่า Rich Menu ถูกสร้างแล้ว

```powershell
# ใช้ script ที่เตรียมไว้
.\scripts\check-rich-menu.ps1

# หรือใช้ API โดยตรง
curl http://localhost:4000/api/line/rich-menu
```

**ถ้ายังไม่มี Rich Menu:**
```powershell
# สร้าง Rich Menu
.\scripts\create-rich-menu.ps1 -SetAsDefault
```

### 2. ตรวจสอบว่า Rich Menu ถูกตั้งเป็น Default

Rich Menu ต้องถูกตั้งเป็น default ถึงจะแสดงใน LINE app

**ตรวจสอบ:**
- ดูใน LINE Developer Console → Messaging API → Rich Menu
- ดูว่า Rich Menu ไหนถูกตั้งเป็น default

**ตั้งเป็น Default:**
```powershell
# ใช้ script (ต้องมี Rich Menu ID)
.\scripts\set-default-rich-menu.ps1 -RichMenuId "richmenu-xxx"

# หรือสร้างใหม่พร้อมตั้งเป็น default
.\scripts\create-rich-menu.ps1 -SetAsDefault
```

### 3. ⚠️ **สำคัญที่สุด: ตรวจสอบว่า Rich Menu มี Image**

**Rich Menu จะไม่แสดงถ้ายังไม่มี image!**

**วิธีตรวจสอบ:**
1. ไปที่ LINE Developer Console
2. Messaging API → Rich Menu
3. ดู Rich Menu ที่สร้างไว้
4. ตรวจสอบว่ามี image หรือยัง

**อัปโหลด Image:**

#### วิธีที่ 1: ใช้ LINE Developer Console (แนะนำ)
1. ไปที่ LINE Developer Console
2. Messaging API → Rich Menu
3. คลิกที่ Rich Menu ที่สร้างไว้
4. คลิก "Upload image"
5. เลือกไฟล์ภาพ (แนะนำ 2500x1686px, PNG/JPEG, ไม่เกิน 1MB)
6. รอให้อัปโหลดเสร็จ

#### วิธีที่ 2: ใช้ API
```bash
# ต้องมี image file ก่อน
curl -X POST "https://api.line.me/v2/bot/richmenu/{richMenuId}/content" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: image/png" \
  --data-binary "@rich-menu.png"
```

### 4. ตรวจสอบว่า User Add LINE OA เป็นเพื่อนแล้ว

Rich Menu จะแสดงเฉพาะกับ user ที่ add LINE OA เป็นเพื่อนแล้ว

**ทดสอบ:**
1. เปิด LINE app
2. Add LINE OA ของคุณเป็นเพื่อน
3. ไปที่ chat กับ LINE OA
4. ควรเห็น Rich Menu ที่ด้านล่าง

### 5. ตรวจสอบ LINE App Version

Rich Menu รองรับใน LINE app version 6.7.0 ขึ้นไป

**ตรวจสอบ:**
- ไปที่ LINE app → Settings → About
- ดู version

**อัปเดต:**
- อัปเดต LINE app เป็น version ล่าสุด

### 6. ตรวจสอบ Rich Menu Configuration

**ตรวจสอบว่า:**
- Rich Menu size ถูกต้อง (แนะนำ 2500x1686px สำหรับ 2 rows / ใหญ่กว่า)
- Areas (ปุ่ม) ถูกกำหนดถูกต้อง
- Actions ถูกกำหนดถูกต้อง

**ดู Rich Menu details:**
```powershell
# ใช้ Rich Menu ID
curl "http://localhost:4000/api/line/rich-menu?id=richmenu-xxx"
```

## 🔄 ขั้นตอนการแก้ไข (Step by Step)

### Step 1: สร้าง Rich Menu

```powershell
.\scripts\create-rich-menu.ps1 -SetAsDefault
```

บันทึก Rich Menu ID ที่ได้

### Step 2: สร้าง Rich Menu Image

1. สร้างภาพขนาด **2500x1686px** (แนะนำ / ใหญ่กว่า)
2. ออกแบบตาม layout ที่ต้องการ
3. บันทึกเป็น PNG หรือ JPEG
4. ขนาดไฟล์ไม่เกิน 1MB

### Step 3: อัปโหลด Image

**ใช้ LINE Developer Console:**
1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Channel ของคุณ
3. Messaging API → Rich Menu
4. คลิกที่ Rich Menu ที่สร้างไว้
5. คลิก "Upload image"
6. เลือกไฟล์ภาพ
7. รอให้อัปโหลดเสร็จ

### Step 4: ตั้งเป็น Default (ถ้ายังไม่ได้ตั้ง)

```powershell
.\scripts\set-default-rich-menu.ps1 -RichMenuId "richmenu-xxx"
```

### Step 5: ทดสอบ

1. เปิด LINE app
2. Add LINE OA เป็นเพื่อน (ถ้ายังไม่ได้ add)
3. ไปที่ chat กับ LINE OA
4. ควรเห็น Rich Menu ที่ด้านล่าง

## 🐛 ปัญหาที่พบบ่อย

### ปัญหา: Rich Menu สร้างแล้วแต่ไม่มี Image

**อาการ:** Rich Menu ถูกสร้างแล้ว แต่ไม่แสดงใน LINE app

**แก้ไข:**
- อัปโหลด image ผ่าน LINE Developer Console
- ตรวจสอบว่า image มีขนาดถูกต้อง (2500x843px)
- ตรวจสอบว่า image format ถูกต้อง (PNG/JPEG)

### ปัญหา: Rich Menu ไม่ถูกตั้งเป็น Default

**อาการ:** มี Rich Menu หลายอัน แต่ไม่รู้ว่าอันไหนเป็น default

**แก้ไข:**
- ไปที่ LINE Developer Console → Rich Menu
- ดูว่า Rich Menu ไหนมี "Default" tag
- หรือตั้ง Rich Menu ที่ต้องการเป็น default ใหม่

### ปัญหา: Rich Menu แสดงแต่ไม่มี Image

**อาการ:** เห็น Rich Menu แต่เป็นสีเทาหรือไม่มีภาพ

**แก้ไข:**
- ตรวจสอบว่า image ถูกอัปโหลดแล้ว
- ตรวจสอบว่า image มีขนาดถูกต้อง
- ลองอัปโหลด image ใหม่

### ปัญหา: คลิกปุ่มแล้วไม่ทำงาน

**อาการ:** คลิกปุ่มใน Rich Menu แล้วไม่มีอะไรเกิดขึ้น

**แก้ไข:**
- ตรวจสอบว่า webhook handler จัดการ postback event หรือไม่
- ดู logs ใน terminal ที่รัน `npm run dev`
- ตรวจสอบว่า postback data format ถูกต้อง

## 📝 Checklist

ก่อนรายงานปัญหา ตรวจสอบว่า:

- [ ] Rich Menu ถูกสร้างแล้ว
- [ ] Rich Menu ถูกตั้งเป็น default
- [ ] Rich Menu มี image อัปโหลดแล้ว
- [ ] Image มีขนาดถูกต้อง (2500x843px)
- [ ] Image format ถูกต้อง (PNG/JPEG)
- [ ] Image ขนาดไม่เกิน 1MB
- [ ] User add LINE OA เป็นเพื่อนแล้ว
- [ ] LINE app version เป็น 6.7.0 ขึ้นไป
- [ ] Webhook ทำงานถูกต้อง
- [ ] LINE_ACCESS_TOKEN ถูกต้อง

## 🔍 Debug Commands

```powershell
# ตรวจสอบ Rich Menu list
.\scripts\check-rich-menu.ps1

# ตรวจสอบ Rich Menu เฉพาะ
curl "http://localhost:4000/api/line/rich-menu?id=richmenu-xxx"

# ตรวจสอบ default Rich Menu (ใช้ LINE API โดยตรง)
curl -X GET "https://api.line.me/v2/bot/user/all/richmenu" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📚 เอกสารเพิ่มเติม

- [LINE Rich Menu API](https://developers.line.biz/en/reference/messaging-api/#rich-menu)
- [Rich Menu Guide](./RICH_MENU_GUIDE.md)
- [LINE Webhook Setup](./LINE_WEBHOOK_SETUP.md)

