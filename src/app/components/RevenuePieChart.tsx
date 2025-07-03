import { PieChart, TrendingUp } from "lucide-react";

interface RevenuePieChartProps {
  data: {
    type: string;
    amount: number;
    percentage: number;
  }[];
  formatCurrency: (amount: number) => string;
  title: string;
  subtitle: string;
}

export default function RevenuePieChart({
  data,
  formatCurrency,
  title,
  subtitle,
}: RevenuePieChartProps) {
  // Color-blind friendly palette (8 distinct colors)
  const colors = [
    "#4E79A7", // blue
    "#F28E2B", // orange
    "#E15759", // red
    "#76B7B2", // teal
    "#59A14F", // green
    "#EDC949", // yellow
    "#AF7AA1", // purple
    "#FF9DA7", // pink
  ];

  const typeThMap: Record<string, string> = {
    rent: "ค่าเช่า",
    water: "ค่าน้ำ",
    electric: "ค่าไฟ",
    common: "ค่าบริการส่วนกลาง",
    other: "อื่นๆ",
    discount: "ส่วนลด",
  };

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  // Build conic-gradient string for accurate slices
  let start = 0;
  const gradientSegments: string[] = data.map((item, idx) => {
    const percent = totalAmount === 0 ? 0 : (item.amount / totalAmount) * 100;
    const end = start + percent;
    const segment = `${colors[idx % colors.length]} ${start}% ${end}%`;
    start = end;
    return segment;
  });
  const gradient = gradientSegments.length
    ? `conic-gradient(${gradientSegments.join(", ")})`
    : "conic-gradient(#e5e7eb 0% 100%)"; // fallback grey

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
          <PieChart className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Pie Chart using conic-gradient */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <div
          className="w-full h-full rounded-full"
          style={{ backgroundImage: gradient }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-md">
            <TrendingUp className="w-6 h-6 text-green-600" />
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

      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">
              รายได้ทั้งหมด
            </span>
          </div>
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
