import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Terminal from './terminal';
import OperatingSystem from './OperatingSystem';

const mockStd = () => ({
    stdin: vi.fn(),
    stdout: vi.fn(),
    stderr: vi.fn(),
});

describe('Terminal', () => {
    let term: Terminal;
    let std: any;

    beforeEach(() => {
        std = mockStd();
        term = new Terminal({ historySize: 5 });
        term.attachTerminal(std);
    });

    it('should initialize with default prompt', () => {
        expect(term.prompt.endsWith('$ ')).toBe(true);
    });

    it('should attach operating system', () => {
        const os = new OperatingSystem({
            moneyLabel: null,
            xpLabel: null,
            hasSeenTutorial: [],
            tutorialDisabled: false,
            tutorialStage: '',
            showTutorial: vi.fn(),
            setHasSeenTutorial: vi.fn(),
            markTutorialAsSeen: vi.fn(),
            resetTutorial: vi.fn(),
            setTutorialDisabled: vi.fn(),
            setMoneyLabel: vi.fn(),
            setXpLabel: vi.fn(),
            addNotification: vi.fn(),
            addMessage: vi.fn(),
            markMessageAsRead: vi.fn(),
            markNotificationAsRead: vi.fn(),
            markAllNotificationsAsRead: vi.fn(),
            player: {
                name: 'TestPlayer',
                money: 0,
                experience: 0,
                level: 1,
                nextLevel: 2,
                notifications: [],
                messages: [],
                statistics: {
                    startTime: 0,
                    totalPlayedTime: 0,
                    totalCiphers: {},
                    totalMoneyEarned: 0,
                    totalMoneySpent: 0,
                },
            },
            earnExperience: vi.fn(),
            addMoney: vi.fn(),
            removeMoney: vi.fn(),
            deleteNotification: vi.fn(),
            deleteAllNotifications: vi.fn(),
            purchasedUpgrades: [],
            purchaseUpgrade: vi.fn(),
            successCipher: vi.fn(),
            failedCipher: vi.fn(),
            updateTotalPlayedTime: vi.fn(),
        });
        term.attachOperatingSystem(os);
        expect(term.operatingSystem).toBe(os);
    });

    it('should add history and limit size', () => {
        for (let i = 0; i < 7; i++) {
            term.addHistory(`cmd${i}`, i);
        }
        expect(term.history.length).toBe(5);
        expect(term.history[0].command).toBe('cmd6');
    });

    it('should show and hide loader', () => {
        std.stdout.mockClear();
        term.showLoader(['|', '/']);
        // Loader should call stdout with loader characters
        expect(std.stdout).toHaveBeenCalled();
        term.hideLoader();
        // After hiding loader, stdout should be called again to clear
        expect(std.stdout).toHaveBeenCalled();
    });

    it('should log primitives and objects', () => {
        term.log('test');
        term.log(123);
        term.log(true);
        term.log(undefined);
        term.log(null);
        term.log([1, 2, 3]);
        term.log({ a: 1, b: [2, 3] });
        expect(std.stdout).toHaveBeenCalled();
    });

    it('should add to history after command', async () => {
        std.stdout.mockImplementation(() => {});
        std.stderr.mockImplementation(() => {});
        await term.command('ls');
        expect(term.history[0].command).toBe('ls');
    });

    it('should handle unknown command', async () => {
        std.stdout.mockImplementation(() => {});
        std.stderr.mockImplementation(() => {});
        await term.command('unknowncmd');
        expect(std.stderr).toHaveBeenCalled();
    });
});

describe('readLine', () => {
    let term: Terminal;
    let std: any;

    beforeEach(() => {
        std = mockStd();
        term = new Terminal();
        term.attachTerminal(std);
    });

    it('should resolve with input buffer on newline', async () => {
        std.stdin.mockImplementationOnce((cb: (char: string) => void) => {
            cb('hello');
            cb('\n');
        });
        const result = await term.readLine('> ');
        expect(result).toBe('hello');
    });

    it('should reject on ^C', async () => {
        std.stdin.mockImplementationOnce((cb: (char: string) => void) => {
            cb('^C');
        });
        await expect(term.readLine('> ')).rejects.toBe('> ^C');
    });

    it('should mask characters with characterOverride', async () => {
        std.stdin.mockImplementationOnce((cb: (char: string) => void) => {
            cb('abc');
            cb('\n');
        });
        const result = await term.readLine('> ', '*');
        expect(result).toBe('abc');
        expect(std.stdout).toHaveBeenCalledWith('> ***', { updateMode: true });
    });
});

