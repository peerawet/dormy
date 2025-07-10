# 🏠 Dormy - ระบบจัดการหอพัก

**ช่วยให้การจัดการหอพักเป็นเรื่องง่าย สะดวก และปลอดภัย**

Dormy เป็นระบบจัดการหอพักที่ครบครันสำหรับเจ้าของหอพัก ช่วยจัดการข้อมูลผู้เช่า ห้องพัก สัญญาเช่า และการเงินได้อย่างมีประสิทธิภาพ

## ✨ คุณสมบัติหลัก

### 📊 แดชบอร์ดและการวิเคราะห์

- **ภาพรวมรายได้และค่าใช้จ่าย** พร้อมกราฟแสดงแนวโน้ม
- **สถิติการดำเนินงาน** จำนวนห้อง ผู้เช่า และสัญญาที่ใกล้หมดอายุ
- **รายงานรายได้รายเดือน** และการเปรียบเทียบ
- **การวิเคราะห์ค่าใช้จ่าย** แยกตามประเภท

### 🏢 การจัดการหอพัก

- **จัดการหอพักหลายแห่ง** ในบัญชีเดียว
- **ข้อมูลหอพัก** ชื่อ ที่อยู่ และรายละเอียดต่างๆ
- **การจัดกลุ่มห้องพัก** และการกำหนดราคา

### 🚪 การจัดการห้องพัก

- **ข้อมูลห้องพัก** ชื่อห้อง ราคาเช่า
- **อัตราค่าสาธารณูปโภค** ไฟ น้ำ (แบบคิดตามหน่วยหรือคงที่)
- **ค่าใช้จ่ายเพิ่มเติม** ค่าส่วนกลาง ค่าอื่นๆ
- **สถานะห้องพัก** ว่าง ไม่ว่าง

### 👥 การจัดการผู้เช่า

- **ข้อมูลผู้เช่า** ชื่อ เบอร์โทร ที่อยู่ เลขบัตรประชาชน
- **การมอบหมายห้อง** ผู้เช่าหนึ่งคนสามารถเช่าหลายห้องได้
- **ประวัติการเช่า** และข้อมูลการติดต่อ

### 📄 การจัดการสัญญาเช่า

- **สร้างสัญญาเช่า** พร้อมกำหนดวันเริ่มต้นและสิ้นสุด
- **ค่าประกันและค่าเช่ามัดจำ** ตามข้อตกลง
- **การติดตามสัญญาที่ใกล้หมดอายุ**
- **พิมพ์สัญญาเช่า** เป็น PDF

### 💰 การจัดการบิลและการเงิน

- **สร้างบิลรายเดือน** อัตโนมัติตามข้อมูลห้องและผู้เช่า
- **คิดค่าไฟน้ำ** จากมิเตอร์หรืออัตราคงที่
- **ส่วนลดและค่าใช้จ่ายเพิ่มเติม**
- **พิมพ์ใบเสร็จ** เป็น PDF
- **การนำเข้าข้อมูลจาก Excel** สำหรับบิลจำนวนมาก

### 📈 การติดตามค่าใช้จ่าย

- **บันทึกค่าใช้จ่าย** แยกตามประเภท (น้ำ ไฟ ซ่อมแซม ทำความสะอาด)
- **ค่าใช้จ่ายเฉพาะห้อง** หรือทั้งหอพัก
- **กราฟแสดงแนวโน้มค่าใช้จ่าย**
- **รายงานค่าใช้จ่ายรายเดือน**

## 🛠 เทคโนโลยีที่ใช้

### Frontend

- **Next.js 15** - React Framework สำหรับ Production
- **React 19** - JavaScript Library สำหรับ User Interface
- **TypeScript** - Static Type Checking
- **Tailwind CSS** - Utility-first CSS Framework
- **Redux Toolkit** - State Management
- **Lucide React** - Icon Library
- **Recharts** - Chart Library สำหรับการแสดงผลกราฟ

### Backend & Database

- **Next.js API Routes** - Server-side API
- **Prisma ORM** - Database Toolkit
- **PostgreSQL** - Relational Database
- **NextAuth.js** - Authentication Library

### การจัดการไฟล์และรายงาน

