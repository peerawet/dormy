# 🔑 วิธีหา LINE_ACCESS_TOKEN

## ⚠️ ปัญหา: LINE API Authentication Failed (401)

ถ้าคุณเห็น error นี้:
```
LINE API error: {"message":"Authentication failed. Confirm that the access token in the authorization header is valid."}
```

หมายความว่า `LINE_ACCESS_TOKEN` ไม่ถูกต้องหรือไม่ได้ตั้งค่า

## 📝 ขั้นตอนการหา LINE_ACCESS_TOKEN

### 1. เข้าไปที่ LINE Developers Console

ไปที่: [https://developers.line.biz/console/](https://developers.line.biz/console/)

### 2. เลือก Channel ของคุณ

- Channel ID: `2009025739`
- หรือเลือก Channel ที่คุณสร้างไว้

### 3. ไปที่แท็บ Messaging API

1. คลิกที่ Channel ของคุณ
2. ไปที่แท็บ **Messaging API** (ด้านซ้าย)

### 4. หา Channel access token

1. เลื่อนลงไปที่ส่วน **Channel access token**
2. คุณจะเห็น:
   - **Channel access token (long-lived)** - สำหรับ production
   - **Channel access token (short-lived)** - สำหรับ development (ใช้ได้ 30 วัน)

### 5. Issue Access Token

1. คลิกปุ่ม **Issue** ข้างๆ **Channel access token (long-lived)**
2. จะมี popup แสดง token
3. **Copy token ทันที!** (จะแสดงแค่ครั้งเดียว)

### 6. ตั้งค่าใน .env.local

เปิดไฟล์ `.env.local` และเพิ่ม/แก้ไข:

```env
LINE_CHANNEL_ID="2009025739"
LINE_CHANNEL_SECRET="7b057044a95a2542b8a93164cb8932de"
LINE_ACCESS_TOKEN="YOUR_ACCESS_TOKEN_HERE"
```

**สำคัญ:** 
- ใส่ token ที่ copy มาแทน `YOUR_ACCESS_TOKEN_HERE`
- ไม่ต้องใส่ quotes ถ้า token ไม่มีช่องว่าง (แต่ใส่ไว้ก็ได้)

### 7. Restart Development Server

```bash
# หยุด server (Ctrl+C)
# รันใหม่
npm run dev
```

## 🔄 ถ้า Token หมดอายุ

### Long-lived Token
- ใช้ได้ไม่จำกัด (จนกว่าจะ Revoke)
- เหมาะสำหรับ production

### Short-lived Token
- ใช้ได้ 30 วัน
- ต้อง Issue ใหม่เมื่อหมดอายุ

### วิธี Issue Token ใหม่

1. ไปที่ LINE Developers Console
2. ไปที่ **Messaging API** → **Channel access token**
3. คลิก **Issue** เพื่อสร้าง token ใหม่
4. Copy token ใหม่ไปใส่ใน `.env.local`
5. Restart server

## 🔍 ตรวจสอบว่า Token ถูกต้อง

### วิธีที่ 1: ทดสอบด้วย curl

```bash
curl -X GET https://api.line.me/v2/bot/info \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

ถ้าถูกต้องจะได้ response:
```json
{
  "userId": "...",
  "basicId": "...",
  "displayName": "...",
  ...
}
```

### วิธีที่ 2: ทดสอบด้วย LINE Webhook

1. ตั้งค่า webhook URL
2. ส่งข้อความไปที่ LINE OA
3. ดู logs ใน terminal
   - ถ้า token ถูกต้อง: จะเห็น "✅ Reply sent successfully"
   - ถ้า token ไม่ถูกต้อง: จะเห็น error 401

## ⚠️ ข้อควรระวัง

1. **อย่า Commit Token:**
   - `.env.local` ถูก ignore โดย git แล้ว
   - อย่าใส่ token ใน code หรือ commit

2. **Token ใช้ได้แค่ครั้งเดียว:**
   - ถ้า copy ผิดต้อง Issue ใหม่

3. **Token หมดอายุ:**
   - Short-lived token หมดอายุใน 30 วัน
   - ตรวจสอบและ renew ก่อนหมดอายุ

4. **Security:**
   - อย่า share token กับคนอื่น
   - ถ้า token รั่วไหล ให้ Revoke และ Issue ใหม่ทันที

## 🛠️ Troubleshooting

### ปัญหา: Token ไม่ทำงาน

**ตรวจสอบ:**
1. Token ถูก copy มาครบถ้วนหรือไม่ (ไม่มีช่องว่างหน้า/หลัง)
2. `.env.local` ถูกโหลดหรือไม่ (ดูใน terminal: "Reload env: .env.local")
3. Server restart แล้วหรือยัง
4. Token ยังไม่หมดอายุ

### ปัญหา: Token หมดอายุ

**แก้ไข:**
- Issue token ใหม่จาก LINE Developers Console
- อัปเดต `.env.local`
- Restart server

### ปัญหา: ยังเห็น Error 401

**ตรวจสอบ:**
1. Token ถูกต้อง (ทดสอบด้วย curl)
2. Environment variable ชื่อถูกต้อง: `LINE_ACCESS_TOKEN` (ไม่ใช่ `LINE_TOKEN` หรืออื่นๆ)
3. Server restart แล้ว
4. ไม่มี typo ใน `.env.local`

## 📚 เอกสารเพิ่มเติม

- [LINE Messaging API - Authentication](https://developers.line.biz/en/docs/messaging-api/channel-access-tokens/)
- [LINE Developers Console](https://developers.line.biz/console/)
- [LINE Webhook Setup Guide](./LINE_WEBHOOK_SETUP.md)

## 💡 Tips

1. **ใช้ Long-lived Token:** สำหรับ development และ production
2. **เก็บ Token ไว้:** เก็บ token ไว้ในที่ปลอดภัย (password manager)
3. **Monitor Expiration:** ตั้ง reminder เพื่อ renew token ก่อนหมดอายุ
4. **Test Token:** ทดสอบ token ด้วย curl หรือ LINE webhook ก่อนใช้งานจริง

