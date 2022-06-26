import robot from 'robotjs';
export const drawHandler = (command, wsConnection, firstValue, secondValue, duplexWsStream) => {
    const { x, y } = robot.getMousePos();
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
    duplexWsStream.write(messageForClient, (error) => {
        if (error) {
            console.log(error);
        }
    });
};
