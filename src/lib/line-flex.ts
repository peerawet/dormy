/**
 * LINE Flex Message Builders
 * Minimal, powerful flex messages for Dormy
 */

const BASE_URL = process.env.NEXTAUTH_URL || "https://dormy.forifi.xyz";

// ============================================
// Color Palette (Dark minimal theme)
// ============================================
const COLORS = {
  bg: "#0F172A",
  bgCard: "#1E293B",
  accent: "#10B981", // emerald
  accentBlue: "#3B82F6",
  accentRed: "#EF4444",
  accentYellow: "#F59E0B",
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  border: "#334155",
};

// ============================================
// Type definitions
// ============================================
interface FlexMessage {
  type: "flex";
  altText: string;
  contents: FlexContainer;
}

interface FlexContainer {
  type: "bubble" | "carousel";
  [key: string]: any;
}

// ============================================
// Dashboard Flex Message
// ============================================
export function buildDashboardFlex(data: {
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  totalRevenue: number;
  unpaidBills: number;
  ownerName: string;
}): FlexMessage {
  const occupancyRate = data.totalRooms > 0 
    ? Math.round((data.occupiedRooms / data.totalRooms) * 100) 
    : 0;

  return {
    type: "flex",
    altText: "📊 Dashboard Summary",
    contents: {
      type: "bubble",
      size: "giga",
      styles: {
        body: { backgroundColor: COLORS.bg },
        footer: { backgroundColor: COLORS.bg },
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "lg",
        paddingAll: "24px",
        contents: [
          // Header
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "📊",
                size: "xxl",
              },
              {
                type: "box",
                layout: "vertical",
                flex: 1,
                paddingStart: "12px",
                contents: [
                  {
                    type: "text",
                    text: "Dashboard",
                    weight: "bold",
                    size: "xl",
                    color: COLORS.textPrimary,
                  },
                  {
                    type: "text",
                    text: data.ownerName,
                    size: "sm",
                    color: COLORS.textSecondary,
                  },
                ],
              },
            ],
          },
          // Separator
          {
            type: "separator",
            color: COLORS.border,
          },
          // Stats Grid
          {
            type: "box",
            layout: "horizontal",
            spacing: "md",
            contents: [
              // Total Rooms
              buildStatBox("🏠", data.totalRooms.toString(), "ห้องทั้งหมด", COLORS.accent),
              // Occupied
              buildStatBox("✅", data.occupiedRooms.toString(), "มีผู้เช่า", COLORS.accentBlue),
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            spacing: "md",
            contents: [
              // Vacant
              buildStatBox("⬜", data.vacantRooms.toString(), "ว่าง", COLORS.textMuted),
              // Occupancy Rate
              buildStatBox("📈", `${occupancyRate}%`, "อัตราเข้าพัก", COLORS.accentYellow),
            ],
          },
          // Revenue Section
          {
            type: "box",
            layout: "vertical",
            backgroundColor: COLORS.bgCard,
            cornerRadius: "lg",
            paddingAll: "16px",
            contents: [
              {
                type: "text",
                text: "รายได้เดือนนี้",
                size: "sm",
                color: COLORS.textSecondary,
              },
              {
                type: "text",
                text: `฿${data.totalRevenue.toLocaleString()}`,
                size: "xxl",
                weight: "bold",
                color: COLORS.accent,
              },
              {
                type: "text",
                text: data.unpaidBills > 0 
                  ? `⚠️ ค้างชำระ ${data.unpaidBills} บิล`
                  : "✅ ไม่มีค้างชำระ",
                size: "sm",
                color: data.unpaidBills > 0 ? COLORS.accentYellow : COLORS.textMuted,
                margin: "sm",
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "เปิด Dashboard",
              uri: `${BASE_URL}/dashboard`,
            },
            style: "primary",
            color: COLORS.accent,
          },
        ],
      },
    },
  };
}

