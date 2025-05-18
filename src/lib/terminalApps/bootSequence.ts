import Terminal from '../terminal';
import { TerminalApp } from '../../includes/Terminal.interface';

import sequence from '../campaignScenarios/boot.json';

class BootSequence extends TerminalApp {

    constructor(terminal: Terminal) {
        super(terminal);
    }

    private rot13(str: string): string {
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            if (charCode >= 65 && charCode <= 90) {
                str = str.substring(0, i) + String.fromCharCode(((charCode - 65 + 13) % 26) + 65) + str.substring(i + 1);
            } else if (charCode >= 97 && charCode <= 122) {
                str = str.substring(0, i) + String.fromCharCode(((charCode - 97 + 13) % 26) + 97) + str.substring(i + 1);
            }
        }
        return str;
    }

    private async captureAnswer() {
        return await this.terminal.readLine('Solution: ');
    }

    async run(_: number, __: string[]) {

        const answer = 'There can not be light without darkness';
        let tryCount = 3;

        await this.processScript(sequence);

        this.terminal.stdout(this.rot13(answer));

        while (tryCount > 0) {
            if (await this.captureAnswer() === answer) {
                this.terminal.stdout('');
                this.terminal.stdout('>> Decryption successful.');
                this.terminal.stdout('>> Welcome, Operative. You\'ve passed the first test.');
                this.terminal.stdout('>> Objective unlocked: Solve 5 encrypted messages.');
                return;
            }
            else {
                this.terminal.stderr('Decryption failed. Try again!');
                tryCount--;
            }
        }
        this.terminal.stderr('>> Decryption failed. Boot sequence aborted.');
        return;
    }
};

export default BootSequence;
