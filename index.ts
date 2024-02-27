import { httpServer } from "./src/http_server/index";
import { WebSocketServer, WebSocket } from "ws";
import {
  cloneObj,
  isJsonString,
  randomIntFromInterval,
} from "./src/utils/utils";
import { auth } from "./src/utils/authUtils";
import { createRegObj } from "./src/utils/utilsForSend";
import { regErrors } from "./src/error/regErrors";
import { addUser, getUserIndex, getUsers } from "./src/database/users";
import {
  EAttackStatus,
  EClientOperations,
  EServerOperations,
  WebSocketWithID,
} from "./src/types/types";
import { addUserToRoom, createRoom, getRooms } from "./src/database/rooms";
import wssUtilsCreator from "./src/utils/wsUtils";
import { addShips, attackResult } from "./src/utils/gameUtils";
import { findGameById, getGames } from "./src/database/games";
import { botShipsTemplate } from "./src/utils/botUtils";

const wss = new WebSocketServer({
  port: 3000,
});

const {
  updateRoom,
  updateWinners,
  createGame,
  startGame,
  turn,
  attack,
  finish,
} = wssUtilsCreator(wss);

const wssCloseConnection = () => {
  process.stdout.write("Closing websocket...\n");
  wss.close();
  process.exit();
};

process.on("SIGINT", wssCloseConnection);
process.on("SIGTERM", wssCloseConnection);

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

wss.on("connection", (ws: WebSocketWithID) => {
  console.log(`Socket works, connection with client`);
  ws.on("message", (clientData: Buffer | string) => {
    const parsedClientObj = JSON.parse(clientData.toString());
    let { type, data } = parsedClientObj;
    if (isJsonString(data)) {
      data = JSON.parse(data);
    }

    switch (type) {
      case EClientOperations.REG:
        const user = cloneObj(data);
        const isAuthenticated = auth(user);
        let regObjForSend: string;
        if (isAuthenticated) {
          regObjForSend = createRegObj(user);
          const userId = getUserIndex(user);
          ws.id = userId;
        } else if (isAuthenticated === null) {
          addUser(user);
          regObjForSend = createRegObj(user);
        } else {
          regObjForSend = createRegObj(user, true, regErrors.authError);
        }
        ws.send(regObjForSend);
        ws.id = getUserIndex(user); // ws.id the same as user index in database
        updateRoom();
        updateWinners();
        break;
      case EClientOperations.CREATE_ROOM:
        const roomID = createRoom();
        addUserToRoom(roomID, ws.id);
        updateRoom();
        break;
      case EClientOperations.ADD_TO_ROOM:
        const { indexRoom } = cloneObj(data);
        addUserToRoom(indexRoom, ws.id);
        if (getRooms()[indexRoom].roomUsers.length === 2) {
          updateRoom();
          createGame(indexRoom, ws.id);
        }
        break;
      case EClientOperations.ADD_SHIPS:
        const userShipsInfo = cloneObj(data);
        addShips(userShipsInfo);
        const { gameId } = userShipsInfo;
        if (findGameById(gameId)?.gameData?.length === 2) {
          console.log("Game almost start");
          startGame(gameId);
          turn(ws.id);
        }
        break;
      // @ts-ignore
      // Skip this ts check due attack and random attack work very familiar
      case EClientOperations.RANDOM_ATTACK:
        data.x = randomIntFromInterval(0, 9);
        data.y = randomIntFromInterval(0, 9);
      case EClientOperations.ATTACK:
        const attackData = cloneObj(data);
        const { gameId: finishedGameId } = attackData;
        const { status, cellAroundShip, shipCells, isGameFinished } =
          attackResult(attackData);
        if (status) {
          attack(attackData, status, ws.id);
          if (status === EAttackStatus.MISS) {
            turn(ws.id, true);
          } else if (status === EAttackStatus.KILLED) {
            turn(ws.id);
            cellAroundShip.forEach((coords) => {
              const cellAroundAttackData = cloneObj(attackData);
              cellAroundAttackData.x = coords.x;
              cellAroundAttackData.y = coords.y;
              attack(cellAroundAttackData, EAttackStatus.MISS, ws.id);
            });
            shipCells.forEach((coords) => {
              const cellAroundAttackData = cloneObj(attackData);
              cellAroundAttackData.x = coords.x;
              cellAroundAttackData.y = coords.y;
              attack(cellAroundAttackData, EAttackStatus.KILLED, ws.id);
            });
          } else turn(ws.id);
          if (isGameFinished) {
            finish(ws.id, finishedGameId);
            updateWinners();
          }
        }
        break;
      case EClientOperations.SINGLE_PLAY: // Experimental
        const botWS = new WebSocket("ws://localhost:3000");
        const botId = getUsers().length;
        let botGameId;
        botWS.on("open", () => {
          console.log("Bot ws is open");
          botWS.send(
            JSON.stringify({
              type: "reg",
              data: JSON.stringify({
                name: "_Bot" + Math.floor(Math.random() * 1000),
                password: "12345",
              }),
              id: 0,
            })
          );

          botWS.on("message", (res) => {
            const { type, data } = JSON.parse(res.toString());
            switch (type) {
              case EServerOperations.REG:
                botWS.send(
                  JSON.stringify({
                    type: "create_room",
                    data: "",
                    id: 0,
                  })
                );

                setTimeout(() => {
                  const lastRoomId = getRooms().length - 1;
                  addUserToRoom(lastRoomId, ws.id);
                  if (getRooms()[lastRoomId].roomUsers.length === 2) {
                    updateRoom();
                    createGame(lastRoomId, ws.id);
                    botGameId = getGames().length - 1;
                  }
                  setTimeout(() => {
                    botWS.send(
                      JSON.stringify({
                        type: "add_ships",
                        data: JSON.stringify({
                          gameId: getGames().length - 1,
                          ships: botShipsTemplate.ships,
                          indexPlayer: botId,
                        }),
                        id: 0,
                      })
                    );
                  });
                }, 100);
                break;
              case EServerOperations.TURN:
                const { currentPlayer } = JSON.parse(data);
                if (currentPlayer === botId) {
                  botWS.send(
                    JSON.stringify({
                      type: "randomAttack",
                      data: JSON.stringify({
                        gameId: botGameId,
                        indexPlayer: botId,
                      }),
                      id: 0,
                    })
                  );
                }
                break;
            }
          });
        });
        break;
      default:
        break;
    }
  });
});
