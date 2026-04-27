import {
    useEffect,
    useRef,
    useState,
    type KeyboardEvent as ReactKeyboardEvent,
    type FormEvent,
} from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import clsx from 'clsx';
import { isEmpty } from 'lodash';

import OperatingSystem from '../../lib/OperatingSystem';
import TerminalController, {
    type TerminalAttachmentOptions,
} from '../../lib/terminal';

import { Header, Content } from './components';
import {
    useTerminalStore,
    type TerminalLine,
} from '../../stores/terminal';

import './styles.scss';

interface TerminalProps {
    terminalController: TerminalController;
    operatingSystem?: OperatingSystem;
}

type StdInCallback = ((char: string) => void) | null;

type TerminalOutputOptions = {
    prompt?: string;
    lineIndex?: number;
    characterMode?: boolean;
    updateMode?: boolean;
    caretAtEnd?: boolean;
    color?: string | null;
    replaceRange?: number[];
};

const terminalTheme = createTheme();

function displayPrompt(prompt: string, error = false) {
    return <span className={clsx(error ? 'error' : 'prompt')}>{prompt}</span>;
}

function displayLine(line: string) {
    const colorRegex = /\^\[(.*?);(.*?)\^\]/g;
    const matches = [...line.matchAll(colorRegex)];
    if (isEmpty(matches)) {
        return <span>{line}</span>;
    }
    const elements: { text: string; color?: string }[] = [];
    let remainder = line;
    matches.forEach((match) => {
        const [original, color, text] = match;
        const split = remainder.split(original, 2);
        if (!isEmpty(split[0])) {
            elements.push({ text: split[0] });
        }
        elements.push({ color, text });
        remainder = split[1];
    });
    if (!isEmpty(remainder)) {
        elements.push({ text: remainder });
    }

    return elements.map((element, idx) =>
        element.color ? (
            <span key={idx} style={{ color: element.color }}>
                {element.text}
            </span>
        ) : (
            <span key={idx}>{element.text}</span>
        ),
    );
}

function TerminalHistoryLine({
    line,
}: {
    line: TerminalLine;
}) {
    return (
        <div>
            <span className={clsx(line.error ? 'commandError' : '')}>
                {line.prompt && displayPrompt(line.prompt, line.error)}
                {displayLine(line.value)}
            </span>
        </div>
    );
}

