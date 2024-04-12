import Terminal from '../lib/terminal';

export interface ITerminalApp {
    run(domain: string, args?: any): void;
    help?(): void;
}

export class TerminalApp implements ITerminalApp {
    protected terminal: Terminal;
    constructor(terminal: Terminal) {
        this.terminal = terminal;
    }
    async run(_?:any) { throw new Error('Not Implemented.') };
};

export interface IApplication {
    cmd: string;
    path: string;
    app: typeof TerminalApp;
    permissions: number;
}