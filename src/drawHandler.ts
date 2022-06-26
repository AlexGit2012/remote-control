import WebSocket from 'ws';
import robot from 'robotjs';

// Utils methods for draw
const drawRectangle = (x: number, y: number, width: number, height: number) => {
    robot.mouseToggle('down');
    for (let i = 0; i < width; i += 2) robot.dragMouse(x + i, y);
    for (let i = 0; i < height; i += 2) robot.dragMouse(x + width, y + i);
    for (let i = 0; i < width; i += 2) robot.dragMouse(x + width - i, y + height);
    for (let i = 0; i < height; i += 2) robot.dragMouse(x, y + height - i);
    robot.mouseToggle('up');
};

const drawCircle = (x: number, y: number, firstValue: string) => {
    const radius = +firstValue;
    robot.mouseToggle('down');
    for (let i = 0; i < 2 * Math.PI; i += 0.05) {
        const circleX = x - radius + radius * Math.cos(i);
        const circleY = y + radius * Math.sin(i);
        robot.dragMouse(circleX, circleY);
    }
    robot.mouseToggle('up');
};

//Main handler
export const drawHandler = async (
    command: string,
    wsConnection: WebSocket,
    firstValue: string,
    secondValue: string,
    duplexWsStream: any
) => {
    const { x, y }: { x: number; y: number } = await robot.getMousePos();
    const messageForClient = 'draw_' + command;
    const width = +firstValue;
    const height = +secondValue;
    switch (command) {
        case 'circle': {
            drawCircle(x, y, firstValue);
            break;
        }
        case 'rectangle': {
            drawRectangle(x, y, width, height);
            break;
        }
        case 'square': {
            drawRectangle(x, y, width, width);
            break;
        }
        default: {
            console.log('Incorrect command (draw entity)');
            break;
        }
    }
    duplexWsStream.write(messageForClient + '\0', (error: Error) => {
        if (error) {
            console.log(error);
        }
    });
};
