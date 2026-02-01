# 🎨 LINE Rich Menu Guide

## 📋 Rich Menu คืออะไร?

Rich Menu เป็นเมนูที่แสดงที่ด้านล่างของหน้าจอ LINE เพื่อให้ผู้ใช้สามารถโต้ตอบกับ LINE OA ได้ง่ายขึ้น โดยมีปุ่มต่างๆ ที่สามารถกำหนด action ได้

## 📐 ข้อกำหนด Rich Menu

### ขนาดภาพ
- **Large menu (recommended / bigger):** 2500 x 1686 pixels
- **Small menu:** 2500 x 843 pixels
- รองรับ PNG และ JPEG
- ขนาดไฟล์ไม่เกิน 1 MB

### จำนวน Areas (ปุ่ม)
- **Full Menu:** 2-6 areas
- **Half Menu:** 2-3 areas

### Action Types
- **message** - ส่งข้อความ
- **postback** - ส่งข้อมูลกลับมา (ไม่แสดงข้อความ)
- **uri** - เปิด URL
- **datetimepicker** - เลือกวันที่/เวลา
- **camera** - เปิดกล้อง
- **cameraRoll** - เปิดแกลเลอรี
- **location** - ส่งตำแหน่ง

## 🚀 การสร้าง Rich Menu

### วิธีที่ 1: ใช้ Script (แนะนำ)

```powershell
# สร้าง Rich Menu พื้นฐาน
.\scripts\create-rich-menu.ps1

# สร้างและตั้งเป็น default
.\scripts\create-rich-menu.ps1 -SetAsDefault

# สร้างพร้อมอัปโหลด image
.\scripts\create-rich-menu.ps1 -ImagePath "public/rich-menu.png" -SetAsDefault
```

### วิธีที่ 2: ใช้ API โดยตรง

```bash
# สร้าง Rich Menu ด้วย template
curl -X POST http://localhost:4000/api/line/rich-menu \
  -H "Content-Type: application/json" \
  -d '{
    "template": "dormy",
    "setAsDefault": true
  }'
```

### วิธีที่ 3: ใช้ LINE Developer Console

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Channel ของคุณ
3. ไปที่ **Messaging API** → **Rich Menu**
4. คลิก **Create**
5. ตั้งค่า Rich Menu และอัปโหลดภาพ

## 🎨 สร้าง Rich Menu Image

### วิธีที่ 1: ใช้ Design Tool

1. **Figma** (แนะนำ)
   - สร้าง canvas 2500x843px
   - ออกแบบเมนูตามต้องการ
   - Export เป็น PNG

2. **Photoshop / Illustrator**
   - สร้าง document 2500x843px
   - ออกแบบและ export

3. **Canva**
   - ใช้ custom size: 2500x843px
   - ออกแบบและ download

### วิธีที่ 2: ใช้ Template

ดูตัวอย่าง template ใน `public/rich-menu-template.png` (ถ้ามี)

### Layout แนะนำ

```
┌─────────┬─────────┬─────────┐
│  Area 1 │  Area 2 │  Area 3 │  Row 1
├─────────┼─────────┼─────────┤
│  Area 4 │  Area 5 │  Area 6 │  Row 2
└─────────┴─────────┴─────────┘
```

แต่ละ Area:
- Width: 833px (สำหรับ 3 columns)
- Height: 843px (สำหรับ large menu 2 rows: 1686px)

## 📝 Rich Menu Template สำหรับ Dormy

Template ที่เตรียมไว้มี 6 areas:

1. **แดชบอร์ด** - postback: `action=dashboard`
2. **บิล** - postback: `action=bills`
3. **ผู้เช่า** - postback: `action=tenants`
4. **ค่าใช้จ่าย** - postback: `action=expenses`
5. **ห้องพัก** - postback: `action=rooms`
6. **เว็บไซต์** - uri: `https://dormy.forifi.xyz`

## 🔧 จัดการ Rich Menu

### ดึงรายการ Rich Menu

