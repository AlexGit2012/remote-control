import { TRoom } from "../types/types";
import { getUsers } from "./users";

let rooms: TRoom[] = [];

export const getRooms = (): TRoom[] => rooms;

export const createRoom = (id: number) => {
  const userName = getUsers()[id].name;
  rooms.push({
    roomId: rooms.length,
    roomUsers: [{ name: userName, index: id }],
  });
};

export const addUserToRoom = (roomID: number, wsID: number) => {
  const room = rooms[roomID];
  if (room.roomUsers.some((user) => user.name === getUsers()[wsID].name)) {
    console.log("Can't add because user already in the room");
  } else room.roomUsers.push({ name: getUsers()[wsID].name, index: wsID });
};

export const updateRoom = () => {};
