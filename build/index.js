import { httpServer } from './src/http_server/index.js';
import { createWebSocketStream, WebSocketServer } from 'ws';
import { mouseHandler } from './src/mouseHandler.js';
import { drawHandler } from './src/drawHandler.js';
import { prntHandler } from './src/prntHandler.js';
const wss = new WebSocketServer({
    port: 8080,
});
const wssCloseConnection = () => {
    process.stdout.write('Closing websocket...\n');
    wss.close();
    process.exit();
};
process.on('SIGINT', wssCloseConnection);
process.on('SIGKILL', wssCloseConnection);
const HTTP_PORT = 3000;
console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
wss.on('connection', (wsConnection) => {
    console.log(`Socket works, connection with client`);
    const duplexWsStream = createWebSocketStream(wsConnection, {
        encoding: 'utf8',
        decodeStrings: false,
    });
    try {
        wsConnection.on('close', () => {
            console.log(`Connection closed`);
        });
        wsConnection.on('message', (data) => {
            console.log('received: %s', data);
            const dataArr = data.toString().split(' ');
            const operation = dataArr[0];
            const [entity, command] = operation.split('_');
            const firstValue = dataArr[1];
            const secondValue = dataArr[2];
            switch (entity) {
                case 'mouse': {
                    mouseHandler(command, wsConnection, firstValue, duplexWsStream);
                    break;
                }
                case 'draw': {
                    drawHandler(command, wsConnection, firstValue, secondValue, duplexWsStream);
                    break;
                }
                case 'prnt': {
                    prntHandler(command, wsConnection, duplexWsStream);
                    break;
                }
                default: {
                    console.log('Incorrect entity');
                    break;
                }
            }
        });
    }
    catch (error) {
        wsConnection.close();
    }
});
