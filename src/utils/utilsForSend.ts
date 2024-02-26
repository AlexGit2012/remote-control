import { findUserDataByUserId } from "../database/games";
import { getRooms } from "../database/rooms";
import { getUserIndex, getUsers } from "../database/users";
import {
  EAttackStatus,
  EClientOperations,
  EServerOperations,
  TActiveUser,
  TAttackClient,
  TFinishObj,
  TGame,
  TRoom,
  TTurn,
  TUser,
  TUserShipsSetup,
} from "../types/types";
import { cloneObj } from "./utils";

export const createObjForSend = (
  type: EServerOperations | EClientOperations,
  data:
    | TActiveUser
    | TRoom[]
    | TUser[]
    | TGame
    | Partial<TUserShipsSetup>
    | TTurn
    | TFinishObj
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
  const objForSend = createObjForSend(
    EServerOperations.UPDATE_WINNERS,
    dataForSend
  );
  return objForSend;
};

export const createNewGameObj = (gameId: number, userId: number) => {
  const dataForSend: TGame = {
    idGame: gameId,
    idPlayer: userId,
  };
  const objForSend = createObjForSend(
    EServerOperations.CREATE_GAME,
    dataForSend
  );
  return objForSend;
};

export const createStartGameObj = (userId: number) => {
  const userGameData = findUserDataByUserId(userId);
  const dataForSend = {
    ships: userGameData?.ships,
    currentPlayerIndex: userId,
  };
  const objForSend = createObjForSend(
    EServerOperations.START_GAME,
    dataForSend
  );
  return objForSend;
};

export const createGameTurnObj = (userId: number) => {
  const dataForSend = {
    currentPlayer: userId,
  };
  const objForSend = createObjForSend(EServerOperations.TURN, dataForSend);
  return objForSend;
};

export const createAttackObj = (
  attackData: TAttackClient,
  status: EAttackStatus,
  userId: number
) => {
  const dataForSend = {
    position: {
      x: attackData.x,
      y: attackData.y,
    },
    currentPlayer: userId,
    status,
  };

  const objForSend = createObjForSend(EServerOperations.ATTACK, dataForSend);
  return objForSend;
};

export const createFinishObj = (winPlayer: number) => {
  const dataForSend = {
    winPlayer,
  };

  const objForSend = createObjForSend(EServerOperations.FINISH, dataForSend);
  return objForSend;
};
