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

export enum EServerOperations {
  REG = "reg",
  UPDATE_WINNERS = "update_winners",
  UPDATE_ROOM = "update_room",
}

export enum EClientOperations {
  REG = "reg",
  CREATE_ROOM = "create_room",
  ADD_TO_ROOM = "add_user_to_room",
}

export interface WebSocketWithID extends WebSocket {
  id: number;
}
