import { HackingScenarios } from '../hackingScenarios';
import Terminal from '../terminal';
import { TerminalApp } from '../../includes/Terminal.interface';

class Dig extends TerminalApp {

    constructor(terminal: Terminal) {
        super(terminal);
    }

    async run(argc: number, argv: string[]) {
        if (argc < 1) {
            this.terminal.stderr('Usage: dig <domain>');
            return;
        }
        const domain = argv[0];
        
        const existingDomains = HackingScenarios.getAllDomains();

        if (existingDomains.includes(domain)) {
            const domainInfo = (await import(`../hackingScenarios/domains/${domain}.ts`)).default;
            this.terminal.log(domainInfo.subdomains);
        }
        else {
            this.terminal.stderr(`Domain ${domain} not found.`);
        }
    }
};

export default Dig;
