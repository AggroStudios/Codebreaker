import axios from 'axios';

import Terminal from '../terminal';
import { TerminalApp } from '../../includes/Terminal.interface';

export default class HttpRequest extends TerminalApp {

    constructor(terminal: Terminal) {
        super(terminal);
    }

    async run(argc: number, argv: string[]) {

        if (argc < 1) {
            throw new Error('URL is required.');
        }
        const url = argv[0];

        this.terminal.stdout(`Requesting GET from ${url}...`);
        // const loader = [ ' ⠷', ' ⠯', ' ⠟', ' ⠻', ' ⠽', ' ⠾' ];
        const loader = [ ' [o---]', ' [-o--]', ' [--o-]', ' [---o]', ' [--o-]', ' [-o--]' ];
        return await this.terminal.withLoader(async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const response = await axios.get(`${$config.endpoint}/api/v1/request?url=${url}`);
            this.terminal.log(response.data);
            this.terminal.stdout('');
        }, loader);
    }
}