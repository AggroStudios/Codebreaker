import Terminal from '../terminal';
import { TerminalApp } from '../../includes/Terminal.interface';
import { NotificationLevel } from '../../includes/OperatingSystem.interface';

class FetchPlayer extends TerminalApp {

    constructor(terminal: Terminal) {
        super(terminal);
    }

    help() {
        `player - Player control utility
        Usage:
        - player <command> : Control the player
        
        Commands:
        - <none> : Fetches the player information.
        - help | -h | --help | -? : Brings up this cool little help text.
        - give <amount> : Pay the player a certain amount of money.
        - take <amount> : Take a certain amount of money from the player.
        - xp <amount> : Give the player a certain amount of experience.
        - message <message> : Send a message to the player.
        - notifyInfo <message> : Send an info notification to the player.
        - notifyWarning <message> : Send a warning notification to the player.
        - notifyError <message> : Send an error notification to the player.
        
        Example:
        - player help
        - player give 40
        `.split('\n').forEach(line => this.terminal.stdout(line));
    }

    async run(argc: number, argv: string[]) {

        if (argc < 1) {
            this.terminal.stdout('Fetch Player...');
            this.terminal.log(this.terminal.operatingSystem.player);
        }
        else {
            switch (argv[0]) {
                case 'give':
                    if (argc < 2) {
                        this.terminal.stderr('Error: Amount is undefined.\n');
                        this.help();
                        break;
                    }
                    const giveAmount = parseFloat(argv[1]);
                    this.terminal.operatingSystem.player.addMoney(giveAmount);
                    this.terminal.stdout(`Gave player ${giveAmount} money.`);
                    break;
                case 'take':
                    if (argc < 2) {
                        this.terminal.stderr('Error: Amount is undefined.\n');
                        this.help();
                        break;
                    }
                    const takeAmount = parseFloat(argv[1]);
                    this.terminal.operatingSystem.player.removeMoney(takeAmount);
                    this.terminal.stdout(`Took ${takeAmount} money from player.`);
                    break;
                case 'xp':
                    if (argc < 2) {
                        this.terminal.stderr('Error: Amount is undefined.\n');
                        this.help();
                        break;
                    }
                    const xpAmount = parseInt(argv[1]);
                    this.terminal.operatingSystem.player.earnExperience(xpAmount);
                    this.terminal.stdout(`Gave player ${xpAmount} experience.`);
                    break;
                case 'message':
                    if (argc < 2) {
                        this.terminal.stderr('Error: Message is undefined.\n');
                        this.help();
                        break;
                    }
                    this.terminal.operatingSystem.sendMessage('System <system@codebreaker>', argv.slice(1).join(' '));
                    this.terminal.stdout('Message sent.');
                    break;
                case 'notifyInfo':
                    if (argc < 2) {
                        this.terminal.stderr('Error: Message is undefined.\n');
                        this.help();
                        break;
                    }
                    this.terminal.operatingSystem.sendNotification(argv.slice(1).join(' '), NotificationLevel.INFO);
                    this.terminal.stdout('Info notification sent.');
                    break;
                case 'notifyWarning':
                    if (argc < 2) {
                        this.terminal.stderr('Error: Message is undefined.\n');
                        this.help();
                        break;
                    }
                    this.terminal.operatingSystem.sendNotification(argv.slice(1).join(' '), NotificationLevel.WARNING);
                    this.terminal.stdout('Warning notification sent.');
                    break;
                case 'notifyError':
                    if (argc < 2) {
                        this.terminal.stderr('Error: Message is undefined.\n');
                        this.help();
                        break;
                    }
                    this.terminal.operatingSystem.sendNotification(argv.slice(1).join(' '), NotificationLevel.ERROR);
                    this.terminal.stdout('Error notification sent.');
                    break;
                default:
                    if (argv[0] === '-h' || argv[0] === '--help' || argv[0] === 'help' || argv[0] === '-?') {
                        this.help();
                        break;
                    }
                    this.terminal.stderr(`Error: Unknown command '${argv[0]}'.\n`);
                    break;
            }
        }
    }
};

export default FetchPlayer;
