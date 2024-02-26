import { findGameById, findGameByUserId } from "../database/games";
import {
  EAttackStatus,
  TAttackClient,
  TCoords,
  TGame,
  TShip,
  TUserShipsSetup,
} from "../types/types";

export const addShips = (shipsData: TUserShipsSetup) => {
  const { indexPlayer } = shipsData;
  const game = findGameByUserId(indexPlayer);
  game?.gameData?.push(shipsData);
};

export const attackResult = (attackData: Required<TAttackClient>) => {
  // Remove required when x and y for random attack will be added
  let status: EAttackStatus;
  let cellAroundShip: TCoords[] = [];
  let shipCells: TCoords[] = [];
  const { x, y, indexPlayer } = attackData;
  const ship = getPlayerShipInGame(attackData);

  if (ship) {
    const isCellDamaged = checkCellStatus(ship, x, y);
    if (!isCellDamaged) {
      addDamagedCells(ship, x, y);
    }
    status = EAttackStatus.SHOT;
    if (ship.damagedCells?.length === ship.length) {
      status = EAttackStatus.KILLED;
      ship.isDestroyed = true;
      cellAroundShip = getCellsAroundShip(ship);
      shipCells = getShipCells(ship);
    }
  } else status = EAttackStatus.MISS;
  const isGameFinished = checkIfAllShipsDestroyed(indexPlayer);
  return { status, cellAroundShip, shipCells, isGameFinished };
};

export const checkCellStatus = (ship: TShip, x: number, y: number) => {
  return !!ship.damagedCells?.find((cell) => cell.x === x && cell.y === y);
};

export const addDamagedCells = (ship: TShip, x: number, y: number) => {
  ship.damagedCells
    ? ship.damagedCells.push({ x, y })
    : (ship.damagedCells = [{ x, y }]);
};

export const checkIsPlayerHitShip = (ship: TShip, x: number, y: number) => {
  const isCordXMatch =
    x >= ship.position.x &&
    x <= ship.position.x + (ship.direction ? 0 : ship.length - 1);
  const isCordYMatch =
    y >= ship.position.y &&
    y <= ship.position.y + (ship.direction ? ship.length - 1 : 0);
  return isCordXMatch && isCordYMatch;
};

export const getUserIdsInGame = (game: TGame) =>
  game?.gameData?.map((data) => data.indexPlayer) || [];

export const getPlayerShipInGame = (attackData: Required<TAttackClient>) => {
  const { gameId, indexPlayer, x, y } = attackData;
  const game = findGameById(gameId);
  const attackedPlayerGameData = game?.gameData?.find(
    (data) => data.indexPlayer !== indexPlayer
  );
  const ship = attackedPlayerGameData?.ships.find((ship) => {
    const isPlayerHitShip = checkIsPlayerHitShip(ship, x, y);
    return isPlayerHitShip;
  });
  return ship;
};

export const getCellsAroundShip = (ship: TShip) => {
  const {
    position: { x, y },
    direction,
    length,
  } = ship;

  let cells: TCoords[] = [];

  for (let i = 0; i < length; i++) {
    const cellX = x + (direction ? 0 : i);
    const cellY = y + (direction ? i : 0);

    cells.push({
      x: cellX + (direction ? 1 : 0),
      y: cellY + (direction ? 0 : 1),
    });

    cells.push({
      x: cellX - (direction ? 1 : 0),
      y: cellY - (direction ? 0 : 1),
    });

    if (i === 0) {
      for (let m = -1; m <= 1; m++) {
        cells.push({
          x: cellX + (direction ? m : -1),
          y: cellY + (direction ? -1 : m),
        });
      }
    }

    if (i === length - 1) {
      for (let m = -1; m <= 1; m++) {
        cells.push({
          x: cellX + (direction ? m : 1),
          y: cellY + (direction ? 1 : m),
        });
      }
    }
  }

  cells = cells.filter(
    (cell) => cell.x >= 0 && cell.x <= 9 && cell.y >= 0 && cell.y <= 9
  );

  return cells;
};

export const getShipCells = (ship: TShip) => {
  let cells: TCoords[] = [];
  const { length, position, direction } = ship;
  for (let i = 0; i < length; i++) {
    cells.push({
      x: position.x + (direction ? 0 : i),
      y: position.y + (direction ? i : 0),
    });
  }
  return cells;
};

export const checkIfAllShipsDestroyed = (userId: number) => {
  const game = findGameByUserId(userId);
  const playerShips = game.gameData?.find(
    (data) => data.indexPlayer !== userId
  )?.ships;
  return playerShips?.every((ship) => ship.isDestroyed);
};
