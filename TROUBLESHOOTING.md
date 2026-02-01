# 🔧 Troubleshooting Guide

## JWT Verification Errors

### อาการ
```
JsonWebTokenError: invalid signature
หรือ
GET /api/recurring-expense 500
GET /api/dormitory 401
```

### สาเหตุ
1. `JWT_SECRET` ไม่ได้ตั้งค่าใน `.env.local`
2. `JWT_SECRET` ไม่ตรงกับที่ใช้สร้าง token
3. Token หมดอายุหรือไม่ถูกต้อง

### วิธีแก้ไข

#### 1. ตรวจสอบ `.env.local`

ตรวจสอบว่ามี `JWT_SECRET` ตั้งค่าไว้:

```env
JWT_SECRET="your-jwt-secret-for-development"
```

**สำคัญ:** ต้องใช้ secret เดียวกันทั้งตอนสร้าง token (login) และ verify token

#### 2. Logout และ Login ใหม่

ถ้าเปลี่ยน `JWT_SECRET` ต้อง logout และ login ใหม่เพื่อให้ token ถูกสร้างด้วย secret ใหม่:

1. เปิด Developer Tools (F12)
2. ไปที่ Application/Storage → Local Storage
3. ลบ key ที่เกี่ยวข้องกับ auth/token
4. Refresh หน้าเว็บ
5. Login ใหม่

#### 3. ตรวจสอบ Environment Variables

```bash
# ตรวจสอบว่า .env.local ถูกโหลด
# ดูใน terminal ตอนรัน npm run dev
# ควรเห็น: "Reload env: .env.local"
```

#### 4. Restart Development Server

หลังจากแก้ไข `.env.local`:

```bash
# หยุด server (Ctrl+C)
# รันใหม่
npm run dev
```

## Database Connection Errors

### อาการ
```
PrismaClientInitializationError: Can't reach database server
```

### วิธีแก้ไข

1. **ตรวจสอบ Docker Container:**
   ```bash
   docker ps
   # ควรเห็น postgres container รันอยู่
   ```

2. **ตรวจสอบ DATABASE_URL ใน `.env.local`:**
   ```env
   # ต้องตรงกับ docker-compose.yml
   # POSTGRES_USER: postgres
   # POSTGRES_PASSWORD: postgres
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dormy_local"
   ```

3. **ทดสอบ Connection:**
   ```bash
   # ใช้ Prisma Studio
   npm run db:studio
   ```

4. **Restart PostgreSQL:**
   ```bash
   # ถ้าใช้ Docker
   docker restart dormy-postgres-local
   ```

## 401 Unauthorized Errors

### อาการ
```
GET /api/dormitory 401
GET /api/tenant 401
```

### สาเหตุ
- Token ไม่ถูกส่งมา
- Token หมดอายุ
- Token ไม่ถูกต้อง

### วิธีแก้ไข

1. **ตรวจสอบว่า Token ถูกส่งมา:**
   - เปิด Developer Tools → Network tab
   - ดู Request Headers ควรมี `Authorization: Bearer <token>`

2. **Logout และ Login ใหม่**

3. **ตรวจสอบ Redux Store:**
   - เปิด Redux DevTools
   - ตรวจสอบว่า token ถูกเก็บใน state

## Environment Variables ไม่ทำงาน

### อาการ
- `process.env.JWT_SECRET` เป็น `undefined`
- Environment variables ไม่ถูกโหลด

### วิธีแก้ไข

1. **ตรวจสอบชื่อไฟล์:**
   - ต้องเป็น `.env.local` (มีจุดหน้าชื่อ)
   - ไม่ใช่ `env.local` หรือ `.env.local.txt`

2. **Restart Server:**
   ```bash
   # หยุด server และรันใหม่
   npm run dev
   ```

3. **ตรวจสอบ .gitignore:**
   - `.env.local` ควรถูก ignore
   - แต่ไฟล์ต้องมีอยู่จริง

4. **ใช้ Next.js Environment Variables:**
   - Variables ต้องขึ้นต้นด้วย `NEXT_PUBLIC_` สำหรับ client-side
   - Server-side variables ไม่ต้องมี prefix

## Port Already in Use

### อาการ
```
Error: listen EADDRINUSE: address already in use :::4000
```

### วิธีแก้ไข

1. **หาว่า process ไหนใช้ port:**
   ```bash
   # Windows
   netstat -ano | findstr :4000
   
   # Kill process
   taskkill /PID <PID> /F
   ```

2. **เปลี่ยน Port:**
   ```bash
   # แก้ไข package.json
   "dev": "next dev -p 5000"
   ```

## Prisma Migration Errors

### อาการ
```
Migration failed
Database schema is not in sync
```

### วิธีแก้ไข

1. **Reset Database (Development Only!):**
   ```bash
   npx prisma migrate reset
   ```

2. **Push Schema:**
   ```bash
   npx prisma db push
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

## Docker Issues

### Container ไม่รัน

```bash
# ตรวจสอบ containers
docker ps -a

# เริ่ม container
docker start dormy-postgres-local

# ดู logs
docker logs dormy-postgres-local
```

### Port Conflict

```bash
# ตรวจสอบ port ที่ใช้
docker ps

# เปลี่ยน port ใน docker run
docker run -p 5433:5432 ...
# แล้วอัปเดต DATABASE_URL เป็น port 5433
```

## ยังแก้ไม่ได้?

1. **Clear Cache:**
   ```bash
   # ลบ .next folder
   rm -rf .next
   # หรือ Windows
   rmdir /s .next
   
   # ลบ node_modules และติดตั้งใหม่
   rm -rf node_modules
   npm install
   ```

2. **ตรวจสอบ Logs:**
   - ดู terminal output
   - ดู browser console
   - ดู network requests

3. **ตรวจสอบ Documentation:**
   - [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
   - [Prisma Troubleshooting](https://www.prisma.io/docs/guides/troubleshooting)
   - [Docker Documentation](https://docs.docker.com/)

