import Terminal from '../terminal';
import { TerminalApp } from '../../includes/Terminal.interface';
import { HackingScenarios } from '../hackingScenarios';
import { isEmpty } from 'lodash';

export default class ScanVulnerabilities extends TerminalApp {

    constructor(terminal: Terminal) {
        super(terminal);
    }

    help() {
        `scan - utility that scans an IP address for vulnerabilities.
        Usage:
        - scan <ipAddress> : Scans an IP address
        - ping (help | -h | -?) : Brings up this cool little help text.
        Example:
        - scan 10.0.0.1
        `.split('\n').forEach(line => this.terminal.stdout(line));
    }

    async run(ipAddress: string) {

        if (ipAddress === 'help' || ipAddress === '-h' || ipAddress === '-?') {
            this.help();
            return;
        }

        if (isEmpty(ipAddress)) {
            this.terminal.stdout('Error: IP Address is undefined.\n');
            this.help();
            return;
        }

        this.terminal.stdout(`Scanning ${ipAddress} for vulnerabilities...`);
        return new Promise<void>(async resolve => {
            const v = HackingScenarios.findVulnerabilityByIp(ipAddress);
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (v) {
                this.terminal.log(v);
                this.terminal.stdout(`Found ${v.length} vulnerabilities for ${ipAddress}.`);
            }
            else {
                this.terminal.stderr(`No vulnerabilities found for ${ipAddress}`);
            }
            resolve();
        });
    }
};