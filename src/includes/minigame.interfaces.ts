export interface MiniGameProps {
    rounds?: number;
    chances?: number;
    onWin: () => void;
    onLose: () => void;
    onProgress: (progress: number) => void;
}