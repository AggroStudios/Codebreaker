import Terminal from '../terminal';
import { TerminalApp } from '../../includes/Terminal.interface';

export default class Ping extends TerminalApp {

    private defaultPingSteps: number;

    constructor(terminal: Terminal, { defaultPingSteps = 4 } = {}) {
        super(terminal);
        this.defaultPingSteps = defaultPingSteps;
    }

    help() {
        `ping - utility that pings a host
        Usage:
        - ping host [steps] : Pings a host.
        - ping (help | -h | -?) : Brings up this cool little help text.
        Example:
        - ping google.com 10
        `.split('\n').forEach(line => this.terminal.stdout(line));
    }

    async run(argc: number, argv: string[]) {
        
        let host = argv[0]
        if (argc < 0) {
            this.terminal.stderr('Error: Host is undefined.\n');
            this.help();
            return;
        }
        
        const options = argv.slice(1);

        if (host === 'help' || host === '-h' || host === '-?') {
            this.help();
            return;
        }

        if (!host) {
            host = await this.terminal.readLine('Host: ');
        }

        return await new Promise<void>(async resolve => {
            const pingSteps:number = options.length ? parseInt(options[0]) : this.defaultPingSteps;
            let step = 0;
            let shouldBreak = false;

            const finishPing = () => {
                this.terminal.stdout(`Ping processed ${step} requests to ${host}`);
                this.terminal.stdin(null);
                resolve();
            };

            this.terminal.stdin((char: string) => {
                if (char === '^C') {
                    shouldBreak = true;
                    this.terminal.stderr('^C', { characterMode: true });
                }
            }, { characterMode: true });

            while (step < pingSteps) {
                if (shouldBreak) break;
                const pingReply = Math.floor(Math.random() * 100);
                this.terminal.stdout(`ping ${host} - ${pingReply}ms`, { caretAtEnd: true });
                if (step < pingSteps - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                step++;
            }
            finishPing();
        });
    }
}