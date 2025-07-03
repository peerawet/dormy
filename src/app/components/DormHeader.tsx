interface DormHeaderProps {
  onAddDorm: () => void;
}

export default function DormHeader({ onAddDorm }: DormHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-blue-200/50">
          <span>🏢</span>
          <span>จัดการหอพัก</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 mb-2">
          หอพักของคุณ
        </h1>
        <p className="text-gray-600">จัดการหอพักและห้องพักทั้งหมดในที่เดียว</p>
      </div>
      <button
        onClick={onAddDorm}
        className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
      >
        <span className="text-xl">🏠</span>
        <span>เพิ่มหอพัก</span>
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
      </button>
    </div>
  );
}