describe('readSecure', () => {
    let term: Terminal;
    let std: any;

    beforeEach(() => {
        std = mockStd();
        term = new Terminal();
        term.attachTerminal(std);
    });

    it('should mask input with * and resolve correctly', async () => {
        std.stdin.mockImplementationOnce((cb: (char: string) => void) => {
            cb('secret');
            cb('\n');
        });
        const result = await term.readSecure('Password: ');
        expect(result).toBe('secret');
        expect(std.stdout).toHaveBeenCalledWith('Password: ******', {
            updateMode: true,
        });
    });
});

describe('readChar', () => {
    let term: Terminal;
    let std: any;

    beforeEach(() => {
        std = mockStd();
        term = new Terminal();
        term.attachTerminal(std);
    });

    it('should resolve with any character when no limitedCharacters', async () => {
        std.stdin.mockImplementationOnce((cb: (char: string) => void) => {
            cb('x');
        });
        expect(await term.readChar()).toBe('x');
    });

    it('should resolve with defaultCharacter on newline when no limitedCharacters', async () => {
        std.stdin.mockImplementationOnce((cb: (char: string) => void) => {
            cb('\n');
        });
        expect(await term.readChar([], 'y')).toBe('y');
    });

    it('should resolve with matching character from limitedCharacters', async () => {
        std.stdin.mockImplementationOnce((cb: (char: string) => void) => {
            cb('n');
        });
        expect(await term.readChar(['y', 'n'])).toBe('n');
    });

    it('should ignore non-matching characters and wait for a valid one', async () => {
        let capturedCb: ((char: string) => void) | null = null;
        std.stdin.mockImplementation((cb: ((char: string) => void) | null) => {
            if (cb !== null) capturedCb = cb;
        });
        const promise = term.readChar(['y', 'n']);
        capturedCb!('x'); // not in set, ignored
        capturedCb!('y'); // valid
        expect(await promise).toBe('y');
    });

    it('should resolve with defaultCharacter on newline when limitedCharacters set', async () => {
        std.stdin.mockImplementationOnce((cb: (char: string) => void) => {
            cb('\n');
        });
        expect(await term.readChar(['y', 'n'], 'y')).toBe('y');
    });

    it('should match case-insensitively when caseSensitive is false', async () => {
        std.stdin.mockImplementationOnce((cb: (char: string) => void) => {
            cb('Y');
        });
        expect(await term.readChar(['y', 'n'], '', false)).toBe('Y');
    });

    it('should reject on ^C', async () => {
        std.stdin.mockImplementationOnce((cb: (char: string) => void) => {
            cb('^C');
        });
        await expect(term.readChar()).rejects.toContain('^C');
    });
});

describe('progressBar', () => {
    let term: Terminal;
    let std: any;

    beforeEach(() => {
        std = mockStd();
        term = new Terminal();
        term.attachTerminal(std);
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should resolve after completing all steps', async () => {
        std.stdin.mockImplementation(() => {});
        const promise = term.progressBar(3, 100);
        await vi.runAllTimersAsync();
        await expect(promise).resolves.toBeUndefined();
    });

    it('should render the initial bar and update on each step', async () => {
        std.stdin.mockImplementation(() => {});
        const promise = term.progressBar(2, 100);
        await vi.runAllTimersAsync();
        await promise;
        // Initial bar at 0, then step 1, step 2
        expect(std.stdout).toHaveBeenCalledTimes(3);
    });

    it('should reject on ^C', async () => {
        let capturedCb: ((char: string) => void) | null = null;
        std.stdin.mockImplementation((cb: ((char: string) => void) | null) => {
            if (cb !== null) capturedCb = cb;
        });
        const promise = term.progressBar(100, 100);
        capturedCb!('^C');
        await expect(promise).rejects.toBeDefined();
    });
});
