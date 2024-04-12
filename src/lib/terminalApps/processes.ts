import Terminal from '../terminal';
import { TerminalApp } from '../../includes/Terminal.interface';
import GameController from '../GameController';

class Processes extends TerminalApp {

    private gameController: GameController;

    constructor(terminal: Terminal) {
        super(terminal);
        this.gameController = this.terminal.gameController;
    }

    async run(command: string) {
        switch (command) {
            case undefined:
                this.terminal.log(this.terminal.gameController.listProcesses());
                break;
            case 'start':
                if (this.gameController.isRunning) {
                    this.terminal.stderr('Game controller is already running.');
                }
                else {
                    this.terminal.stdout('Starting game controller...');
                    this.gameController.startGameLoop();
                }
                break;
            case 'stop':
                if (!this.gameController.isRunning) {
                    this.terminal.stderr('Game controller is not running.');
                }
                else {
                    this.terminal.stdout('Stopping game controller...');
                    this.gameController.stopGameLoop();
                }
                break;
            case 'toggle':
                this.terminal.stdout('Toggling game controller...');
                this.gameController.toggleGameLoop();
                break;
            case 'reset':
                if (this.gameController.isRunning) {
                    this.gameController.stopGameLoop();
                }
                this.gameController.resetProcesses();
                this.terminal.stdout('Game controller reset.');
                break;
            case 'status':
                this.terminal.stdout(`Game Controller Status: Frame: ${this.gameController.frame.toFixed(3)}, Exponent: ${this.gameController.exponent}, Running? ${this.gameController.isRunning ? 'Yes' : 'No'}`);
                break;
            default:
                this.terminal.stdout(`Command passed: ${command}`);
                break;
        }
    }
};

export default Processes;