import Terminal from '../lib/terminal';

export interface ITerminalApp {
    run(argc: number, argv: string[]): void;
    help?(): void;
}

export class TerminalApp implements ITerminalApp {
    protected terminal: Terminal;
    constructor(terminal: Terminal) {
        this.terminal = terminal;
    }
    async run(_?: number, __?: string[]) { throw new Error('Not Implemented.') };
};

export interface IApplication {
    cmd: string;
    path: string;
    app: typeof TerminalApp;
    permissions: number;
}