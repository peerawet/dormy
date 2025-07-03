import { PieChart, TrendingDown } from "lucide-react";

interface ExpensePieChartProps {
  data: {
    type: string;
    amount: number;
    percentage: number;
  }[];
  formatCurrency: (amount: number) => string;
  title: string;
  subtitle: string;
}

export default function ExpensePieChart({
  data,
  formatCurrency,
  title,
  subtitle,
}: ExpensePieChartProps) {
  const colors = [
    "#4E79A7",
    "#F28E2B",
    "#E15759",
    "#76B7B2",
    "#59A14F",
    "#EDC949",
    "#AF7AA1",
    "#FF9DA7",
  ];

  const typeThMap: Record<string, string> = {
    water: "ค่าน้ำ",
    electric: "ค่าไฟ",
    maintenance: "ซ่อมบำรุง",
    cleaning: "ทำความสะอาด",
    repair: "ซ่อมแซม",
    security: "รักษาความปลอดภัย",
    insurance: "ประกันภัย",
    internet: "อินเทอร์เน็ต",
    furniture: "ของใช้เฟอร์นิเจอร์",
    tools: "เครื่องมือ",
    other: "อื่นๆ",
  };

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  // Build conic-gradient string
  let start = 0;
  const segments = data.map((item, idx) => {
    const percent = totalAmount === 0 ? 0 : (item.amount / totalAmount) * 100;
    const end = start + percent;
    const seg = `${colors[idx % colors.length]} ${start}% ${end}%`;
    start = end;
    return seg;
  });
  const gradient = segments.length
    ? `conic-gradient(${segments.join(", ")})`
    : "conic-gradient(#e5e7eb 0% 100%)";

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
          <PieChart className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Pie using conic-gradient */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <div
          className="w-full h-full rounded-full"
          style={{ backgroundImage: gradient }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-md">
            <TrendingDown className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={item.type} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm font-medium text-gray-700">
                {typeThMap[item.type] || item.type}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {formatCurrency(item.amount)}
              </div>
              <div className="text-xs text-gray-500">
                {item.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-red-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">
              ค่าใช้จ่ายทั้งหมด
            </span>
          </div>
          <span className="text-lg font-bold text-red-600">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
