import RoomCard from "./RoomCard";

interface RoomCardListProps {
  rooms: any[];
  dormitoryId: number;
  onEditRoom: (room: any, dormId: number) => void;
  onAddRoom?: () => void;
}

export default function RoomCardList({
  rooms,
  dormitoryId,
  onEditRoom,
}: RoomCardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onEditRoom={(r) => onEditRoom(r, dormitoryId)}
        />
      ))}
    </div>
  );
}
