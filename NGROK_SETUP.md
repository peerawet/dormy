# 🌐 ngrok Setup Guide สำหรับ LINE Webhook Testing

## 📋 ngrok คืออะไร?

ngrok เป็น tool ที่สร้าง secure tunnel จาก internet ไปยัง local development server ของคุณ ทำให้ LINE สามารถส่ง webhook events มาที่ localhost ได้

## 🚀 การติดตั้ง ngrok

### Windows

#### วิธีที่ 1: Chocolatey (แนะนำ)
```powershell
choco install ngrok
```

#### วิธีที่ 2: Scoop
```powershell
scoop install ngrok
```

#### วิธีที่ 3: ดาวน์โหลดโดยตรง
1. ไปที่ [ngrok.com/download](https://ngrok.com/download)
2. ดาวน์โหลด Windows version
3. Extract และเพิ่ม path ไปยัง system PATH
4. หรือวางไฟล์ `ngrok.exe` ในโฟลเดอร์โปรเจค

#### วิธีที่ 4: npm (ถ้าใช้ Node.js)
```bash
npm install -g ngrok
```

### macOS
```bash
brew install ngrok/ngrok/ngrok
```

### Linux
```bash
# Download และ extract
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin
```

## 🔐 การตั้งค่า ngrok (Optional)

### สร้าง Account (แนะนำ)

1. ไปที่ [ngrok.com](https://ngrok.com/)
2. สร้าง account ฟรี
3. Copy authtoken จาก dashboard
4. รันคำสั่ง:
   ```bash
   ngrok config add-authtoken 393z6T4d0nTKnIvPicfU0o1U0sz_6iexNjjHf9ykHWrbpLDGa
   ```

**ข้อดี:**
- URL ไม่เปลี่ยนทุกครั้งที่รัน
- ใช้ได้นานขึ้น
- มี features เพิ่มเติม

### ไม่ต้องสร้าง Account

สามารถใช้ได้เลย แต่:
- URL จะเปลี่ยนทุกครั้งที่รัน
- มีข้อจำกัดบางอย่าง

## 🧪 การใช้งาน

### วิธีที่ 1: ใช้ Script (ง่ายที่สุด)

```powershell
# รัน script ที่เตรียมไว้
npm run ngrok

# หรือ
.\scripts\start-ngrok.ps1
```

### วิธีที่ 2: รันโดยตรง

```bash
# Expose port 4000 (Next.js dev server)
ngrok http 4000
```

### วิธีที่ 3: ใช้ Static Domain (ต้องมี account)

```bash
# ตั้งค่า static domain ใน ngrok dashboard
ngrok http 4000 --domain=your-static-domain.ngrok-free.app
```

## 📝 ขั้นตอนการทดสอบ LINE Webhook

### 1. เริ่ม Development Server

```bash
npm run dev
```

ตรวจสอบว่า server รันที่ `http://localhost:4000`

### 2. เริ่ม ngrok

```powershell
npm run ngrok
```

คุณจะเห็น output แบบนี้:
```
ngrok                                                                            

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        Asia Pacific (ap)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:4000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**สำคัญ:** Copy HTTPS URL (Forwarding URL)

### 3. สร้าง Webhook URL

เพิ่ม `/api/line/webhook` ต่อท้าย ngrok URL:

```
https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/line/webhook
```

### 4. ตั้งค่าใน LINE Developer Console

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Channel ของคุณ (Channel ID: `2009025739`)
3. ไปที่แท็บ **Messaging API**
4. ไปที่ส่วน **Webhook settings**
5. ใส่ Webhook URL ที่สร้างไว้
6. คลิก **Verify**
   - ✅ **Success**: Webhook ทำงานถูกต้อง
   - ❌ **Failed**: ตรวจสอบว่า:
     - Development server รันอยู่
     - ngrok ยังรันอยู่
     - URL ถูกต้อง
7. เปิดใช้งาน **Use webhook**

### 5. ทดสอบ

1. เปิด LINE และเพิ่ม LINE OA ของคุณเป็นเพื่อน
2. ส่งข้อความไปที่ LINE OA
3. ดู logs ใน terminal ที่รัน `npm run dev`
   - ควรเห็น LINE events
   - ควรเห็น console.log จาก webhook handler

### 6. ดู Webhook Traffic

เปิด browser ไปที่:
```
http://localhost:4040
```

คุณจะเห็น:
- Requests ที่เข้ามา
- Request/Response details
- Replay requests (สำหรับทดสอบ)

## 🔍 Troubleshooting

### ปัญหา: ngrok ไม่พบ command

**แก้ไข:**
- ตรวจสอบว่า ngrok ติดตั้งแล้ว
- ตรวจสอบ PATH environment variable
- ใช้ full path: `C:\path\to\ngrok.exe http 4000`

### ปัญหา: LINE Verify Failed

**ตรวจสอบ:**
1. Development server รันอยู่ (`npm run dev`)
2. ngrok ยังรันอยู่
3. Webhook URL ถูกต้อง (มี `/api/line/webhook`)
4. Environment variables ตั้งค่าแล้ว (`.env.local`)

### ปัญหา: ngrok URL เปลี่ยนทุกครั้ง

**แก้ไข:**
- สร้าง ngrok account และใช้ authtoken
- หรือใช้ static domain (ต้อง upgrade plan)

### ปัญหา: Connection Refused

**แก้ไข:**
- ตรวจสอบว่า development server รันที่ port 4000
- ตรวจสอบว่า ngrok forward ไปที่ port ที่ถูกต้อง
- Restart ทั้ง development server และ ngrok

## 💡 Tips

1. **เก็บ ngrok URL ไว้:** ถ้าใช้ account ฟรี URL จะเปลี่ยนทุกครั้ง แต่ถ้าใช้ authtoken อาจจะได้ URL เดิม

2. **ใช้ ngrok web interface:** เปิด `http://localhost:4040` เพื่อดู requests แบบ real-time

3. **Test ก่อนตั้งค่า:** ทดสอบ webhook endpoint ก่อน:
   ```powershell
   npm run test:webhook
   ```

4. **ตรวจสอบ Logs:** ดู logs ใน terminal ที่รัน `npm run dev` เพื่อ debug

5. **ใช้ ngrok config file:** สร้าง `ngrok.yml` สำหรับตั้งค่าขั้นสูง

## 📚 เอกสารเพิ่มเติม

- [ngrok Documentation](https://ngrok.com/docs)
- [LINE Webhook Setup Guide](./LINE_WEBHOOK_SETUP.md)
- [ngrok Pricing](https://ngrok.com/pricing)

## ⚠️ หมายเหตุ

- ngrok free plan มีข้อจำกัด (เช่น connection time limit)
- สำหรับ production ควรใช้ domain จริงและ HTTPS
- อย่า share ngrok URL กับคนอื่น (security risk)

