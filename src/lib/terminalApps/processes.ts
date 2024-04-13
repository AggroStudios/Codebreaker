import Terminal from '../terminal';
import { TerminalApp } from '../../includes/Terminal.interface';
import OperatingSystem from '../OperatingSystem';

class Processes extends TerminalApp {

    private operatingSystem: OperatingSystem;

    constructor(terminal: Terminal) {
        super(terminal);
        this.operatingSystem = this.terminal.operatingSystem;
    }

    async run(command: string) {
        switch (command) {
            case undefined:
                this.terminal.log(this.terminal.operatingSystem.listProcesses());
                break;
            case 'start':
                if (this.operatingSystem.isRunning) {
                    this.terminal.stderr('Operating system is already running.');
                }
                else {
                    this.terminal.stdout('Starting operating system...');
                    this.operatingSystem.startGameLoop();
                }
                break;
            case 'stop':
                if (!this.operatingSystem.isRunning) {
                    this.terminal.stderr('Operating system is not running.');
                }
                else {
                    this.terminal.stdout('Stopping operating system...');
                    this.operatingSystem.stopGameLoop();
                }
                break;
            case 'toggle':
                this.terminal.stdout('Toggling operating system...');
                this.operatingSystem.toggleGameLoop();
                break;
            case 'reset':
                if (this.operatingSystem.isRunning) {
                    this.operatingSystem.stopGameLoop();
                }
                this.operatingSystem.resetProcesses();
                this.terminal.stdout('Stopping operating reset.');
                break;
            case 'status':
                this.terminal.stdout(`Stopping operating Status: Frame: ${this.operatingSystem.frame.toFixed(3)}, Exponent: ${this.operatingSystem.exponent}, Running? ${this.operatingSystem.isRunning ? 'Yes' : 'No'}`);
                break;
            default:
                this.terminal.stdout(`Command passed: ${command}`);
                break;
        }
    }
};

export default Processes;