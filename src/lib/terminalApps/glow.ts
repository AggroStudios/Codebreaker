import Terminal from '../terminal';
import { TerminalApp } from '../../includes/Terminal.interface';
import { ScreenGlowType } from '../../components/ScreenGlow';

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
        - active : Turns on the glow.
        - alert : Turns on the alert glow.
        - overclock : Turns on the overclock glow.
        - off : Turns off the glow.

        Example:
        - glow help
        - glow active
        - glow alert
        - glow overclock
        - glow off
        `
            .split('\n')
            .forEach((line) => this.terminal.stdout(line));
    }

    async run(argc: number, argv: string[]) {
        
        if (argc < 1) {
            this.terminal.stdout(`Glow status: ${this.terminal.operatingSystem.station.glowActive}`);
        } else {
            switch (argv[0]) {
                case 'alert': {
                    this.terminal.operatingSystem.station.setGlowType(ScreenGlowType.ALERT);
                    this.terminal.operatingSystem.station.setGlowActive(true);
                    this.terminal.stdout('Glow turned on. Type: Alert');
                    break;
                }
                case 'overclock': {
                    this.terminal.operatingSystem.station.setGlowType(ScreenGlowType.OVERCLOCK);
                    this.terminal.operatingSystem.station.setGlowActive(true);
                    this.terminal.stdout('Glow turned on. Type: Overclock');
                    break;
                }
                case 'active': {
                    this.terminal.operatingSystem.station.setGlowType(ScreenGlowType.ACTIVE);
                    this.terminal.operatingSystem.station.setGlowActive(true);
                    this.terminal.stdout('Glow turned on. Type: Active');
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
