# 📱 LINE OA Webhook Setup Guide

## 🔗 Webhook URL

### Production (เมื่อ Deploy แล้ว)
```
https://dormy.forifi.xyz/api/line/webhook
```

### Development (Local)
```
http://localhost:4000/api/line/webhook
```

**หมายเหตุ:** สำหรับ local development คุณต้องใช้ ngrok หรือ tunnel service เพื่อให้ LINE สามารถเข้าถึง webhook URL ได้

## 📋 ขั้นตอนการตั้งค่าใน LINE Developer Console

1. เข้าไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Channel ที่สร้างไว้ (Channel ID: `2009025739`)
3. ไปที่แท็บ **Messaging API**
4. ไปที่ส่วน **Webhook settings**
5. ใส่ Webhook URL:
   - **Production:** `https://dormy.forifi.xyz/api/line/webhook`
   - **Development:** ใช้ ngrok URL เช่น `https://xxxx.ngrok.io/api/line/webhook`
6. คลิก **Verify** เพื่อทดสอบ webhook
7. เปิดใช้งาน **Use webhook**

## 🔐 Environment Variables

เพิ่มในไฟล์ `.env.local`:

```env
# LINE OA Configuration
LINE_CHANNEL_ID="2009025739"
LINE_CHANNEL_SECRET="7b057044a95a2542b8a93164cb8932de"
LINE_ACCESS_TOKEN="your-line-access-token"
```

### วิธีหา LINE_ACCESS_TOKEN

1. ไปที่ LINE Developers Console
2. เลือก Channel ของคุณ
3. ไปที่แท็บ **Messaging API**
4. ไปที่ส่วน **Channel access token**
5. คลิก **Issue** เพื่อสร้าง access token
6. Copy token มาใส่ใน `.env.local`

## 🧪 ทดสอบ Webhook

### ใช้ ngrok สำหรับ Local Development

```bash
# ติดตั้ง ngrok
# Windows: choco install ngrok
# หรือดาวน์โหลดจาก https://ngrok.com/

# รัน ngrok
ngrok http 4000

# ใช้ URL ที่ได้ เช่น https://xxxx.ngrok.io
# ใส่ใน LINE Developer Console: https://xxxx.ngrok.io/api/line/webhook
```

### ทดสอบด้วย curl

```bash
# Test webhook endpoint
curl http://localhost:4000/api/line/webhook

# ควรได้ response: {"message":"LINE Webhook endpoint is active",...}
```

## 📝 Webhook Events ที่รองรับ

- **message** - เมื่อผู้ใช้ส่งข้อความ
- **follow** - เมื่อผู้ใช้เพิ่ม LINE OA
- **unfollow** - เมื่อผู้ใช้ยกเลิกติดตาม
- **postback** - เมื่อผู้ใช้คลิกปุ่มหรือ action

## 🔧 Customize Webhook Handler

แก้ไขไฟล์ `src/app/api/line/webhook/route.ts` เพื่อเพิ่ม logic การจัดการ events:

```typescript
// ตัวอย่าง: จัดการข้อความ
async function handleMessageEvent(event: any) {
  const { message, replyToken, source } = event;
  
  if (message.type === "text") {
    const userMessage = message.text;
    
    // เพิ่ม logic ของคุณที่นี่
    // เช่น เช็คคำสั่ง, เชื่อมต่อ database, ฯลฯ
    
    await replyMessage(replyToken, [
      {
        type: "text",
        text: "ข้อความตอบกลับของคุณ"
      }
    ]);
  }
}
```

## 📚 LINE Messaging API Documentation

- [LINE Developers Documentation](https://developers.line.biz/en/docs/)
- [Messaging API Reference](https://developers.line.biz/en/reference/messaging-api/)

## ⚠️ หมายเหตุสำคัญ

1. **Signature Verification**: Webhook จะ verify signature อัตโนมัติเพื่อความปลอดภัย
2. **Response Time**: ต้องตอบกลับ 200 OK ภายใน 1 วินาที
3. **Access Token**: ต้องมี LINE_ACCESS_TOKEN เพื่อส่งข้อความกลับ
4. **HTTPS Required**: Production webhook ต้องใช้ HTTPS