// ============================================
// Bills Flex Message (Carousel)
// ============================================
export function buildBillsFlex(bills: Array<{
  id: number;
  roomName: string;
  tenantName: string;
  total: number;
  billDate: Date;
  isPaid: boolean;
}>): FlexMessage {
  if (bills.length === 0) {
    return buildEmptyFlex("💰", "Bills", "ยังไม่มีบิลในเดือนนี้");
  }

  const bubbles = bills.slice(0, 10).map((bill) => ({
    type: "bubble",
    size: "kilo",
    styles: {
      body: { backgroundColor: COLORS.bg },
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      paddingAll: "20px",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: bill.roomName,
              weight: "bold",
              size: "lg",
              color: COLORS.textPrimary,
              flex: 1,
            },
            {
              type: "box",
              layout: "vertical",
              backgroundColor: bill.isPaid ? COLORS.accent : COLORS.accentYellow,
              cornerRadius: "sm",
              paddingAll: "4px",
              paddingStart: "8px",
              paddingEnd: "8px",
              contents: [
                {
                  type: "text",
                  text: bill.isPaid ? "ชำระแล้ว" : "รอชำระ",
                  size: "xs",
                  color: "#FFFFFF",
                  weight: "bold",
                },
              ],
            },
          ],
        },
        {
          type: "text",
          text: bill.tenantName,
          size: "sm",
          color: COLORS.textSecondary,
        },
        {
          type: "separator",
          color: COLORS.border,
          margin: "md",
        },
        {
          type: "text",
          text: `฿${bill.total.toLocaleString()}`,
          size: "xl",
          weight: "bold",
          color: bill.isPaid ? COLORS.textMuted : COLORS.textPrimary,
        },
        {
          type: "text",
          text: formatDate(bill.billDate),
          size: "xs",
          color: COLORS.textMuted,
        },
      ],
    },
  }));

  return {
    type: "flex",
    altText: `💰 Bills (${bills.length} รายการ)`,
    contents: {
      type: "carousel",
      contents: bubbles,
    },
  };
}

// ============================================
// Tenants Flex Message
// ============================================
export function buildTenantsFlex(tenants: Array<{
  name: string;
  phone: string;
  roomName: string;
  dormName: string;
}>): FlexMessage {
  if (tenants.length === 0) {
    return buildEmptyFlex("👥", "Tenants", "ยังไม่มีผู้เช่า");
  }

  const contents: any[] = [
    {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "text",
          text: "👥",
          size: "xxl",
        },
        {
          type: "box",
          layout: "vertical",
          flex: 1,
          paddingStart: "12px",
          contents: [
            {
              type: "text",
              text: "ผู้เช่าทั้งหมด",
              weight: "bold",
              size: "xl",
              color: COLORS.textPrimary,
            },
            {
              type: "text",
              text: `${tenants.length} คน`,
              size: "sm",
              color: COLORS.textSecondary,
            },
          ],
        },
      ],
    },
    {
      type: "separator",
      color: COLORS.border,
      margin: "lg",
    },
  ];

  // Add tenant rows (max 5)
  tenants.slice(0, 5).forEach((tenant) => {
    contents.push({
      type: "box",
      layout: "horizontal",
      spacing: "md",
      margin: "md",
      contents: [
        {
          type: "box",
          layout: "vertical",
          flex: 1,
          contents: [
            {
              type: "text",
              text: tenant.name,
              weight: "bold",
              size: "md",
              color: COLORS.textPrimary,
            },
            {
              type: "text",
              text: `${tenant.dormName} - ${tenant.roomName}`,
              size: "xs",
              color: COLORS.textSecondary,
            },
          ],
        },
        {
          type: "text",
          text: tenant.phone,
          size: "sm",
          color: COLORS.textMuted,
          align: "end",
        },
      ],
    });
  });

  if (tenants.length > 5) {
    contents.push({
      type: "text",
      text: `และอีก ${tenants.length - 5} คน...`,
      size: "sm",
      color: COLORS.textMuted,
      margin: "md",
      align: "center",
    });
  }

  return {
    type: "flex",
    altText: `👥 Tenants (${tenants.length} คน)`,
    contents: {
      type: "bubble",
      size: "giga",
      styles: {
        body: { backgroundColor: COLORS.bg },
        footer: { backgroundColor: COLORS.bg },
      },
      body: {
        type: "box",
        layout: "vertical",
        paddingAll: "24px",
        contents,
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "ดูทั้งหมด",
              uri: `${BASE_URL}/tenants`,
            },
            style: "primary",
            color: COLORS.accent,
          },
        ],
      },
    },
  };
}

