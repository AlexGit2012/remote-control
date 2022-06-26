import robot from 'robotjs';
export const mouseHandler = async (command, wsConnection, firstValue, duplexWsStream) => {
    const { x, y } = await robot.getMousePos();
    let messageForClient = 'mouse_' + command;
    switch (command) {
        case 'left': {
            robot.moveMouse(x - +firstValue, y);
            break;
        }
        case 'right': {
            robot.moveMouse(x + +firstValue, y);
            break;
        }
        case 'up': {
            robot.moveMouse(x, y - +firstValue);
            break;
        }
        case 'down': {
            robot.moveMouse(x, y + +firstValue);
            break;
        }
        case 'position': {
            messageForClient = `mouse_position ${x},${y}`;
            break;
        }
        default: {
            console.log('Incorrect command (mouse entity)');
            break;
        }
    }
    duplexWsStream.write(messageForClient, (error) => {
        if (error) {
            console.log(error);
        }
    });
};
