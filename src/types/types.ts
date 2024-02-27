import WebSocket from "ws";

export type TUser = {
  name: string;
  password?: string;
  wins?: number;
};

export type TActiveUser = {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
};

export type TUserInRoom = {
  name: string;
  index: number;
};

export type TRoom = {
  roomId: number;
  roomUsers: TUserInRoom[];
};

export type TShip = {
  position: {
    x: number;
    y: number;
  };
  direction: boolean;
  length: number;
  type: EShipType;
  isDestroyed?: boolean;
  damagedCells?: {
    x: number;
    y: number;
  }[];
};

export type TUserShipsSetup = {
  gameId: number;
  ships: TShip[];
  indexPlayer: number;
};

export type TGame = {
  idGame: number;
  idPlayer: number;
  gameData?: TUserShipsSetup[];
};

export type TTurn = {
  currentPlayer: number;
};

export type TAttackClient = {
  gameId: number;
  x?: number;
  y?: number;
  indexPlayer: number;
};

export type TAttackServer = {
  position: {
    x: number;
    y: number;
  };
  currentPlayer: number;
  status: EAttackStatus;
};

export type TCoords = {
  x: number;
  y: number;
};

export type TFinishObj = { winPlayer: number };

export enum EServerOperations {
  REG = "reg",
  UPDATE_WINNERS = "update_winners",
  UPDATE_ROOM = "update_room",
  CREATE_GAME = "create_game",
  START_GAME = "start_game",
  TURN = "turn",
  ATTACK = "attack",
  FINISH = "finish",
}

export enum EClientOperations {
  REG = "reg",
  CREATE_ROOM = "create_room",
  ADD_TO_ROOM = "add_user_to_room",
  ADD_SHIPS = "add_ships",
  ATTACK = "attack",
  RANDOM_ATTACK = "randomAttack",
  SINGLE_PLAY = "single_play",
}

export enum EAttackStatus {
  MISS = "miss",
  SHOT = "shot",
  KILLED = "killed",
  NONE = "none",
}

export enum EShipType {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  HUGE = "huge",
}

export interface WebSocketWithID extends WebSocket {
  id: number;
}