// ============================================
// Expenses Flex Message
// ============================================
export function buildExpensesFlex(data: {
  totalThisMonth: number;
  expenses: Array<{
    type: string;
    description: string;
    amount: number;
    date: Date;
  }>;
}): FlexMessage {
  const contents: any[] = [
    {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "text",
          text: "💸",
          size: "xxl",
        },
        {
          type: "box",
          layout: "vertical",
          flex: 1,
          paddingStart: "12px",
          contents: [
            {
              type: "text",
              text: "ค่าใช้จ่าย",
              weight: "bold",
              size: "xl",
              color: COLORS.textPrimary,
            },
            {
              type: "text",
              text: "เดือนนี้",
              size: "sm",
              color: COLORS.textSecondary,
            },
          ],
        },
      ],
    },
    {
      type: "box",
      layout: "vertical",
      backgroundColor: COLORS.bgCard,
      cornerRadius: "lg",
      paddingAll: "16px",
      margin: "lg",
      contents: [
        {
          type: "text",
          text: `฿${data.totalThisMonth.toLocaleString()}`,
          size: "xxl",
          weight: "bold",
          color: COLORS.accentRed,
        },
      ],
    },
    {
      type: "separator",
      color: COLORS.border,
      margin: "lg",
    },
  ];

  // Recent expenses
  if (data.expenses.length > 0) {
    data.expenses.slice(0, 4).forEach((exp) => {
      contents.push({
        type: "box",
        layout: "horizontal",
        margin: "md",
        contents: [
          {
            type: "box",
            layout: "vertical",
            flex: 1,
            contents: [
              {
                type: "text",
                text: exp.description || exp.type,
                size: "sm",
                color: COLORS.textPrimary,
              },
              {
                type: "text",
                text: formatDate(exp.date),
                size: "xs",
                color: COLORS.textMuted,
              },
            ],
          },
          {
            type: "text",
            text: `-฿${exp.amount.toLocaleString()}`,
            size: "sm",
            weight: "bold",
            color: COLORS.accentRed,
          },
        ],
      });
    });
  } else {
    contents.push({
      type: "text",
      text: "ยังไม่มีรายการเดือนนี้",
      size: "sm",
      color: COLORS.textMuted,
      margin: "md",
      align: "center",
    });
  }

  return {
    type: "flex",
    altText: `💸 Expenses ฿${data.totalThisMonth.toLocaleString()}`,
    contents: {
      type: "bubble",
      size: "giga",
      styles: {
        body: { backgroundColor: COLORS.bg },
        footer: { backgroundColor: COLORS.bg },
      },
      body: {
        type: "box",
        layout: "vertical",
        paddingAll: "24px",
        contents,
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "จัดการค่าใช้จ่าย",
              uri: `${BASE_URL}/expenses`,
            },
            style: "primary",
            color: COLORS.accent,
          },
        ],
      },
    },
  };
}

// ============================================
// Rooms Flex Message
// ============================================
export function buildRoomsFlex(rooms: Array<{
  name: string;
  dormName: string;
  price: number;
  isOccupied: boolean;
  tenantName?: string;
}>): FlexMessage {
  if (rooms.length === 0) {
    return buildEmptyFlex("🏠", "Rooms", "ยังไม่มีห้องพัก");
  }

  const occupied = rooms.filter((r) => r.isOccupied).length;
  const vacant = rooms.length - occupied;

  const contents: any[] = [
    {
      type: "box",
      layout: "horizontal",
      contents: [
        {
          type: "text",
          text: "🏠",
          size: "xxl",
        },
        {
          type: "box",
          layout: "vertical",
          flex: 1,
          paddingStart: "12px",
          contents: [
            {
              type: "text",
              text: "ห้องพัก",
              weight: "bold",
              size: "xl",
              color: COLORS.textPrimary,
            },
            {
              type: "text",
              text: `${rooms.length} ห้อง`,
              size: "sm",
              color: COLORS.textSecondary,
            },
          ],
        },
      ],
    },
    // Summary
    {
      type: "box",
      layout: "horizontal",
      spacing: "md",
      margin: "lg",
      contents: [
        {
          type: "box",
          layout: "vertical",
          flex: 1,
          backgroundColor: COLORS.bgCard,
          cornerRadius: "md",
          paddingAll: "12px",
          contents: [
            {
              type: "text",
              text: occupied.toString(),
              size: "xl",
              weight: "bold",
              color: COLORS.accent,
              align: "center",
            },
            {
              type: "text",
              text: "มีผู้เช่า",
              size: "xs",
              color: COLORS.textMuted,
              align: "center",
            },
          ],
        },
        {
          type: "box",
          layout: "vertical",
          flex: 1,
          backgroundColor: COLORS.bgCard,
          cornerRadius: "md",
          paddingAll: "12px",
          contents: [
            {
              type: "text",
              text: vacant.toString(),
              size: "xl",
              weight: "bold",
              color: COLORS.textMuted,
              align: "center",
            },
            {
              type: "text",
              text: "ว่าง",
              size: "xs",
              color: COLORS.textMuted,
              align: "center",
            },
          ],
        },
      ],
    },
    {
      type: "separator",
      color: COLORS.border,
      margin: "lg",
    },
  ];

  // Room list
  rooms.slice(0, 5).forEach((room) => {
    contents.push({
      type: "box",
      layout: "horizontal",
      margin: "md",
      contents: [
        {
          type: "box",
          layout: "vertical",
          width: "8px",
          height: "40px",
          backgroundColor: room.isOccupied ? COLORS.accent : COLORS.textMuted,
          cornerRadius: "sm",
        },
        {
          type: "box",
          layout: "vertical",
          flex: 1,
          paddingStart: "12px",
          contents: [
            {
              type: "text",
              text: room.name,
              weight: "bold",
              size: "sm",
              color: COLORS.textPrimary,
            },
            {
              type: "text",
              text: room.isOccupied ? room.tenantName || "มีผู้เช่า" : "ว่าง",
              size: "xs",
              color: room.isOccupied ? COLORS.textSecondary : COLORS.textMuted,
            },
          ],
        },
        {
          type: "text",
          text: `฿${room.price.toLocaleString()}`,
          size: "sm",
          color: COLORS.textMuted,
        },
      ],
    });
  });

  return {
    type: "flex",
    altText: `🏠 Rooms (${rooms.length} ห้อง)`,
    contents: {
      type: "bubble",
      size: "giga",
      styles: {
        body: { backgroundColor: COLORS.bg },
        footer: { backgroundColor: COLORS.bg },
      },
      body: {
        type: "box",
        layout: "vertical",
        paddingAll: "24px",
        contents,
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "จัดการห้องพัก",
              uri: `${BASE_URL}/dormitory`,
            },
            style: "primary",
            color: COLORS.accent,
          },
        ],
      },
    },
  };
}

