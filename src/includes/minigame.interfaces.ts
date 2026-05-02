export interface MiniGameProps {
    rounds?: number;
    onWin: () => void;
    onLose: () => void;
    onProgress: (progress: number) => void;
  }