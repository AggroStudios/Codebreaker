import GameController from '../lib/GameController';

export default interface Process {
    id: string,
    callback: Function,
}

export type GameStoreType = {
    game: null | GameController,
    frame: number,
    count: number,
    exponent: number,
    isRunning: Boolean,
    callback: (frame: number, count: number, exponent: number) => void,
    toggleGameLoop: () => void,
};