export default function Terminal({
    terminalController,
    operatingSystem,
}: TerminalProps) {
    const terminalLines = useTerminalStore((s) => s.terminalLines);
    const addLine = useTerminalStore((s) => s.addLine);
    const updateLine = useTerminalStore((s) => s.updateLine);
    const appendLine = useTerminalStore((s) => s.appendLine);
    const replaceCharsForRange = useTerminalStore(
        (s) => s.replaceCharsForRange,
    );
    const clearTerminal = useTerminalStore((s) => s.clearTerminal);

    const [previousCommandIndex, setPreviousCommandIndex] = useState(-1);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [cursorOffset, setCursorOffset] = useState(0);
    const [focus, setFocus] = useState(false);
    const [commandLoaded, setCommandLoaded] = useState(true);
    const [terminalLoaded, setTerminalLoaded] = useState(false);

    const stdInCallbackRef = useRef<StdInCallback>(null);
    const stdInCharacterModeRef = useRef(false);
    const commandLoadedRef = useRef(commandLoaded);
    const terminalLoadedRef = useRef(terminalLoaded);

    useEffect(() => {
        commandLoadedRef.current = commandLoaded;
    }, [commandLoaded]);
    useEffect(() => {
        terminalLoadedRef.current = terminalLoaded;
    }, [terminalLoaded]);

    const codeRef = useRef<HTMLElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const newLine = () => {
        addLine({ prompt: terminalController.prompt, value: '' });
        setCursorPosition(0);
        setCursorOffset(0);
    };

    const terminalOutput = (
        data: string,
        stream: string,
        {
            prompt = '',
            lineIndex = -1,
            characterMode = false,
            updateMode = false,
            caretAtEnd = true,
            color = null,
            replaceRange = [],
        }: TerminalOutputOptions = {},
    ) => {
        const error = stream === 'stderr';

        if (!caretAtEnd) {
            setCursorOffset(data.length);
        }

        let payload = data;
        if (color) {
            payload = `^[${color};${data}^]`;
        }

        if (characterMode) {
            appendLine(payload, lineIndex);
        } else if (replaceRange.length > 0) {
            const [start, end] = replaceRange;
            replaceCharsForRange(
                { prompt, value: payload, error, start, end },
                lineIndex,
            );
        } else if (updateMode) {
            updateLine({ prompt, value: payload, error }, lineIndex);
        } else {
            addLine({ prompt, value: payload, error });
        }
    };

    const handleStdIn = (
        callback: StdInCallback,
        {
            characterMode = false,
        }: Pick<TerminalAttachmentOptions, 'characterMode'> = {},
    ) => {
        stdInCharacterModeRef.current = characterMode;
        stdInCallbackRef.current = callback;
    };

    const handleStdOut = (data: string, options: TerminalOutputOptions) => {
        terminalOutput(data, 'stdout', options);
    };

    const handleStdErr = (data: string, options: TerminalOutputOptions) => {
        terminalOutput(data, 'stderr', { ...options, prompt: '\u2718 ' });
    };

    useEffect(() => {
        terminalController.attachTerminal({
            stdin: handleStdIn,
            stdout: handleStdOut,
            stderr: handleStdErr,
        });

        if (terminalController.initialized) {
            setTerminalLoaded(true);
            setCommandLoaded(true);
            return;
        }

        terminalController.attachOperatingSystem(operatingSystem);

        (async () => {
            setCommandLoaded(false);
            await terminalController.initialize();
            setTerminalLoaded(true);
            setCommandLoaded(true);
            newLine();
        })();
    }, [
        terminalController,
        operatingSystem,
        handleStdIn,
        handleStdOut,
        handleStdErr,
        newLine,
    ]);

    useEffect(() => {
        inputRef.current?.focus();
        window.onkeydown = (e: KeyboardEvent) => {
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
        };
        return () => {
            window.onkeydown = null;
        };
    }, []);

    useEffect(() => {
        if (codeRef.current) {
            codeRef.current.scrollTop =
                codeRef.current.scrollHeight - codeRef.current.clientHeight;
        }
        if (isEmpty(terminalLines) && terminalLoaded) {
            newLine();
        }
    }, [terminalLines, terminalLoaded, newLine]);

    useEffect(() => {
        if (commandLoaded && inputRef.current) {
            inputRef.current.value = '';
        }
    }, [commandLoaded]);

    const terminalFunctions: Record<string, () => void> = {
        clear: () => clearTerminal(),
        reboot: () => {
            terminalController.reset();
            setTerminalLoaded(false);
            clearTerminal();
        },
    };

    const handleKeyUp = async (event: ReactKeyboardEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        if (!commandLoadedRef.current && !stdInCallbackRef.current) return;

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
                    target.selectionStart = target.selectionEnd =
                        target.value.length;
                    setCursorPosition(target.value.length);
                }
                break;
            case 'c':
                if (event.ctrlKey) {
                    event.preventDefault();
                    setPreviousCommandIndex(-1);
                    if (stdInCallbackRef.current) {
                        stdInCallbackRef.current('^C');
                    } else {
                        updateLine({
                            prompt: terminalController.prompt,
                            value: `${target.value}^C`,
                        });
                        newLine();
                    }
                    target.value = '';
                }
                break;
            case 'l':
                if (event.ctrlKey && terminalLoadedRef.current) {
                    terminalFunctions.clear();
                }
                break;
            case 'Enter':
                setPreviousCommandIndex(-1);
                if (stdInCallbackRef.current) {
                    stdInCallbackRef.current('\n');
                    target.value = '';
                } else if (target.value.trim() !== '') {
                    setCommandLoaded(false);
                    const command = target.value;
                    target.value = '';
                    const commandReturn: {
                        command?: string;
                        value?: string;
                    } = (await terminalController.command(command)) || {
                        value: '',
                    };
                    setCommandLoaded(true);
                    if (commandReturn.command) {
                        const fn = terminalFunctions[commandReturn.command];
                        if (fn) {
                            fn();
                        }
                    } else {
                        newLine();
                    }
                    target.value = '';
                } else {
                    target.value = '';
                    newLine();
                }
                break;

            case 'ArrowLeft':
                setCursorPosition((prev) => (prev > 0 ? prev - 1 : prev));
                break;
            case 'ArrowRight':
                setCursorPosition((prev) =>
                    prev < target.value.length ? prev + 1 : prev,
                );
                break;

            case 'ArrowUp':
                if (event.shiftKey || event.ctrlKey) {
                    event.preventDefault();
                }
                if (
                    previousCommandIndex < terminalController.history.length
                ) {
                    const nextIndex = previousCommandIndex + 1;
                    if (nextIndex < terminalController.history.length) {
                        const value =
                            terminalController.history[nextIndex].command;
                        target.value = value;
                        updateLine({
                            prompt: terminalController.prompt,
                            value,
                        });
                        setCursorPosition(value.length);
                        setPreviousCommandIndex(nextIndex);
                    }
                }
                break;

            case 'ArrowDown':
                if (event.shiftKey || event.ctrlKey) {
                    event.preventDefault();
                }
                if (previousCommandIndex > -1) {
                    const nextIndex = previousCommandIndex - 1;
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
    };

    const handleChange = (event: FormEvent<HTMLInputElement>) => {
        const target = event.currentTarget;
        if (stdInCallbackRef.current) {
            stdInCallbackRef.current(target.value);
            if (stdInCharacterModeRef.current) {
                target.value = '';
            }
        } else {
            if (target.selectionStart !== target.selectionEnd) {
                target.selectionStart = target.selectionEnd;
            }
            setCursorPosition(target.selectionStart ?? 0);

            if (commandLoadedRef.current) {
                updateLine({
                    prompt: terminalController.prompt,
                    value: target.value,
                });
            } else {
                target.value = '';
            }
        }
    };

    const handleCodeSelect = () => {
        if (document.getSelection()?.toString() === '') {
            inputRef.current?.focus();
        }
    };

    const displayLineWithCursor = (line: string) => {
        const pos = cursorPosition + cursorOffset;
        return (
            <span>
                {line.slice(0, pos)}
                <span
                    className={clsx(
                        'cursor',
                        focus && commandLoaded ? 'active' : '',
                    )}
                >
                    {line[pos] || '\u00a0'}
                </span>
                {line.slice(pos + 1)}
            </span>
        );
    };

    return (
        <ThemeProvider theme={terminalTheme}>
            <div className="root">
                <div className="container">
                    <Header>Terminal</Header>
                    <div className="screen">
                        <input
                            ref={inputRef}
                            className="input"
                            onFocus={() => setFocus(true)}
                            onBlur={() => setFocus(false)}
                            onKeyUp={handleKeyUp}
                            onInput={handleChange}
                        />
                        <Content
                            ref={(el: HTMLElement | null) => {
                                codeRef.current = el;
                            }}
                            onMouseUp={handleCodeSelect}
                            tabIndex={-1}
                            onKeyUp={() => inputRef.current?.focus()}
                        >
                            {terminalLines.slice(0, -1).map(
                                (line: TerminalLine, index: number) => (
                                    <TerminalHistoryLine key={index} line={line} />
                                ),
                            )}
                            {terminalLines.length > 0 && (() => {
                                const activeLine = terminalLines[terminalLines.length - 1];
                                return (
                                    <div key={terminalLines.length - 1}>
                                        <span className={clsx(activeLine.error ? 'commandError' : '')}>
                                            {activeLine.prompt && displayPrompt(activeLine.prompt, activeLine.error)}
                                            {displayLineWithCursor(activeLine.value)}
                                        </span>
                                    </div>
                                );
                            })()}
                        </Content>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}
