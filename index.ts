import { httpServer } from "./src/http_server/index";
import { WebSocketServer } from "ws";
import { cloneObj, isJsonString } from "./src/utils/utils";
import { auth } from "./src/utils/authUtils";
import { createRegObj } from "./src/utils/utilsForSend";
import { regErrors } from "./src/error/regErrors";
import { addUser, getUserIndex } from "./src/database/users";
import { getRooms } from "./src/database/rooms";
import { EClientOperations, WebSocketWithID } from "./src/types/types";

const wss = new WebSocketServer({
  port: 3000,
});

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
    console.log("clientData", clientData.toString());
    const parsedClientObj = JSON.parse(clientData.toString());
    let { type, data } = parsedClientObj;
    if (isJsonString(data)) {
      data = JSON.parse(data);
    }
    console.log("parsedClientObj", parsedClientObj);
    console.log("parsedClientData", data);

    switch (type) {
      case EClientOperations.REG:
        const user = cloneObj(data);
        const isAuthenticated = auth(user);
        let regObjForSend = {};
        if (isAuthenticated) {
          regObjForSend = createRegObj(user);
        } else if (isAuthenticated === null) {
          addUser(user);
          regObjForSend = createRegObj(user);
        } else {
          regObjForSend = createRegObj(user, true, regErrors.authError);
        }
        console.log("objForSend", JSON.stringify(regObjForSend));
        ws.send(JSON.stringify(regObjForSend));
        ws.id = getUserIndex(user); // ws.id the same as user index in database
        ws.send(
          JSON.stringify({
            type: "update_room",
            data: JSON.stringify(getRooms()),
            id: 0,
          })
        );
        break;
      default:
        break;
    }
    console.log("ws.id", ws.id);
  });
});
