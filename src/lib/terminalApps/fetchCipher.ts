import Terminal from '../terminal';
import { TerminalApp } from '../../includes/Terminal.interface';

class FetchCipher extends TerminalApp {

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
        return await this.terminal.readLine('Enter decrypted solution: ');
    }

    async run() {

        const stringToEncrypt = this.rot13('Hello World');
        let tries = 3;

        this.terminal.stdout('Fetch Cipher...');
        this.terminal.showLoader();
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.terminal.hideLoader();
        this.terminal.stdout(`Encrypted: ${stringToEncrypt}`);
        
        while (tries > 0) {
            const data = await this.captureAnswer();
            if (this.rot13(data) === stringToEncrypt) {
                this.terminal.stdout(`Success! Result: ${data}`);
                // Give $2!
                return;
            }
            tries--;
            this.terminal.stderr(`Incorrect solution. You have ${tries} tries left.`);
        }
    }
};

export default FetchCipher;
