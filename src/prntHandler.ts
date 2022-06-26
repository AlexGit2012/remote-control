import WebSocket from 'ws';
import robot from 'robotjs';
import Jimp from 'jimp';

export const prntHandler = async (
    command: string,
    wsConnection: WebSocket,
    duplexWsStream: any
) => {
    const { x, y }: { x: number; y: number } = await robot.getMousePos();
    const offsetX = x - 100;
    const offsetY = y - 100;
    const imageWidth = 200;
    const imageHeight = 200;
    let messageForClient = 'prnt_' + command;
    switch (command) {
        case 'scrn': {
            const screenShot = robot.screen.capture(offsetX, offsetY, imageWidth, imageHeight);
            const imageJimp = new Jimp(imageWidth, imageHeight);
            // Next lines set correct pixel color from screenshot to jimp image
            let pos = 0;
            imageJimp.scan(0, 0, imageJimp.bitmap.width, imageJimp.bitmap.height, (x, y, idx) => {
                imageJimp.bitmap.data[idx + 2] = screenShot.image.readUInt8(pos++);
                imageJimp.bitmap.data[idx + 1] = screenShot.image.readUInt8(pos++);
                imageJimp.bitmap.data[idx + 0] = screenShot.image.readUInt8(pos++);
                imageJimp.bitmap.data[idx + 3] = screenShot.image.readUInt8(pos++);
            });
            // Create string to transfer
            const image64 = await imageJimp.getBase64Async(Jimp.MIME_BMP);
            messageForClient += ' ' + image64.split(',')[1];
            break;
        }
        default: {
            console.log('Incorrect command (prnt entity)');
            break;
        }
    }
    await duplexWsStream.write(messageForClient + '\0', (error: Error) => {
        if (error) {
            console.log(error);
        }
    });
};
