import { WebSocketServer } from "ws";
import { createUpdateRoomObj, createUpdateWinnersObj } from "./utilsForSend";

const wssUtilsCreator = (wss: WebSocketServer) => {
  const sendEachClient = (objForSend) => {
    wss.clients.forEach((ws) => ws.send(objForSend));
  };
  const updateRoom = () => {
    sendEachClient(createUpdateRoomObj());
  };
  const updateWinners = () => {
    sendEachClient(createUpdateWinnersObj());
  };
  return { sendEachClient, updateRoom, updateWinners };
};

export default wssUtilsCreator;
