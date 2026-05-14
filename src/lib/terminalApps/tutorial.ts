import Terminal from '../terminal';
import { TerminalApp } from '../../includes/Terminal.interface';

export default class Tutorial extends TerminalApp {
    constructor(terminal: Terminal) {
        super(terminal);
    }

    help() {
        `tutorial - Tutorial control utility
        Usage:
        - tutorial <command> : Control the tutorial
        
        Commands:
        - <none> : Shows the status of the tutorial, shown or not.
        - help | -h | --help | -? : Brings up this cool little help text.
        - reset : Resets the tutorial.
        
        Example:
        - tutorial help
        - tutorial reset
        `
            .split('\n')
            .forEach((line) => this.terminal.stdout(line));
    }

    async run(argc: number, argv: string[]) {
        if (argc < 1) {
            this.terminal.stdout(`Tutorial status: ${this.terminal.operatingSystem.player.hasSeenTutorial}`);
        } else {
            switch (argv[0]) {
                case 'reset': {
                    this.terminal.operatingSystem.player.resetTutorial();
                    this.terminal.stdout('Tutorial reset.');
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
