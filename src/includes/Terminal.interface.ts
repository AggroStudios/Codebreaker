import Terminal from '../lib/terminal';

export interface ITerminalApp {
    run(argc: number, argv: string[]): void;
    help?(): void;
}

export interface ITerminalScriptAction {
    action: string,
    delay?: number,
    message?: string
}

export interface ITerminalScript {
    application: string;
    steps: ITerminalScriptAction[];
}

export class TerminalApp implements ITerminalApp {
    protected terminal: Terminal;
    constructor(terminal: Terminal) {
        this.terminal = terminal;
    }

    async processScript(script: ITerminalScript) {
        for (const step of script.steps) {
            switch (step.action) {
                case 'output':
                    this.terminal.stdout(step.message);
                    break;
                case 'showLoader':
                    this.terminal.showLoader();
                    await new Promise(resolve => setTimeout(resolve, step.delay));
                    this.terminal.hideLoader();
                    break;
            }
        }

    }

    async run(_?: number, __?: string[]) { throw new Error('Not Implemented.') };
};

export interface IApplication {
    cmd: string;
    path: string;
    app: typeof TerminalApp;
    permissions: number;
}