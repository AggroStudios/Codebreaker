import { create } from 'zustand';
import { isNil } from 'lodash';

export type TerminalLine = {
    prompt: string;
    value: string;
    error?: boolean;
    start?: number;
    end?: number;
};

export interface TerminalState {
    terminalLines: TerminalLine[];
    updateLine: (line: TerminalLine, index?: number) => void;
    appendLine: (value: string, index?: number) => void;
    replaceCharsForRange: (line: TerminalLine, index?: number) => void;
    addLine: (line: TerminalLine) => void;
    clearTerminal: () => void;
}

export const useTerminalStore = create<TerminalState>((set) => ({
    terminalLines: [],
    updateLine: (line, index = -1) =>
        set((state) => {
            const idx = index > -1 ? index : state.terminalLines.length - 1;
            return {
                terminalLines: [
                    ...state.terminalLines.slice(0, idx),
                    line,
                    ...state.terminalLines.slice(idx + 1),
                ],
            };
        }),
    appendLine: (value, index = -1) =>
        set((state) => {
            const idx = index > -1 ? index : state.terminalLines.length - 1;
            return {
                terminalLines: [
                    ...state.terminalLines.slice(0, idx),
                    {
                        ...state.terminalLines[idx],
                        value: state.terminalLines[idx].value + value,
                    },
                    ...state.terminalLines.slice(idx + 1),
                ],
            };
        }),
    replaceCharsForRange: (line, index = -1) =>
        set((state) => {
            const idx = index > -1 ? index : state.terminalLines.length - 1;
            const lineValue = state.terminalLines[idx].value;
            let start = line.start;
            let end = line.end;
            if (isNil(start)) start = 0;
            if (isNil(end)) end = lineValue.length;

            if (start < 0) {
                start = lineValue.length + start;
            }

            return {
                terminalLines: [
                    ...state.terminalLines.slice(0, idx),
                    {
                        prompt: line.prompt,
                        error: line.error,
                        value:
                            lineValue.slice(0, start) +
                            line.value +
                            lineValue.slice(end),
                    },
                    ...state.terminalLines.slice(idx + 1),
                ],
            };
        }),
    addLine: (terminalLine) =>
        set((state) => ({
            terminalLines: [...state.terminalLines, terminalLine],
        })),
    clearTerminal: () =>
        set(() => ({
            terminalLines: [],
        })),
}));