- **jsPDF** - PDF Generation
- **html2canvas** - Screenshot to Canvas
- **xlsx** - Excel File Processing
- **Google Sheets API** - Integration with Google Sheets

## 🚀 การติดตั้งและใช้งาน

### ความต้องการของระบบ

- Node.js 18+
- PostgreSQL Database
- npm หรือ yarn

### 1. Clone Repository

```bash
git clone <repository-url>
cd dormy
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` และกำหนดค่าต่อไปนี้:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dormy"

# NextAuth
NEXTAUTH_URL="http://localhost:4000"
NEXTAUTH_SECRET="your-secret-key"

# Google Sheets API (Optional)
GOOGLE_SHEETS_PRIVATE_KEY="your-google-private-key"
GOOGLE_SHEETS_CLIENT_EMAIL="your-google-client-email"
```

### 4. เตรียม Database

```bash
# Generate Prisma Client
npx prisma generate

# Run Database Migrations
npx prisma migrate deploy

# (Optional) Seed Database
npx prisma db seed
```

### 5. รันแอปพลิเคชัน

#### Development Mode

```bash
npm run dev
```

เปิดบราวเซอร์ที่ `http://localhost:4000`

#### Production Mode

```bash
npm run build
npm start
```

## 📁 โครงสร้างโปรเจค

```
dormy/
├── prisma/                 # Database Schema และ Migrations
│   ├── migrations/         # Database Migration Files
│   └── schema.prisma       # Prisma Schema Definition
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API Routes
│   │   ├── components/    # React Components
│   │   ├── dashboard/     # Dashboard Pages
│   │   ├── dormitory/     # Dormitory Management
│   │   ├── expenses/      # Expense Management
│   │   └── tenants/       # Tenant Management
│   ├── lib/               # Utility Libraries
│   ├── store/             # Redux Store และ Slices
│   ├── types/             # TypeScript Type Definitions
│   └── utils/             # Helper Functions
├── public/                # Static Assets
└── package.json           # Project Dependencies
```

## 🎯 วิธีการใช้งาน

### 1. การสมัครสมาชิกและเข้าสู่ระบบ

- เข้าไปที่หน้า `/register` เพื่อสร้างบัญชีใหม่
- เข้าสู่ระบบที่หน้า `/login`

### 2. การสร้างหอพัก

- ไปที่หน้า "จัดการหอพัก" (`/dormitory`)
- คลิก "เพิ่มหอพัก" และกรอกข้อมูล

### 3. การเพิ่มห้องพัก

- เลือกหอพักที่ต้องการจัดการ
- คลิก "เพิ่มห้อง" และตั้งค่าราคาและอัตราค่าสาธารณูปโภค

### 4. การเพิ่มผู้เช่า

- ไปที่หน้า "จัดการผู้เช่า" (`/tenants`)
- เพิ่มข้อมูลผู้เช่าและมอบหมายห้อง

### 5. การสร้างสัญญาเช่า

- เลือกห้องพักในหน้าจัดการหอพัก
- คลิกแท็บ "สัญญาเช่า" และสร้างสัญญาใหม่

### 6. การสร้างบิล

- เลือกห้องพักในหน้าจัดการหอพัก
- คลิกแท็บ "บิล" และสร้างบิลรายเดือน

## 🔧 การกำหนดค่าเพิ่มเติม

### Docker Support

โปรเจคมี `Dockerfile` สำหรับการ Deploy:

```bash
# Build Docker Image
docker build -t dormy .

# Run Container
docker run -p 4000:4000 dormy
```

### Database Configuration

แก้ไขไฟล์ `prisma/schema.prisma` เพื่อเปลี่ยน Database Provider:

```prisma
datasource db {
  provider = "postgresql" // หรือ "mysql", "sqlite"
  url      = env("DATABASE_URL")
}
```

## 📝 API Documentation

### Authentication

- `POST /api/register` - สมัครสมาชิก
- `POST /api/login` - เข้าสู่ระบบ
- `GET /api/me` - ข้อมูลผู้ใช้ปัจจุบัน

### Dormitory Management

