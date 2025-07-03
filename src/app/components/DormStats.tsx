import { useMemo } from "react";

interface DormStatsProps {
  dorms: any[];
}

export default function DormStats({ dorms }: DormStatsProps) {
  const stats = useMemo(() => {
    const totalRooms = dorms.reduce(
      (t: number, d: any) => t + (d.rooms?.length || 0),
      0
    );
    const occupiedRooms = dorms.reduce(
      (t: number, d: any) =>
        t +
        (d.rooms?.filter((r: any) => (r.tenantRooms?.length || 0) > 0).length ||
          0),
      0
    );
    const totalTenants = dorms.reduce(
      (t: number, d: any) =>
        t +
        (d.rooms?.reduce(
          (rt: number, r: any) => rt + (r.tenantRooms?.length || 0),
          0
        ) || 0),
      0
    );
    const occupancyRate = Math.round(
      (occupiedRooms / Math.max(totalRooms, 1)) * 100
    );

    const totalDeposit = dorms.reduce(
      (sum: number, dorm: any) =>
        sum +
        (dorm.rooms?.reduce(
          (rsum: number, room: any) =>
            rsum +
            (room.rentalContracts?.reduce(
              (csum: number, ct: any) => csum + (ct.deposit || 0),
              0
            ) || 0),
          0
        ) || 0),
      0
    );

    const totalInsurance = dorms.reduce(
      (sum: number, dorm: any) =>
        sum +
        (dorm.rooms?.reduce(
          (rsum: number, room: any) =>
            rsum +
            (room.rentalContracts?.reduce(
              (csum: number, ct: any) => csum + (ct.insurance || 0),
              0
            ) || 0),
          0
        ) || 0),
      0
    );

    return {
      totalRooms,
      occupiedRooms,
      occupancyRate,
      totalTenants,
      totalDeposit,
      totalInsurance,
    };
  }, [dorms]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
      {/* Dorms */}
      <StatCard
        color="blue"
        icon="🏢"
        value={dorms.length}
        label="หอพักทั้งหมด"
      />
      {/* Rooms */}
      <StatCard
        color="indigo"
        icon="🏠"
        value={stats.totalRooms}
        label="ห้องพักทั้งหมด"
      />
      {/* Tenants */}
      <StatCard
        color="green"
        icon="👥"
        value={stats.totalTenants}
        label="ผู้เช่าทั้งหมด"
      />
      {/* Occupancy */}
      <StatCard
        color="orange"
        icon="📊"
        value={`${stats.occupancyRate}%`}
        label="อัตราการเข้าพัก"
      />
      {/* Deposit */}
      <StatCard
        color="yellow"
        icon="💰"
        value={`฿${stats.totalDeposit.toLocaleString()}`}
        label="รวมค่ามัดจำ"
      />
      {/* Insurance */}
      <StatCard
        color="red"
        icon="🛡️"
        value={`฿${stats.totalInsurance.toLocaleString()}`}
        label="รวมค่าประกัน"
      />
    </div>
  );
}

function StatCard({
  color,
  icon,
  value,
  label,
}: {
  color: string;
  icon: string;
  value: any;
  label: string;
}) {
  const bgColor = {
    blue: "bg-blue-100",
    indigo: "bg-indigo-100",
    green: "bg-green-100",
    orange: "bg-orange-100",
    yellow: "bg-yellow-100",
    red: "bg-red-100",
  }[color as keyof any];

  const textColor = {
    blue: "text-blue-600",
    indigo: "text-indigo-600",
    green: "text-green-600",
    orange: "text-orange-600",
    yellow: "text-yellow-600",
    red: "text-red-600",
  }[color as keyof any];

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}
        >
          {icon}
        </div>
        <div>
          <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
          <div className="text-gray-600 text-sm">{label}</div>
        </div>
      </div>
    </div>
  );
}
