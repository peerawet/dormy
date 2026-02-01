# 🗄️ การตั้งค่า Local Database สำหรับ Development

คู่มือนี้จะช่วยคุณตั้งค่า PostgreSQL local database สำหรับ development

## 📋 ข้อดีของการใช้ Local Database

- ✅ ไม่กระทบข้อมูล production
- ✅ ทำงานได้แม้ไม่มี internet
- ✅ เร็วและไม่จำกัด quota
- ✅ ทดสอบได้อย่างอิสระ

## 🚀 วิธีติดตั้ง

### วิธีที่ 1: ติดตั้ง PostgreSQL โดยตรง

#### Windows

1. ดาวน์โหลด PostgreSQL จาก [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. ติดตั้งและตั้งค่า password สำหรับ user `postgres`
3. เปิด **pgAdmin** หรือ **psql** command line

#### macOS

```bash
# ใช้ Homebrew
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### วิธีที่ 2: ใช้ Docker (แนะนำ)

```bash
# รัน PostgreSQL container
docker run --name postgres-local \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=dormy_local \
  -p 5432:5432 \
  -d postgres:15

# ตรวจสอบว่า container รันอยู่
docker ps

# ดู logs
docker logs postgres-local
```

**หยุด container:**
```bash
docker stop postgres-local
```

**เริ่ม container อีกครั้ง:**
```bash
docker start postgres-local
```

## 🔧 ตั้งค่า Database

### 1. สร้าง Database

#### ใช้ psql (Command Line)

```bash
# เชื่อมต่อ PostgreSQL
psql -U postgres

# หรือถ้าใช้ Docker
docker exec -it postgres-local psql -U postgres
```

```sql
-- สร้าง database
CREATE DATABASE dormy_local;

-- ตรวจสอบ
\l
```

#### ใช้ pgAdmin (GUI)

1. เปิด pgAdmin
2. คลิกขวาที่ **Databases** → **Create** → **Database**
3. ตั้งชื่อ: `dormy_local`
4. คลิก **Save**

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local`:

```bash
# คัดลอกไฟล์ตัวอย่าง
cp env.local.example .env.local
```

แก้ไข `.env.local`:

```env
# ใช้ local database
# ต้องตรงกับ docker-compose.yml
# POSTGRES_USER: postgres
# POSTGRES_PASSWORD: postgres
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dormy_local"

# ถ้าเปลี่ยน password ใน docker-compose.yml ให้อัปเดตตรงนี้ด้วย
# DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/dormy_local"
```

### 3. Run Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations (development)
npm run db:migrate

# หรือใช้ db:push (ไม่สร้าง migration file)
npm run db:push
```

### 4. เปิด Prisma Studio (Optional)

```bash
npm run db:studio
```

เปิด browser ที่ `http://localhost:5555` เพื่อดูและจัดการข้อมูล

## ✅ ตรวจสอบการตั้งค่า

```bash
# ทดสอบ connection
npm run dev

# เปิด browser ที่ http://localhost:4000
# ลองสมัครสมาชิกและ login
```

## 🔄 Sync ข้อมูลจาก Production (Optional)

ถ้าต้องการ copy ข้อมูลจาก production database มาใช้ใน local:

```bash
# ใช้ script ที่มีอยู่แล้ว
npm run db:sync
```

หรือใช้ Prisma Migrate:

```bash
# Export จาก production
pg_dump -h production-host -U username -d dormy > backup.sql

# Import ไป local
psql -U postgres -d dormy_local < backup.sql
```

## 🛠️ Troubleshooting

### ปัญหา: Connection refused

**แก้ไข:**
- ตรวจสอบว่า PostgreSQL service รันอยู่
- ตรวจสอบ port 5432 ไม่ถูกใช้งาน
- ตรวจสอบ DATABASE_URL ใน `.env.local`

### ปัญหา: Authentication failed

**แก้ไข:**
- ตรวจสอบ username และ password ใน DATABASE_URL
- สำหรับ Docker: ตรวจสอบ POSTGRES_PASSWORD

### ปัญหา: Database does not exist

**แก้ไข:**
```sql
-- สร้าง database
CREATE DATABASE dormy_local;
```

### ปัญหา: Port 5432 ถูกใช้งาน

**แก้ไข:**
- เปลี่ยน port ใน Docker: `-p 5433:5432`
- อัปเดต DATABASE_URL: `postgresql://...@localhost:5433/dormy_local`

## 📝 คำสั่งที่มีประโยชน์

```bash
# เชื่อมต่อ database
psql -U postgres -d dormy_local

# ดู tables ทั้งหมด
\dt

# ดูข้อมูลใน table
SELECT * FROM "User";

# ออกจาก psql
\q

# Reset database (ลบทุกอย่างและ migrate ใหม่)
npx prisma migrate reset
```

## 🎯 Best Practices

1. **ใช้ database แยกสำหรับ dev และ production**
2. **อย่า commit `.env.local`** (ถูก ignore โดย git แล้ว)
3. **Backup ข้อมูลสำคัญก่อน reset**
4. **ใช้ migrations แทนการแก้ schema โดยตรง**

## 📚 เอกสารเพิ่มเติม

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker PostgreSQL Image](https://hub.docker.com/_/postgres)