```bash
# ดึงรายการทั้งหมด
curl http://localhost:4000/api/line/rich-menu

# ดึง Rich Menu เฉพาะ
curl http://localhost:4000/api/line/rich-menu?id=RICH_MENU_ID
```

### ลบ Rich Menu

```bash
curl -X DELETE "http://localhost:4000/api/line/rich-menu?id=RICH_MENU_ID"
```

## 🎯 จัดการ Postback Events

เมื่อผู้ใช้คลิกปุ่มใน Rich Menu จะส่ง postback event มา ต้องจัดการใน webhook:

```typescript
// ใน src/app/api/line/webhook/route.ts
async function handlePostbackEvent(event: any) {
  const { postback, source } = event;
  const data = postback.data; // เช่น "action=dashboard"
  
  // Parse data
  const params = new URLSearchParams(data);
  const action = params.get("action");
  
  switch (action) {
    case "dashboard":
      // ส่งข้อความเกี่ยวกับ dashboard
      await replyMessage(event.replyToken, [{
        type: "text",
        text: "📊 แดชบอร์ด\n\nดูข้อมูลสรุปได้ที่เว็บไซต์"
      }]);
      break;
    case "bills":
      // ส่งข้อมูลบิล
      break;
    // ... other actions
  }
}
```

## 📱 ทดสอบ Rich Menu

1. **สร้าง Rich Menu:**
   ```powershell
   .\scripts\create-rich-menu.ps1 -SetAsDefault
   ```

2. **อัปโหลด Image:**
   - ไปที่ LINE Developer Console
   - หรือใช้ API (ต้องมี image file)

3. **ทดสอบใน LINE:**
   - เปิด LINE app
   - ไปที่ LINE OA ของคุณ
   - ควรเห็น Rich Menu ที่ด้านล่าง

## 🔍 Troubleshooting

### Rich Menu ไม่แสดง

**ตรวจสอบ:**
1. Rich Menu ถูกตั้งเป็น default หรือไม่
2. Image ถูกอัปโหลดแล้วหรือยัง
3. Image มีขนาดถูกต้อง (2500x843px)
4. LINE app version รองรับ Rich Menu

### Postback ไม่ทำงาน

**ตรวจสอบ:**
1. Webhook handler จัดการ postback event หรือไม่
2. Data format ถูกต้องหรือไม่
3. ดู logs ใน terminal

### Image ไม่แสดง

**ตรวจสอบ:**
1. Image format ถูกต้อง (PNG/JPEG)
2. Image size ไม่เกิน 1 MB
3. Image dimensions ถูกต้อง
4. Image ถูกอัปโหลดแล้ว

## 💡 Tips

1. **ใช้ Template:** เริ่มจาก template ที่มีอยู่แล้ว
2. **ออกแบบให้ชัดเจน:** ใช้ icon และข้อความที่เข้าใจง่าย
3. **Test บนมือถือ:** Rich Menu ดูดีบนมือถือ
4. **Update เป็นระยะ:** เปลี่ยน Rich Menu ตามความต้องการ

## 📚 เอกสารเพิ่มเติม

- [LINE Rich Menu API](https://developers.line.biz/en/reference/messaging-api/#rich-menu)
- [Rich Menu Design Guidelines](https://developers.line.biz/en/docs/messaging-api/using-rich-menus/)
- [Rich Menu Object](https://developers.line.biz/en/reference/messaging-api/#rich-menu-object)

## 🎨 ตัวอย่าง Rich Menu Design

### Layout แนะนำ

```
┌─────────────────────────────────────────┐
│  [📊 แดชบอร์ด]  [💰 บิล]  [👥 ผู้เช่า] │
│  [💸 ค่าใช้จ่าย] [🏠 ห้อง] [🌐 เว็บไซต์] │
└─────────────────────────────────────────┘
```

### Color Scheme
- Background: #FFFFFF หรือ gradient
- Text: #000000 หรือสีเข้ม
- Buttons: สีที่เด่นชัด (เช่น #007AFF)

### Icons
- ใช้ icon ที่เข้าใจง่าย
- ขนาดเหมาะสม (ไม่เล็กเกินไป)
- สอดคล้องกับ action

