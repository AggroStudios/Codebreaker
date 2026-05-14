import Terminal from '../terminal';
import { TerminalApp } from '../../includes/Terminal.interface';
import { useDataCentersStore } from '../../stores/dataCenters';

export default class ContractEdit extends TerminalApp {
    constructor(terminal: Terminal) {
        super(terminal);
    }

    help() {
        `contract - Contract edit utility
        Usage:
        - contract <command> <contractId> : Control the contract edit
        
        Commands:
        - <none> : Shows the list of contracts.
        - help | -h | --help | -? : Brings up this cool little help text.
        - delete : Deletes the contract.
        - reset : Resets the contract to default values.

        Example:
        - contract
        - contract help
        - contract delete eu-west
        - contract reset us-west
        `
            .split('\n')
            .forEach((line) => this.terminal.stdout(line));
    }

    async run(argc: number, argv: string[]) {
        
        if (argc < 1) {
            this.terminal.stdout('Contracts:');
            Object.keys(useDataCentersStore.getState().contracts).forEach((contractId) => {
                const contract = useDataCentersStore.getState().contracts[contractId];
                this.terminal.stdout(`- Region: ${contractId}`);
                this.terminal.stdout(`  ${contract.racks} racks`);
                this.terminal.stdout(`  ${contract.powerKw} power`);
                this.terminal.stdout(`  ${contract.uplinkGbps} uplink`);
                this.terminal.stdout(`  ${contract.signedDays} days signed`);
                this.terminal.stdout(`  ${contract.status}`);
            });
        } else {
            if (argc < 2) {
                this.terminal.stderr('Error: Missing contract ID.\n');
                return;
            }
            switch (argv[0]) {
                case 'delete': {
                    const contracts = useDataCentersStore.getState().contracts;
                    if (!Object.keys(contracts).includes(argv[1])) {
                        this.terminal.stderr(`Error: Contract '${argv[1]}' not found.\n`);
                        return;
                    }
                    this.terminal.stdout(`Are you sure you want to delete the contract '${argv[1]}'?`);
                    const response = await this.terminal.readChar(['y', 'n'], 'y', false);
                    if (response !== 'y') {
                        this.terminal.stderr(`Error: Operation cancelled.\n`);
                        return;
                    }
                    useDataCentersStore.getState().deleteContract(argv[1]);
                    break;
                }
                case 'reset': {
                    const contracts = useDataCentersStore.getState().contracts;
                    if (!Object.keys(contracts).includes(argv[1])) {
                        this.terminal.stderr(`Error: Contract '${argv[1]}' not found.\n`);
                        return;
                    }
                    this.terminal.stdout(`Are you sure you want to reset the contract '${argv[1]}'?`);
                    const response = await this.terminal.readChar(['y', 'n'], 'y', false);
                    if (response !== 'y') {
                        this.terminal.stderr(`Error: Operation cancelled.\n`);
                        return;
                    }
                    useDataCentersStore.getState().resetContract(argv[1]);
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
