import { getRooms } from "../database/rooms";
import { getUserIndex, getUsers } from "../database/users";
import {
  EClientOperations,
  EServerOperations,
  TActiveUser,
  TRoom,
  TUser,
} from "../types/types";
import { cloneObj } from "./utils";

export const createObjForSend = (
  type: EServerOperations | EClientOperations,
  data: TActiveUser | TRoom[] | TUser[]
) =>
  JSON.stringify({
    type,
    data: JSON.stringify(data),
    id: 0,
  });

export const createRegObj = (
  user: TUser,
  error: boolean = false,
  errorText: string = ""
) => {
  const { name } = user;
  const dataForSend: TActiveUser = {
    name: name,
    index: getUserIndex(user),
    error,
    errorText,
  };
  const objForSend = createObjForSend(EServerOperations.REG, dataForSend);
  return objForSend;
};

export const createUpdateRoomObj = () => {
  const dataForSend: TRoom[] = getRooms().filter(
    (room) => room.roomUsers.length < 2 // Filter only available room for the player
  );
  console.log("createUpdateRoomObj dataForSend", dataForSend);
  const objForSend = createObjForSend(
    EServerOperations.UPDATE_ROOM,
    dataForSend
  );
  return objForSend;
};

export const createUpdateWinnersObj = () => {
  const dataForSend: TUser[] = cloneObj(getUsers()).map((user: TUser) => {
    delete user.password;
    return user;
  });
  console.log("createUpdateWinnersObj dataForSend", dataForSend);
  const objForSend = createObjForSend(
    EServerOperations.UPDATE_WINNERS,
    dataForSend
  );
  return objForSend;
};
