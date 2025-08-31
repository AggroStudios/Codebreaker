import {
    lightBlue,
    lightGreen,
    cyan,
    amber,
    purple,
    grey,
    brown
} from '@suid/material/colors';

import {
    isArray,
    isBoolean,
    isNull,
    isPlainObject,
    isString,
    isUndefined
} from 'lodash';

import FileSystem from "./terminal-utils/filesystem";
import terminalApps from "./terminalApps";
import BootSequence from './terminalApps/bootSequence';

import OperatingSystem from './OperatingSystem';

interface HistoryEntry {
    command: string;
    id: number;
}

export default class Terminal {

    private defaultPrompt: string = '$ ';

    private options: any;
    private _history: Array<HistoryEntry> = [];
    private commandId: number = 0;
    private loaderTimer: NodeJS.Timeout | null = null;
    private loaderChar: string = '';
    private fs: FileSystem;

    private _osController: OperatingSystem;

    private _stdin: (callback: (char: string) => void, options?: any) => void;
    private _stdout: (message: any, options?: any) => void;
    private _stderr: (message: any, options?: any) => void;

    constructor(options: any = { historySize: 10 }) {
        this.options = options;
        this.fs = new FileSystem(terminalApps);
    }

    get prompt() {
        return `${this.fs.cwd} ${this.defaultPrompt}`;
    }

    get stdin() {
        return this._stdin;
    }

    get stdout() {
        return this._stdout;
    }

    get stderr() {
        return this._stderr;
    }

    get operatingSystem(): OperatingSystem {
        return this._osController;
    }

    async initialize() {
        const welcomeScreenLine1 = String.raw`
   _____    ________  _________________ ________
  /  _  \  /  _____/ /  _____|______   \\_____  \
 /  /_\  \/   \  ___/   \  ___|       _/ /   |   \
/    |    \    \_\  \    \_\  \    |   \/    |    \
\____|__  /\______  /\______  /____|_  /\_______  /
        \/        \/        \/       \/         \/`;
        const welcomeScreenLine2 = String.raw`
  _________ __            .___.__
 /   _____//  |_ __ __  __| _/|__| ____
 \_____  \\   __\  |  \/ __ | |  |/  _ \
 /        \|  | |  |  / /_/ | |  (  <_> )
/_______  /|__| |____/\____ | |__|\____/
        \/                 \/`;
        
        welcomeScreenLine1.split('\n').forEach((line, index) => {
            const colorIndex = (welcomeScreenLine1.split('\n').length - index) * 100;
            this.stdout(line.replaceAll(' ', '\u00a0'), { color: lightBlue[colorIndex] });
        });
        welcomeScreenLine2.split('\n').forEach((line, index) => {
            const colorIndex = (welcomeScreenLine2.split('\n').length - index) * 100;
            this.stdout(line.replaceAll(' ', '\u00a0'), { color: cyan[colorIndex] });
        });
        await new BootSequence(this).run(null, null);
    }

    addHistory(commandLine: string, commandId: number) {
        if (!this.history[0] || this.history[0].command !== commandLine) {
            this._history = [{command: commandLine, id: commandId}, ...this._history.slice(0, this.options.historySize - 1)];
        }
    }

    get history() {
        return this._history;
    }

    attachTerminal({ stdin, stdout, stderr }) {
        this._stdin = stdin;
        this._stdout = stdout;
        this._stderr = stderr;
    }

    attachOperatingSystem(os: OperatingSystem) {
        console.log('Operating System:', os);
        this._osController = os;
    }

    async readSecure(prompt: string) {
        return this.readLine(prompt, '*');
    }

    async readLine(prompt: string, characterOverride = null) {
        return await new Promise<string>((resolve, reject) => {
            let buffer = '';
            this.stdout(prompt, { caretAtEnd: true });
            this.stdin(char => {
                switch (char) {
                    case '^C':
                        this.stdin(null);
                        reject(`${prompt}${buffer}^C`);
                        break;
                    case '\n': 
                        this.stdin(null);
                        resolve(buffer);
                        break;
                    default:
                        // Set the buffer to whatever came in the input
                        buffer = char;
                        const output = characterOverride ? characterOverride.repeat(char.length) : char;
                        this.stdout(`${prompt}${output}`, { updateMode: true });
                        break;
                }
            });
        });
    }

