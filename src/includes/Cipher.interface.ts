export enum CipherState {
    IDLE,
    DOWNLOADING,
    BREAKING,
    SUCCESS,
    FAILURE,
    PAUSED,
};

export type CipherProps = {
    state: CipherState,
    progress: number,
};