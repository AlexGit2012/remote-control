import WebSocket from 'ws';
import robot from 'robotjs';

export const drawHandler = (
    command: string,
    wsConnection: WebSocket,
    firstValue: string,
    secondValue: string,
    duplexWsStream: any
) => {
    const { x, y }: { x: number; y: number } = robot.getMousePos();
    const messageForClient = 'draw_' + command;
    switch (command) {
        case 'left': {
            robot.moveMouse(x - +firstValue, y);
            break;
        }
        default: {
            console.log('Incorrect command (draw entity)');
            break;
        }
    }
    duplexWsStream.write(messageForClient, (error: Error) => {
        if (error) {
            console.log(error);
        }
    });
};
