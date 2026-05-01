import Terminal from '../terminal';
import { TerminalApp } from '../../includes/Terminal.interface';

export default class Glow extends TerminalApp {
    constructor(terminal: Terminal) {
        super(terminal);
    }

    help() {
        `glow - Glow control utility
        Usage:
        - glow <command> : Control the glow
        
        Commands:
        - <none> : Shows the status of the glow, shown or not.
        - help | -h | --help | -? : Brings up this cool little help text.
        - on : Turns on the glow.
        - off : Turns off the glow.
        
        Example:
        - glow help
        - glow on
        - glow off
        `
            .split('\n')
            .forEach((line) => this.terminal.stdout(line));
    }

    async run(argc: number, argv: string[]) {
        console.log(this.terminal.operatingSystem.station);
        if (argc < 1) {
            this.terminal.stdout(`Glow status: ${this.terminal.operatingSystem.station.glowActive}`);
        } else {
            switch (argv[0]) {
                case 'on': {
                    this.terminal.operatingSystem.station.setGlowActive(true);
                    this.terminal.stdout('Glow turned on.');
                    break;
                }
                case 'off': {
                    this.terminal.operatingSystem.station.setGlowActive(false);
                    this.terminal.stdout('Glow turned off.');
                    break;
                }
                default:
                    if (
                        argv[0] === '-h' ||
                        argv[0] === '--help' ||
                        argv[0] === 'help' ||
                        argv[0] === '-?'
                    ) {
                        this.help();
                        break;
                    }
                    this.terminal.stderr(
                        `Error: Unknown command '${argv[0]}'.\n`,
                    );
                    break;
            }
        }
    }
}
