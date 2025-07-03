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
  }>;
  onEdit: (bill: any) => void;
  onDelete: (bill: any) => void;
}

export default function BillCardList({
  bills,
  onEdit,
  onDelete,
}: BillCardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bills.map((bill) => (
        <BillCard
          key={bill.id}
          bill={bill}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
