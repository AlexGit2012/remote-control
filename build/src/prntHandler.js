import robot from 'robotjs';
import Jimp from 'jimp';
export const prntHandler = async (command, wsConnection, duplexWsStream) => {
    const { x, y } = await robot.getMousePos();
    const offsetX = x - 100;
    const offsetY = y - 100;
    const imageWidth = 200;
    const imageHeight = 200;
    let messageForClient = 'prnt_' + command;
    switch (command) {
        case 'scrn': {
            const screenShot = robot.screen.capture(offsetX, offsetY, imageWidth, imageHeight);
            // const { image, width, height } = screenShot;
            const imageJimp = new Jimp(imageWidth, imageHeight);
            // Next lines set correct pixel color from screenshot to jimp image
            let pos = 0;
            imageJimp.scan(0, 0, imageJimp.bitmap.width, imageJimp.bitmap.height, (x, y, idx) => {
                imageJimp.bitmap.data[idx + 2] = screenShot.image.readUInt8(pos++);
                imageJimp.bitmap.data[idx + 1] = screenShot.image.readUInt8(pos++);
                imageJimp.bitmap.data[idx + 0] = screenShot.image.readUInt8(pos++);
                imageJimp.bitmap.data[idx + 3] = screenShot.image.readUInt8(pos++);
            });
            // Next lines set correct pixel color from screenshot to jimp image
            // for (let imageJimpX = 0; imageJimpX < imageWidth; imageJimpX++) {
            //     for (let imageJimpY = 0; imageJimpY < imageHeight; imageJimpY++) {
            //         const hex = screenShot.colorAt(imageJimpX, imageJimpY);
            //         const num = parseInt(hex + 'ff', 16);
            //         imageJimp.setPixelColor(num, imageJimpX, imageJimpY);
            //     }
            // }
            // Create string to transfer
            const image64 = await imageJimp.getBase64Async(Jimp.MIME_BMP);
            messageForClient += ' ' + image64.split(',')[1];
            // const imageJimp = new Jimp({ data: image, width, height });
            // const image64 = await imageJimp.getBase64Async(Jimp.MIME_BMP);
            // messageForClient += ' ' + image64.split(',')[1];
            break;
        }
        default: {
            console.log('Incorrect command (prnt entity)');
            break;
        }
    }
    await duplexWsStream.write(messageForClient + '\0', (error) => {
        if (error) {
            console.log(error);
        }
    });
};
