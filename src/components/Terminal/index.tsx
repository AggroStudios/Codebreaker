import { Component, createEffect, createSignal } from "solid-js";
import { ThemeProvider, createTheme } from "@suid/material";
import GameController from "../../lib/GameController";
import TerminalController from '../../lib/terminal';
import create from 'solid-zustand';
import clsx from 'clsx';

import { 
    compact,
    isEmpty,
    isNil,
} from "lodash";

import {
    Header,
    Content,
} from './components';

import './styles.scss';

type TerminalLine = {
    prompt: string;
    value: string;
    error?: any;
    start?: number;
    end?: number;
}

interface TerminalState {
    terminalLines: TerminalLine[];
    updateLine: (line: TerminalLine, index?: number) => void;
    appendLine: (value: string, index?: number) => void;
    replaceCharsForRange: (line: TerminalLine, index?: number) => void;
    addLine: (line: TerminalLine) => void;
    clearTerminal: () => void;
}

const useStore = create<TerminalState>(set => ({
    terminalLines: [],
    updateLine: (line, index = -1) => set(state => {
        index = index > -1 ? index : state.terminalLines.length - 1;
        return {
            terminalLines: compact([
                ...state.terminalLines.slice(0, index),
                line,
                ...state.terminalLines.slice(index + 1),
            ])
        }
    }),
    appendLine: (value, index = -1) => set(state => {
        index = index > -1 ? index : state.terminalLines.length - 1;
        return {
            terminalLines: compact([
                ...state.terminalLines.slice(0, index),
                {
                    ...state.terminalLines[index],
                    value: state.terminalLines[index].value + value
                },
                ...state.terminalLines.slice(index + 1),
            ])
        }
    }),
    replaceCharsForRange: (line, index = -1) => set(state => {
        index = index > -1 ? index : state.terminalLines.length - 1;
        const lineValue = state.terminalLines[index].value;
        if (isNil(line.start)) line.start = 0;
        if (isNil(line.end)) line.end = lineValue.length;

        if (line.start < 0) {
            line.start = lineValue.length + line.start;
        }

        return {
            terminalLines: compact([
                ...state.terminalLines.slice(0, index),
                {
                    prompt: line.prompt,
                    error: line.error,
                    value: lineValue.slice(0, line.start) + line.value + lineValue.slice(line.end)
                },
                ...state.terminalLines.slice(index + 1)
            ])
        };
    }),
    addLine: terminalLine => set(state => ({
        terminalLines: compact([
            ...state.terminalLines,
            terminalLine
        ])
    })),
    clearTerminal: () => set(() => ({
        terminalLines: []
    }))
}));

