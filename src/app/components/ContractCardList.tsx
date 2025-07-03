import ContractCard from "./ContractCard";

interface ContractCardListProps {
  contracts: any[];
  onEdit: (contract: any) => void;
  onDelete: (contract: any) => void;
  onPreview: (id: number) => void;
  onReceipt: (id: number) => void;
}

export default function ContractCardList({
  contracts,
  onEdit,
  onDelete,
  onPreview,
  onReceipt,
}: ContractCardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contracts.map((c) => (
        <ContractCard
          key={c.id}
          contract={c}
          onEdit={onEdit}
          onDelete={onDelete}
          onPreview={onPreview}
          onReceipt={onReceipt}
        />
      ))}
    </div>
  );
}
