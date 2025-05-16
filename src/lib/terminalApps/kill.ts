import Terminal from '../terminal';
import { TerminalApp } from '../../includes/Terminal.interface';
import OperatingSystem from '../OperatingSystem';

class Processes extends TerminalApp {

    private operatingSystem: OperatingSystem;

    constructor(terminal: Terminal) {
        super(terminal);
        this.operatingSystem = this.terminal.operatingSystem;
    }

    async run(argc: number, argv: string[]) {

        if (argc < 1) {
            this.terminal.stderr('Usage: kill <pid>');
            return;
        }
        const pid = argv[0];
        
        try {
            this.operatingSystem.kill(parseInt(pid));
        }
        catch (err) {
            this.terminal.stderr(err.message);
        }
    }
};

export default Processes;