// ============================================
// Tenant: My Room Flex
// ============================================
export function buildMyRoomFlex(data: {
  tenantName: string;
  roomName: string;
  dormName: string;
  dormAddress: string;
  price: number;
  ownerName: string;
  ownerPhone: string;
}): FlexMessage {
  return {
    type: "flex",
    altText: `🏠 ${data.roomName} - ${data.dormName}`,
    contents: {
      type: "bubble",
      size: "giga",
      styles: {
        body: { backgroundColor: COLORS.bg },
        footer: { backgroundColor: COLORS.bg },
      },
      body: {
        type: "box",
        layout: "vertical",
        paddingAll: "24px",
        spacing: "lg",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "🏠",
                size: "xxl",
              },
              {
                type: "box",
                layout: "vertical",
                flex: 1,
                paddingStart: "12px",
                contents: [
                  {
                    type: "text",
                    text: data.roomName,
                    weight: "bold",
                    size: "xl",
                    color: COLORS.textPrimary,
                  },
                  {
                    type: "text",
                    text: data.dormName,
                    size: "sm",
                    color: COLORS.textSecondary,
                  },
                ],
              },
            ],
          },
          {
            type: "separator",
            color: COLORS.border,
          },
          // Price
          {
            type: "box",
            layout: "vertical",
            backgroundColor: COLORS.bgCard,
            cornerRadius: "lg",
            paddingAll: "16px",
            contents: [
              {
                type: "text",
                text: "ค่าเช่ารายเดือน",
                size: "sm",
                color: COLORS.textSecondary,
              },
              {
                type: "text",
                text: `฿${data.price.toLocaleString()}`,
                size: "xxl",
                weight: "bold",
                color: COLORS.accent,
              },
            ],
          },
          // Address
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "📍 ที่อยู่",
                size: "sm",
                color: COLORS.textMuted,
              },
              {
                type: "text",
                text: data.dormAddress || "-",
                size: "sm",
                color: COLORS.textPrimary,
                wrap: true,
              },
            ],
          },
          // Owner contact
          {
            type: "box",
            layout: "horizontal",
            backgroundColor: COLORS.bgCard,
            cornerRadius: "md",
            paddingAll: "12px",
            contents: [
              {
                type: "box",
                layout: "vertical",
                flex: 1,
                contents: [
                  {
                    type: "text",
                    text: "เจ้าของหอพัก",
                    size: "xs",
                    color: COLORS.textMuted,
                  },
                  {
                    type: "text",
                    text: data.ownerName,
                    size: "sm",
                    weight: "bold",
                    color: COLORS.textPrimary,
                  },
                ],
              },
              {
                type: "text",
                text: data.ownerPhone,
                size: "sm",
                color: COLORS.accentBlue,
              },
            ],
          },
        ],
      },
    },
  };
}

