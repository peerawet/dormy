import DormCard from "./DormCard";

interface DormCardListProps {
  dorms: any[];
  onEditDorm: (dorm: any) => void;
  onAddRoom: (dormId: number) => void;
  onEditRoom: (room: any, dormId: number) => void;
}

export default function DormCardList({
  dorms,
  onEditDorm,
  onAddRoom,
  onEditRoom,
}: DormCardListProps) {
  return (
    <div className="space-y-14">
      {dorms.map((dorm) => (
        <DormCard
          key={dorm.id}
          dorm={dorm}
          onEditDorm={onEditDorm}
          onAddRoom={onAddRoom}
          onEditRoom={onEditRoom}
        />
      ))}
    </div>
  );
}