    async readChar(limitedCharacters = [], defaultCharacter = '', caseSensitive = true) {
        return await new Promise((resolve, reject) => {
            const characterSetPrompt = limitedCharacters.length ? `(${limitedCharacters.join('/')}) ` : '';
            const defaultPrompt = defaultCharacter !== '' ? ` [${defaultCharacter}] ` : '';
            const finalPrompt = `${characterSetPrompt}${defaultPrompt}`;
            this.stdout(finalPrompt, { characterMode: true });
            this.stdin(char => {
                if (char === '^C') {
                    this.stdin(null);
                    reject(`${finalPrompt}^C`);
                }
                if (limitedCharacters.length) {
                    if (char === '\n' && defaultCharacter !== '') {
                        this.stdin(null);
                        resolve(defaultCharacter);
                    }
                    if (limitedCharacters.map(c => caseSensitive ? c : c.toUpperCase()).includes(caseSensitive ? char : char.toUpperCase())) {
                        this.stdin(null);
                        resolve(char);
                    }
                }
                else {
                    if (char === '\n' && defaultCharacter !== '') {
                        this.stdin(null);
                        resolve(defaultCharacter);
                    }
                    else {
                        this.stdin(null);
                        resolve(char);
                    }
                }
            }, { characterMode: true });
        });
    }

    showLoader(loaderCharacters = ['|', '/', '-', '\\']) {
        if (isNull(this.loaderTimer)) {
            let loaderIndex = 0;
            this.loaderChar = loaderCharacters[loaderIndex];
            this.stdout(this.loaderChar, { characterMode: true });
            this.loaderTimer = setInterval(() => {
                loaderIndex++;
                if (loaderIndex >= loaderCharacters.length) {
                    loaderIndex = 0;
                }
                this.loaderChar = loaderCharacters[loaderIndex];
                this.stdout(this.loaderChar, { replaceRange: [-(this.loaderChar.length)] })
            }, 70);
        }
    }

    hideLoader() {
        if (!isNull(this.loaderTimer)) {
            clearInterval(this.loaderTimer);
            this.stdout('', { replaceRange: [-(this.loaderChar.length)] });
            this.loaderTimer = null;
            this.loaderChar = '';
        }
    }

