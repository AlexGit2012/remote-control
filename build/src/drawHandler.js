import robot from 'robotjs';
// Utils methods for draw
const drawRectangle = (x, y, width, height) => {
    robot.mouseToggle('down');
    for (let i = 0; i < width; i += 2)
        robot.dragMouse(x + i, y);
    for (let i = 0; i < height; i += 2)
        robot.dragMouse(x + width, y + i);
    for (let i = 0; i < width; i += 2)
        robot.dragMouse(x + width - i, y + height);
    for (let i = 0; i < height; i += 2)
        robot.dragMouse(x, y + height - i);
    robot.mouseToggle('up');
};
const drawCircle = (x, y, firstValue) => {
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
export const drawHandler = async (command, wsConnection, firstValue, secondValue, duplexWsStream) => {
    const { x, y } = await robot.getMousePos();
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
    duplexWsStream.write(messageForClient, (error) => {
        if (error) {
            console.log(error);
        }
    });
};
