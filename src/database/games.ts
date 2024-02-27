import { TGame } from "../types/types";
import { getRooms } from "./rooms";

let games: TGame[] = [];

export const getGames = (): TGame[] => games;

export const addGame = (userId: number) => {
  const gameId = getGames().length;
  games.push({
    idGame: gameId,
    idPlayer: userId,
    gameData: [],
  } as TGame);
  return gameId;
};

export const findGameByUserId = (userId: number): TGame => {
  const rooms = getRooms();
  const room = rooms.find((room) =>
    room.roomUsers.some((user) => user.index === userId)
  );
  const userIds = room?.roomUsers.map((user) => user.index);
  const games = getGames();
  const game = games.find((game) => {
    return userIds?.includes(game.idPlayer);
  });
  return game || ({} as TGame);
};

export const findGameById = (gameId: number): TGame | undefined => {
  return games.find(({ idGame }) => idGame === gameId);
};

export const findUserDataByUserId = (userId: number) => {
  return findGameByUserId(userId)?.gameData?.find(
    ({ indexPlayer }) => indexPlayer === userId
  );
};

export const getOpponentId = (userId: number) => {
  const game = findGameByUserId(userId);
  return game.gameData?.find((data) => data.indexPlayer !== userId)
    ?.indexPlayer;
};

export const closeGame = (gameId: number) => {
  const game = findGameById(gameId) || ({} as TGame);
  game.idPlayer = -1;
  game.gameData = [];
};
