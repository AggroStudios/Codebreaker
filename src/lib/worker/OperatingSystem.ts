export enum OperatingSystemWorkerMessageType {
    START_GAME_LOOP = 'startGameLoop',
    STOP_GAME_LOOP = 'stopGameLoop',
    UPDATE_GAME_LOOP = 'updateGameLoop',
    SET_EXPONENT = 'setExponent',
}

export interface OperatingSystemWorkerMessage {
    type: OperatingSystemWorkerMessageType;
    data?: unknown;
}

export type OSUpdateGameLoopData = {
    frame: number;
    count: number;
    exponent: number;
}

export type OSSetExponentData = {
    exponent: number;
}

const FPS = 60;

let interval: null | NodeJS.Timeout = null;
let currentFrame: number = 0;
let currentCount: number = 0;
let currentExponent: number = 1;

onmessage = (event: MessageEvent<OperatingSystemWorkerMessage>) => {
    
    const { type, data } = event.data;

    const startGameLoop = () => {
        interval = setInterval(() => update(), 1000 / FPS);
        postMessage({
            type: OperatingSystemWorkerMessageType.START_GAME_LOOP,
            data: true
        });
    };

    const stopGameLoop = () => {
        clearInterval(interval);
        interval = null;
        postMessage({
            type: OperatingSystemWorkerMessageType.STOP_GAME_LOOP,
            data: false
        });
    };

    const update = () => {
        currentFrame += 0.001;
        if (currentFrame > 0.6) {
            currentFrame = 0;
            currentCount++;
        }

        postMessage({
            type: OperatingSystemWorkerMessageType.UPDATE_GAME_LOOP,
            data: {
                frame: currentFrame,
                count: currentCount,
                exponent: currentExponent,
            },
        });
    }

    switch (type) {
        case OperatingSystemWorkerMessageType.START_GAME_LOOP:
            startGameLoop();
            break;
        case OperatingSystemWorkerMessageType.STOP_GAME_LOOP:
            stopGameLoop();
            break;
        case OperatingSystemWorkerMessageType.SET_EXPONENT:
            currentExponent = (data as OSSetExponentData).exponent;
            break;
    }
};