- `GET /api/dormitory` - รายการหอพัก
- `POST /api/dormitory` - สร้างหอพักใหม่

### Room Management

- `GET /api/room` - รายการห้องพัก
- `POST /api/room` - สร้างห้องใหม่
- `GET /api/room/detail?roomId=x` - รายละเอียดห้อง

### Tenant Management

- `GET /api/tenant` - รายการผู้เช่า
- `POST /api/tenant` - เพิ่มผู้เช่าใหม่
- `PUT /api/tenant/[id]` - แก้ไขข้อมูลผู้เช่า

### Bill Management

- `GET /api/bill` - รายการบิล
- `POST /api/bill` - สร้างบิลใหม่
- `POST /api/bill/bulk` - สร้างบิลจำนวนมาก

### Expense Management

- `GET /api/expense` - รายการค่าใช้จ่าย
- `POST /api/expense` - บันทึกค่าใช้จ่าย

## 🤝 การพัฒนาและการมีส่วนร่วม

### การเริ่มต้นพัฒนา

1. Fork Repository
2. สร้าง Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง Branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

### Code Style

- ใช้ ESLint และ Prettier สำหรับ Code Formatting
- ตั้งชื่อตัวแปรและฟังก์ชันให้สื่อความหมาย
- เขียน Comment สำหรับโค้ดที่ซับซ้อน

## 📄 License

โปรเจคนี้อยู่ภายใต้ MIT License - ดูรายละเอียดใน [LICENSE](LICENSE) file

## 📞 การติดต่อและสนับสนุน

หากมีคำถามหรือต้องการความช่วยเหลือ:

- สร้าง Issue ใน GitHub Repository
- ติดต่อทีมพัฒนาผ่านช่องทางอื่นๆ

**Made with ❤️ สำหรับผู้ประกอบการหอพักในประเทศไทย**

---

# 🏠 Dormy - Dormitory Management System

**Making dormitory management easy, convenient, and secure**

Dormy is a comprehensive dormitory management system for property owners, helping manage tenant information, rooms, rental contracts, and finances efficiently.

## ✨ Key Features

### 📊 Dashboard and Analytics

- **Revenue and expense overview** with trend charts
- **Operational statistics** including room count, tenants, and expiring contracts
- **Monthly revenue reports** and comparisons
- **Expense analysis** by category

### 🏢 Dormitory Management

- **Manage multiple dormitories** in one account
- **Dormitory information** including name, address, and details
- **Room grouping** and pricing configuration

### 🚪 Room Management

- **Room information** including name and rental price
- **Utility rates** for electricity and water (per unit or flat rate)
- **Additional fees** for common areas and other charges
- **Room status** tracking (vacant/occupied)

### 👥 Tenant Management

- **Tenant information** including name, phone, address, ID card number
- **Room assignments** - one tenant can rent multiple rooms
- **Rental history** and contact information

### 📄 Rental Contract Management

- **Create rental contracts** with start and end dates
- **Security deposits and advance payments** as per agreement
- **Track expiring contracts**
- **Print contracts** as PDF

### 💰 Bill and Financial Management

- **Generate monthly bills** automatically based on room and tenant data
- **Calculate utilities** from meter readings or flat rates
- **Discounts and additional charges**
- **Print receipts** as PDF
- **Excel import** for bulk bill creation

### 📈 Expense Tracking

- **Record expenses** by category (water, electricity, maintenance, cleaning)
- **Room-specific or dormitory-wide** expenses
- **Expense trend charts**
- **Monthly expense reports**

## 🛠 Technology Stack

### Frontend

- **Next.js 15** - React Framework for Production
- **React 19** - JavaScript Library for User Interface
- **TypeScript** - Static Type Checking
- **Tailwind CSS** - Utility-first CSS Framework
- **Redux Toolkit** - State Management
- **Lucide React** - Icon Library
- **Recharts** - Chart Library for data visualization

### Backend & Database

- **Next.js API Routes** - Server-side API
- **Prisma ORM** - Database Toolkit
- **PostgreSQL** - Relational Database
- **NextAuth.js** - Authentication Library

### File Management and Reports

- **jsPDF** - PDF Generation
- **html2canvas** - Screenshot to Canvas
- **xlsx** - Excel File Processing
- **Google Sheets API** - Integration with Google Sheets

