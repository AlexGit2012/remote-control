import { WebSocketServer } from "ws";
import {
  createAttackObj,
  createFinishObj,
  createGameTurnObj,
  createNewGameObj,
  createStartGameObj,
  createUpdateRoomObj,
  createUpdateWinnersObj,
} from "./utilsForSend";
import { closeRoom, getRoomByUserId, getRooms } from "../database/rooms";
import { EAttackStatus, TAttackClient, WebSocketWithID } from "../types/types";
import {
  addGame,
  closeGame,
  findGameById,
  findGameByUserId,
} from "../database/games";
import { getUserIdsInGame } from "./gameUtils";
import { updateUserWins } from "../database/users";

const wssUtilsCreator = (wss: WebSocketServer) => {
  const sendEachClient = (objForSend) => {
    wss.clients.forEach((ws) => ws.send(objForSend));
  };

  const sendEachClientInRange = (objForSend, userIDs: number[]) => {
    wss.clients.forEach((ws) => {
      if (userIDs.includes((ws as WebSocketWithID).id)) {
        ws.send(objForSend);
      }
    });
  };

  const updateRoom = () => {
    sendEachClient(createUpdateRoomObj());
  };

  const updateWinners = () => {
    sendEachClient(createUpdateWinnersObj());
  };

  const createGame = (roomID: number, secondUserId: number) => {
    const gameId = addGame(secondUserId);
    const roomUsersIDs = getRooms()[roomID].roomUsers.map(({ index }) => index);
    wss.clients.forEach((ws) => {
      if (roomUsersIDs.includes((ws as WebSocketWithID).id)) {
        const newGameObj = createNewGameObj(gameId, (ws as WebSocketWithID).id);
        ws.send(newGameObj);
      }
    });
  };

  const startGame = (gameId: number) => {
    const game = findGameById(gameId);
    const userIDs = game?.gameData?.map(({ indexPlayer }) => indexPlayer);
    wss.clients.forEach((ws) => {
      const wsId = (ws as WebSocketWithID).id;
      if (userIDs?.includes(wsId)) {
        const startGameObj = createStartGameObj(wsId);
        ws.send(startGameObj);
      }
    });
  };

  const turn = (userId: number, isNextPlayer: boolean = false) => {
    // For now second player starts the game
    const game = findGameByUserId(userId);
    const userIDs = getUserIdsInGame(game);
    const nextPlayerId = userIDs.find((id) => id !== userId);
    const playerId = isNextPlayer ? nextPlayerId : userId;

    const turnObj = createGameTurnObj(playerId as number);
    sendEachClientInRange(turnObj, userIDs);
  };

  const attack = (
    attackData: TAttackClient,
    status: EAttackStatus,
    userId: number
  ) => {
    const game = findGameByUserId(userId);
    const userIDs = game?.gameData?.map((data) => data.indexPlayer) || [];
    const attackObj = createAttackObj(attackData, status, userId);
    sendEachClientInRange(attackObj, userIDs);
  };

  const finish = (userId: number, gameId: number) => {
    updateUserWins(userId);
    const game = findGameByUserId(userId);
    const userIDs = game?.gameData?.map((data) => data.indexPlayer) || [];
    wss.clients.forEach((ws) => {
      const wsId = (ws as WebSocketWithID).id;
      if (userIDs?.includes(wsId)) {
        const finishObj = createFinishObj(userId);
        ws.send(finishObj);
      }
    });
    const { roomId } = getRoomByUserId(userId);
    closeRoom(roomId);
    closeGame(gameId);
  };

  return {
    sendEachClient,
    updateRoom,
    updateWinners,
    createGame,
    startGame,
    turn,
    attack,
    finish,
  };
};

export default wssUtilsCreator;
