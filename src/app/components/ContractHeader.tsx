interface ContractHeaderProps {
  viewMode: "table" | "card";
  onViewModeChange: (mode: "table" | "card") => void;
  onAddContract: () => void;
}

export default function ContractHeader({
  viewMode,
  onViewModeChange,
  onAddContract,
}: ContractHeaderProps) {
  return (
    <>
      <div className="hidden md:flex bg-blue-50 px-6 py-4 border-b items-center justify-between">
        <h3 className="font-bold text-lg text-blue-900 flex items-center gap-2">
          <span>📋</span> สัญญาเช่า
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => onViewModeChange("table")}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                viewMode === "table"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>{" "}
              ตาราง
            </button>
            <button
              onClick={() => onViewModeChange("card")}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                viewMode === "card"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>{" "}
              การ์ด
            </button>
          </div>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={onAddContract}
          >
            + เพิ่มสัญญา
          </button>
        </div>
      </div>

      {/* mobile */}
      <div className="md:hidden bg-blue-50 px-4 py-3 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-base text-blue-900 flex items-center gap-2">
            <span>📋</span> สัญญาเช่า
          </h3>
          <div className="flex bg-white rounded-lg p-0.5 shadow-sm border">
            <button
              onClick={() => onViewModeChange("table")}
              className={`px-2 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 ${
                viewMode === "table"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span className="hidden xs:inline">ตาราง</span>
            </button>
            <button
              onClick={() => onViewModeChange("card")}
              className={`px-2 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 ${
                viewMode === "card"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              <span className="hidden xs:inline">การ์ด</span>
            </button>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full max-w-48"
            onClick={onAddContract}
          >
            + เพิ่มสัญญาเช่า
          </button>
        </div>
      </div>
    </>
  );
}