## 🚀 Installation and Usage

### System Requirements

- Node.js 18+
- PostgreSQL Database
- npm or yarn

### 1. Clone Repository

```bash
git clone <repository-url>
cd dormy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env.local` file and configure the following:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dormy"

# NextAuth
NEXTAUTH_URL="http://localhost:4000"
NEXTAUTH_SECRET="your-secret-key"

# Google Sheets API (Optional)
GOOGLE_SHEETS_PRIVATE_KEY="your-google-private-key"
GOOGLE_SHEETS_CLIENT_EMAIL="your-google-client-email"
```

### 4. Prepare Database

```bash
# Generate Prisma Client
npx prisma generate

# Run Database Migrations
npx prisma migrate deploy

# (Optional) Seed Database
npx prisma db seed
```

### 5. Run Application

#### Development Mode

```bash
npm run dev
```

Open browser at `http://localhost:4000`

#### Production Mode

```bash
npm run build
npm start
```

## 📁 Project Structure

```
dormy/
├── prisma/                 # Database Schema and Migrations
│   ├── migrations/         # Database Migration Files
│   └── schema.prisma       # Prisma Schema Definition
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API Routes
│   │   ├── components/    # React Components
│   │   ├── dashboard/     # Dashboard Pages
│   │   ├── dormitory/     # Dormitory Management
│   │   ├── expenses/      # Expense Management
│   │   └── tenants/       # Tenant Management
│   ├── lib/               # Utility Libraries
│   ├── store/             # Redux Store and Slices
│   ├── types/             # TypeScript Type Definitions
│   └── utils/             # Helper Functions
├── public/                # Static Assets
└── package.json           # Project Dependencies
```

## 🎯 How to Use

### 1. Registration and Login

- Go to `/register` to create a new account
- Login at `/login`

### 2. Create Dormitory

- Go to "Dormitory Management" (`/dormitory`)
- Click "Add Dormitory" and fill in information

### 3. Add Rooms

- Select the dormitory you want to manage
- Click "Add Room" and configure pricing and utility rates

### 4. Add Tenants

- Go to "Tenant Management" (`/tenants`)
- Add tenant information and assign rooms

### 5. Create Rental Contracts

- Select a room in dormitory management
- Click "Contracts" tab and create new contract

### 6. Generate Bills

- Select a room in dormitory management
- Click "Bills" tab and create monthly bills

## 🔧 Additional Configuration

### Docker Support

Project includes `Dockerfile` for deployment:

```bash
# Build Docker Image
docker build -t dormy .

# Run Container
docker run -p 4000:4000 dormy
```

### Database Configuration

Edit `prisma/schema.prisma` to change Database Provider:

```prisma
datasource db {
  provider = "postgresql" // or "mysql", "sqlite"
  url      = env("DATABASE_URL")
}
```

## 📝 API Documentation

### Authentication

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/me` - Current user information

### Dormitory Management

- `GET /api/dormitory` - List dormitories
- `POST /api/dormitory` - Create new dormitory

### Room Management

- `GET /api/room` - List rooms
- `POST /api/room` - Create new room
- `GET /api/room/detail?roomId=x` - Room details

### Tenant Management

- `GET /api/tenant` - List tenants
- `POST /api/tenant` - Add new tenant
- `PUT /api/tenant/[id]` - Update tenant information

### Bill Management

- `GET /api/bill` - List bills
- `POST /api/bill` - Create new bill
- `POST /api/bill/bulk` - Create bulk bills

### Expense Management

- `GET /api/expense` - List expenses
- `POST /api/expense` - Record expense

## 🤝 Development and Contributing

### Getting Started with Development

1. Fork Repository
2. Create Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to Branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Style

- Use ESLint and Prettier for code formatting
- Use meaningful variable and function names
- Write comments for complex code

## 📄 License

This project is under MIT License - see [LICENSE](LICENSE) file for details

## 📞 Contact and Support

If you have questions or need help:

- Create an Issue in GitHub Repository
- Contact development team through other channels

**Made with ❤️ for dormitory entrepreneurs in Thailand**