const Terminal: Component<{ terminalController: TerminalController, gameController?: GameController }> = props => {

    const {
        terminalLines,
        addLine,
        updateLine,
        appendLine,
        replaceCharsForRange,
        clearTerminal,
    } = useStore();

    const { terminalController } = props;

    const [previousCommandIndex, setPreviousCommandIndex] = createSignal(-1);
    const [cursorPosition, setCursorPosition] = createSignal(0);
    const [cursorOffset, setCursorOffset] = createSignal(0);
    const [focus, setFocus] = createSignal(false);
    const [commandLoaded, setCommandLoaded] = createSignal(true);
    const [stdInCallback, setStdInCallback] = createSignal(null);
    const [stdInCharacterMode, setStdInCharacterMode] = createSignal(false);
    const [terminalLoaded, setTerminalLoaded] = createSignal(false);


    let codeRef: HTMLElement;
    let inputRef: HTMLInputElement;

    const terminalOutput = (data: any, stream: string, {
        prompt = '',
        lineIndex = -1,
        characterMode = false,
        updateMode = false,
        caretAtEnd = true,
        color = null,
        replaceRange = [],
    } = {}) => {

        const error = stream === 'stderr';

        if (!caretAtEnd) {
            setCursorOffset(data.length);
        }

        if (color) {
            data = `^[${color};${data}^]`;
        }

        if (characterMode) {
            appendLine(data, lineIndex);
        }
        else if (replaceRange.length > 0) {
            const [start, end] = replaceRange;
            replaceCharsForRange({prompt, value: data, error, start, end}, lineIndex);
        }
        else {
            if (updateMode) {
                updateLine({ prompt, value: data, error }, lineIndex);
            }
            else {
                addLine({ prompt, value: data, error });
            }
        }
    };

    const handleStdIn = (callback: Function, { characterMode = false } = {}) => {
        setStdInCharacterMode(characterMode);
        setStdInCallback(() => callback);
    }

    const handleStdOut = (data: string, options: any) => {
        terminalOutput(data, 'stdout', options);
    };

    const handleStdErr = (data: any, options: any) => {
        terminalOutput(data, 'stderr', { ...options, prompt: '\u2718 ' });
    };

    terminalController.attachTerminal({
        stdin: handleStdIn,
        stdout: handleStdOut,
        stderr: handleStdErr,
    });

    createEffect(() => {
        if (terminalLines.length === 0 && !terminalLoaded()) {
            terminalController.initialize();
            setTerminalLoaded(true);
            newLine();
        }
    }, [terminalController, terminalLines, terminalLoaded()]);

    createEffect(() => {
        inputRef.focus();
        window.onkeydown = (e: KeyboardEvent) => {
            // Catching Ctrl + E and Ctrl + L
            if (e.ctrlKey) {
                switch (e.key) {
                    case 'l':
                    case 'e':
                        e.preventDefault();
                        break;
                    default:
                        break;
                }
            }
        }

        return () => {
            window.onkeydown = null;
        }
    }, []);

    const newLine = () => {
        addLine({ prompt: terminalController.prompt, value: '' });
        setCursorPosition(0);
        setCursorOffset(0);
    };
    
    // Window scrolling to the bottom
    createEffect(() => {
        codeRef.scrollTop = codeRef.scrollHeight - codeRef.clientHeight;
        if (isEmpty(terminalLines)) {
            newLine();
        }
    }, [terminalLines, codeRef, newLine]);

    createEffect(() => {
        if (commandLoaded()) {
            inputRef.value = '';
        }
    }, [commandLoaded()]);

    const terminalFunctions = {
        clear: () => {
            clearTerminal();
        },
        reboot: () => {
            setTerminalLoaded(false);
            clearTerminal();
        }
    };

    //#region Terminal input handling
    const handleKeyUp = async (event: KeyboardEvent) => {
        const target = event.currentTarget as HTMLInputElement;
        if (!commandLoaded() && !stdInCallback()) return;

        switch (event.key) {
            case 'a': 
                if (event.ctrlKey) {
                    event.preventDefault();
                    target.selectionStart = target.selectionEnd = 0;
                    setCursorPosition(0);
                }
                break;
            case 'e': 
                if (event.ctrlKey) {
                    event.preventDefault();
                    target.selectionStart = target.selectionEnd = target.value.length;
                    setCursorPosition(target.value.length);
                }
                break;
            case 'c':
                if (event.ctrlKey) {
                    event.preventDefault();
                    setPreviousCommandIndex(-1);
                    if (stdInCallback()) {
                        stdInCallback()('^C');
                    }
                    else {
                        updateLine({ prompt: terminalController.prompt, value: `${target.value}^C`});
                        newLine();
                    }
                    target.value = '';
                }
                break;
            case 'l':
                if (event.ctrlKey) {
                    terminalFunctions.clear();
                }
                break;
            case 'Enter':
                setPreviousCommandIndex(-1);
                if (stdInCallback()) {
                    stdInCallback()('\n');
                    target.value = '';
                }
                else {
                    // addLine({ prompt, value: event.currentTarget.value });
                    if (target.value.trim() !== '') {
                        setCommandLoaded(false);
                        const command = target.value;
                        target.value = '';
                        const commandReturn: { command?: string, value?: string } = await terminalController.command(command) || { value: '' };
                        setCommandLoaded(true);
                        if (commandReturn.command) {
                            if (terminalFunctions[commandReturn.command]) {
                                terminalFunctions[commandReturn.command]();
                            }
                        }
                        else {
                            newLine();
                        }
                        target.value = '';
                    }
                    else {
                        target.value = '';
                        newLine();
                    }
                }
                break;

            case 'ArrowLeft':
                if (cursorPosition() > 0) {
                    setCursorPosition(cursorPosition() - 1);
                }
                break;
            case 'ArrowRight':
                if (cursorPosition() < target.value.length) {
                    setCursorPosition(cursorPosition() + 1);
                }
                break;

            case 'ArrowUp':
                if (event.shiftKey || event.ctrlKey) {
                    event.preventDefault();
                }
                if (previousCommandIndex() < terminalController.history.length) {
                    const nextIndex = previousCommandIndex() + 1;
                    if (nextIndex < terminalController.history.length) {
                        const value = terminalController.history[nextIndex].command;
                        target.value = value;
                        updateLine({ prompt: terminalController.prompt, value });
                        setCursorPosition(value.length);
                        setPreviousCommandIndex(nextIndex);
                    }
                }
                break;

            case 'ArrowDown':
                if (event.shiftKey || event.ctrlKey) {
                    event.preventDefault();
                }
                if (previousCommandIndex() > -1) {
                    const nextIndex = previousCommandIndex() - 1;
                    let value = '';
                    if (nextIndex >= 0) {
                        value = terminalController.history[nextIndex].command;
                    }
                    target.value = value;
                    setCursorPosition(value.length);
                    updateLine({ prompt: terminalController.prompt, value });
                    setPreviousCommandIndex(nextIndex);
                }
                break;

            default:
                break;
        }
    }

    const handleChange = (event: InputEvent) => {
        const target = event.currentTarget as HTMLInputElement;
        if (stdInCallback()) {
            stdInCallback()(target.value);
            if (stdInCharacterMode()) {
                target.value = '';
            }
        }
        else {
            if (target.selectionStart !== target.selectionEnd) {
                target.selectionStart = target.selectionEnd;
            }
            setCursorPosition(target.selectionStart);
    
            if (commandLoaded()) {
                updateLine({ prompt: terminalController.prompt, value: target.value });
            }
            else {
                target.value = '';
            }
        }
    }

    const handleCodeSelect = () => {
        if (document.getSelection().toString() === '') {
            inputRef.focus();
        };
    }
    //#endregion

    const displayPrompt = (prompt: string, error = false) => <span class={clsx(error ? 'error' : 'prompt')}>{prompt}</span>;

    const displayLine = (line: any) => {
        const colorRegex = /\^\[(.*?);(.*?)\^\]/g;
        const matches = [...line.matchAll(colorRegex)];
        if (isEmpty(matches)) {
            return <span>{line}</span>;
        }
        else {
            const returnElements = [];
            let remainder = line;
            matches.forEach(match => {
                const [ original, color, text ] = match;
                const split = remainder.split(original, 2);
                if (!isEmpty(split[0])) {
                    returnElements.push({ text: split[0] });
                }
                returnElements.push({ color, text })
                remainder = split[1];
            });
            if (!isEmpty(remainder)) {
                returnElements.push({ text: remainder });
            }

            return returnElements.map(element => {
                if (element.color) {
                    return <span style={{ color: element.color }}>{element.text}</span>
                }
                else {
                    return <span>{element.text}</span>
                }
            });
        }
    };
    
    const displayLineWithCursor = (line: any) => {
        return (
            <span>
                {line.slice(0, (cursorPosition() + cursorOffset()))}
                <span class={clsx('cursor', (focus() && commandLoaded()) ? 'active' : '')}>
                    {line[cursorPosition() + cursorOffset()] || '\u00a0'}
                </span>
                {line.slice(cursorPosition() + cursorOffset() + 1)}
            </span>
        );
    };

    return (
        <ThemeProvider theme={createTheme()}>
            <div class="root">
                <div class="container">
                    <Header>Terminal</Header>
                    <div class="screen">
                        <input ref={el => inputRef=el} class="input" onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} onKeyUp={handleKeyUp} onInput={handleChange} />
                        <Content ref={el => codeRef=el} onMouseUp={handleCodeSelect} tabIndex={-1} onKeyUp={() => inputRef.focus()}>
                            {terminalLines.map((line: TerminalLine, index: number) => 
                                <div>
                                    <span class={clsx(line.error ? 'commandError' : '')}>
                                        {line.prompt && displayPrompt(line.prompt, line.error)}
                                        {
                                            (index < terminalLines.length - 1)
                                                ? displayLine(line.value)
                                                : displayLineWithCursor(line.value)
                                        }
                                    </span>
                                </div>
                            )}
                        </Content>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}

export default Terminal;