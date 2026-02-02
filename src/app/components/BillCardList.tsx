import BillCard from "./BillCard";

interface BillCardListProps {
  bills: Array<{
    id: number;
    billDate: string;
    tenant: {
      name: string;
    };
    total: number;
    rent: number;
    water: number;
    electric: number;
    common: number;
    other: number;
    discount: number;
    isPaid: boolean;
    slipUrl?: string | null;
  }>;
  onEdit: (bill: any) => void;
  onDelete: (bill: any) => void;
  onTogglePaid: (bill: any) => void;
  onUploadSlip?: (bill: any, file: File) => void;
}

export default function BillCardList({
  bills,
  onEdit,
  onDelete,
  onTogglePaid,
  onUploadSlip,
}: BillCardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bills.map((bill) => (
        <BillCard
          key={bill.id}
          bill={bill}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePaid={onTogglePaid}
          onUploadSlip={onUploadSlip}
        />
      ))}
    </div>
  );
}