    async progressBar(total: number, delay: number, options = { width: 20 }) {

        return await new Promise<void>(async (resolve, reject) => {
            let shouldExit = false;
            this.stdin(char => {
                switch (char) {
                    case '^C':
                        shouldExit = true;
                        reject([`${previousString}^C`, { replaceRange: [-(previousString.length)] }]);
                        break;
                }
            });

            const drawBar = (progress: number, total: number) => {
                const percent = Math.ceil((progress / total) * 100);
                const filled = Math.ceil((progress / total) * options.width);
                const empty = options.width - filled;
                const filledBar = '█'.repeat(filled);
                const emptyBar = '░'.repeat(empty);
                const bar = `${filledBar}${emptyBar}`;
                return ` ${bar} ${percent}%`;
            }
            const barStr = drawBar(0, total);
            let previousString = barStr;
            this.stdout(barStr, { characterMode: true });

            for (let progress = 0; progress <= total; progress++) {
                if (shouldExit) break;
                const returnStr = drawBar(progress, total);
                this.stdout(returnStr, { replaceRange: [-(previousString.length)] });
                previousString = returnStr;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            this.stdin(null);
            if (!shouldExit) resolve();
        });
    }

    async withLoader(callback: Function, loaderCharacters: string[]) {
        this.showLoader(loaderCharacters);
        const result = await callback();
        this.hideLoader();
        return result;
    }

    log(message: any, depth: number = 2, indent: number = 0) {
        const margin = (extras = 0) => '\u00a0'.repeat(indent + extras);
        
        if (indent === 0) this.stdout('');

        if (isArray(message)) {
            if (indent / 2 > depth) {
                this.stdout('[Array...]', { characterMode: true, color: purple['A400'] });
            }
            else {
                this.stdout('[', { characterMode: true });
                message.forEach((m, i) => {
                    this.stdout(margin(2));
                    this.log(m, depth, indent + 2)
                    if (i < message.length - 1) {
                        this.stdout(',', { characterMode: true });
                    }
                });
                this.stdout(`${margin()}]`);
            }
        }
        else if (isPlainObject(message)) {
            if (indent / 2 > depth) {
                this.stdout('[Object...]', { characterMode: true, color: purple['A400'] });
            }
            else {
                this.stdout('{', { characterMode: true });
                for (const key in message as any) {
                    this.stdout(`${margin(2)}${key}: `, { color: lightGreen['400'] });
                    this.log(message[key], depth, indent + 2);
                    if (Object.keys(message).indexOf(key) < Object.keys(message).length - 1) {
                        this.stdout(',', { characterMode: true });
                    }
                }
                this.stdout(`${margin()}}`);
            }
        }
        else {
            if (isString(message)) {
                this.stdout('"', { characterMode: true });
                const lines = message.split('\n');
                const firstLine = lines.shift();
                this.stdout(firstLine, { characterMode: true });
                lines.forEach(line => { this.stdout(`${margin(2)}${line}`)});
                this.stdout('"', { characterMode: true });
            }
            else {
                if (isBoolean(message)) {
                    this.stdout(message ? 'true' : 'false', { characterMode: true, color: lightBlue['500'] });
                }
                else if (isUndefined(message)) {
                    this.stdout('undefined', { characterMode: true, color: grey['600'] });
                }
                else if (isNull(message)) {
                    this.stdout('null', { characterMode: true, color: brown['A400'] });
                }
                else {
                    this.stdout(message, { characterMode: true, color: amber['900'] });
                }
            }
        }
    }

    async command(commandLine: string) {

        const commandToRun = (commandLine: string) => {
            const command = commandLine.split(' ')[0].trim();
            if (command.startsWith('!')) {
                const commandId = command.substring(1);
                const historyCommand = this.history.find(h => Number(h.id) === Number(commandId));
                if (historyCommand) {
                    return historyCommand.command;
                }
            }
            else {
                return commandLine;
            }
        }

        const processedCommandLine = commandToRun(commandLine.trim());
        const [command, ...args] = processedCommandLine.split(' ');

        switch (command.trim()) {
            case 'ls':
                try {
                    this.fs.listDirectory(args).forEach(entry => {
                        this.stdout(entry);
                    });

                }
                catch (err) {
                    this.stderr(err.message);
                }
                break;
            case 'cd':
                try {
                    this.fs.changeDirectory(args);
                }
                catch (err) {
                    this.stderr(err.message);
                }
                break;
            case 'history':
                this.history.slice(0).reverse().forEach(line => this.stdout(`> ${line.id} - ${line.command}`));
                break;
            case 'test':
                const depth = parseInt(args[0]);
                this.log({
                    prop: 'value',
                    propArray: ['value1', 'value2'],
                    propObject: {
                        prop1: 'value1',
                        prop2: 'value2',
                        prop3: {
                            testString: 'This is my cool string!',
                            testMultiLine: `This is a
                            multiline string`,
                            testNumber: 123.01,
                            testBoolean: true,
                            testUndefined: undefined,
                            testNull: null,
                            testArray: [
                                'This',
                                'should',
                                'not',
                                'show',
                                'with',
                                'default',
                                'depth'
                            ],
                            testObject: {
                                message: 'Same with the object!'
                            },
                        }
                    }
                }, depth);
                break;
            case 'clear':
                return { command: 'clear' };
            case 'reboot':
                return { command: 'reboot' };
            case 'anyKey':
                try {
                    this.stdout('Press any key to continue...');
                    await this.readChar();
                }
                catch (error) {
                    this.stderr(error, { updateMode: true });
                }
                break;
            case 'yesno':
                try {
                    this.stdout('Select an option:');
                    const response = await this.readChar(['y', 'n'], 'y', false);
                    this.stdout(`You selected ${response}`);
                }
                catch (error) {
                    this.stderr(error, { updateMode: true });
                }
                break;
            case 'password':
                try {
                    const data = await this.readSecure('Enter password: ');
                    this.stdout(`Password: ${data}`);
                }
                catch (error) {
                    // Swallow
                    this.stderr(error, { updateMode: true });
                }
                break;
            case 'input':
                try {
                    const data = await this.readLine('Enter something: ');
                    this.stdout(`Result: ${data}`);
                }
                catch (error) {
                    // Swallow
                    this.stderr(error, { updateMode: true });
                }
                break;
            case 'help':
                const str = 
                `This is help:


                hello!
                Multi line thing!`;
                str.split('\n').forEach(line => this.stdout(line));
                await new Promise(resolve => setTimeout(resolve, 1000));
                break;
            case 'loader':
                this.stdout('Loading...');
                this.showLoader();
                await this.readChar();
                this.hideLoader();
                break;
            case 'fancyLoader':
                const loader = [ '⠷', '⠯', '⠟', '⠻', '⠽', '⠾' ];
                this.stdout('Loading... ');
                await this.withLoader(async () => await this.readChar(), loader);
                break;
            case 'progress':
                this.stdout('Testing progress bar... what if I make this longer?');
                try {
                    await this.progressBar(100, 100);
                }
                catch (err) {
                    this.stderr.apply(null, err);
                }
                break;
            default:
                try {
                    const app = this.fs.resolvePath(command);
                    const argc = args.length;
                    const argv = args;
                    await (new app(this)).run(argc, argv);
                    break;
                }
                catch (err) {
                    this.stderr(err.message);
                }
                break;
        }

        this.commandId++;
        this.addHistory(processedCommandLine, this.commandId);
    }
}