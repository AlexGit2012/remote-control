import { TRoom } from "../types/types";
import { getUsers } from "./users";

let rooms: TRoom[] = [];

export const getRooms = (): TRoom[] => rooms;

export const createRoom = () => {
  const roomId = rooms.length;
  rooms.push({
    roomId,
    roomUsers: [],
  });
  return roomId;
};

export const addUserToRoom = (roomID: number, wsID: number) => {
  const room = rooms[roomID];
  if (room.roomUsers.some((user) => user.name === getUsers()[wsID].name)) {
  } else room.roomUsers.push({ name: getUsers()[wsID].name, index: wsID });
};

export const getRoomByUserId = (userId: number): TRoom => {
  const rooms = getRooms();
  const room = rooms.find((room) =>
    room.roomUsers.some((user) => user.index === userId)
  );
  return room || ({} as TRoom);
};

export const closeRoom = (roomId: number) => {
  const rooms = getRooms();
  rooms[roomId].roomUsers = [
    { name: "", index: -1 },
    { name: "", index: -1 },
  ];
};