// ============================================
// Tenant: My Bills Flex
// ============================================
export function buildMyBillsFlex(bills: Array<{
  id: number;
  billDate: Date;
  rent: number;
  water: number;
  electric: number;
  total: number;
  isPaid: boolean;
}>): FlexMessage {
  if (bills.length === 0) {
    return buildEmptyFlex("💰", "บิลค่าเช่า", "ยังไม่มีบิลค่าเช่า");
  }

  const bubbles = bills.slice(0, 5).map((bill) => ({
    type: "bubble",
    size: "kilo",
    styles: {
      body: { backgroundColor: COLORS.bg },
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      paddingAll: "20px",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: formatMonthYear(bill.billDate),
              weight: "bold",
              size: "lg",
              color: COLORS.textPrimary,
              flex: 1,
            },
            {
              type: "box",
              layout: "vertical",
              backgroundColor: bill.isPaid ? COLORS.accent : COLORS.accentRed,
              cornerRadius: "sm",
              paddingAll: "4px",
              paddingStart: "8px",
              paddingEnd: "8px",
              contents: [
                {
                  type: "text",
                  text: bill.isPaid ? "ชำระแล้ว" : "ค้างชำระ",
                  size: "xs",
                  color: "#FFFFFF",
                  weight: "bold",
                },
              ],
            },
          ],
        },
        {
          type: "separator",
          color: COLORS.border,
        },
        {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          contents: [
            buildBillRow("ค่าเช่า", bill.rent),
            buildBillRow("ค่าน้ำ", bill.water),
            buildBillRow("ค่าไฟ", bill.electric),
          ],
        },
        {
          type: "separator",
          color: COLORS.border,
        },
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "รวม",
              weight: "bold",
              color: COLORS.textSecondary,
            },
            {
              type: "text",
              text: `฿${bill.total.toLocaleString()}`,
              weight: "bold",
              size: "lg",
              color: bill.isPaid ? COLORS.accent : COLORS.textPrimary,
              align: "end",
            },
          ],
        },
      ],
    },
  }));

  return {
    type: "flex",
    altText: `💰 บิลค่าเช่า (${bills.length} รายการ)`,
    contents: {
      type: "carousel",
      contents: bubbles,
    },
  };
}

// ============================================
// Helper Functions
// ============================================
function buildStatBox(emoji: string, value: string, label: string, color: string): any {
  return {
    type: "box",
    layout: "vertical",
    flex: 1,
    backgroundColor: COLORS.bgCard,
    cornerRadius: "lg",
    paddingAll: "12px",
    contents: [
      {
        type: "text",
        text: emoji,
        size: "lg",
      },
      {
        type: "text",
        text: value,
        size: "xl",
        weight: "bold",
        color: color,
      },
      {
        type: "text",
        text: label,
        size: "xs",
        color: COLORS.textMuted,
      },
    ],
  };
}

function buildBillRow(label: string, amount: number): any {
  return {
    type: "box",
    layout: "horizontal",
    contents: [
      {
        type: "text",
        text: label,
        size: "sm",
        color: COLORS.textSecondary,
      },
      {
        type: "text",
        text: `฿${amount.toLocaleString()}`,
        size: "sm",
        color: COLORS.textPrimary,
        align: "end",
      },
    ],
  };
}

function buildEmptyFlex(emoji: string, title: string, message: string): FlexMessage {
  return {
    type: "flex",
    altText: `${emoji} ${title}`,
    contents: {
      type: "bubble",
      size: "kilo",
      styles: {
        body: { backgroundColor: COLORS.bg },
      },
      body: {
        type: "box",
        layout: "vertical",
        paddingAll: "24px",
        spacing: "md",
        justifyContent: "center",
        alignItems: "center",
        contents: [
          {
            type: "text",
            text: emoji,
            size: "3xl",
          },
          {
            type: "text",
            text: title,
            weight: "bold",
            size: "lg",
            color: COLORS.textPrimary,
          },
          {
            type: "text",
            text: message,
            size: "sm",
            color: COLORS.textMuted,
            align: "center",
          },
        ],
      },
    },
  };
}

function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

function formatMonthYear(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });
}

