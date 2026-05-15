import Terminal from '../terminal';
import { TerminalApp } from '../../includes/Terminal.interface';
import { useServersStore } from '../../stores/servers';
import SERVERS from '../../data/servers';
import { omit } from 'lodash';

export default class DailyDeal extends TerminalApp {
    constructor(terminal: Terminal) {
        super(terminal);
    }

    help() {
        `dailyDeal - Daily deal utility
        Usage:
        - dailyDeal <command> : Control the daily deal
        
        Commands:
        - <none> : Shows the current daily deal.
        - help | -h | --help | -? : Brings up this cool little help text.
        - randomize : Randomizes the daily deal.
        - randomOffers <count> : Randomizes a daily offer.

        Example:
        - dailyDeal
        - dailyDeal help
        - dailyDeal randomize
        - dailyDeal randomOffers 5
        `
            .split('\n')
            .forEach((line) => this.terminal.stdout(line));
    }

    async run(argc: number, argv: string[]) {

        const dailyDeal = useServersStore.getState().dailyDeal;
        const setDailyDeal = useServersStore.getState().setDailyDeal;
        const setDailyOffers = useServersStore.getState().setDailyOffers;

        if (argc < 1) {
            this.terminal.stdout('Daily deal:');
            if (dailyDeal.server) {
                this.terminal.stdout(`- Server: ${dailyDeal?.server.manufacturer}: ${dailyDeal?.server.model}`);
                this.terminal.stdout(`- Discount: ${dailyDeal?.discountPercent}%`);
            } else {
                this.terminal.stdout('No daily deal found.');
            }
        } else {
            switch (argv[0]) {
                case 'randomize': {
                    let serverList = SERVERS;
                    if (dailyDeal?.server) {
                        serverList = serverList.filter((server) => {
                            return server.model !== dailyDeal.server.model && server.manufacturer !== dailyDeal.server.manufacturer;
                        });
                    }
                    const server = serverList[Math.floor(Math.random() * serverList.length)];
                    const discountPercent = Math.floor(Math.random() * (30 - 15 + 1)) + 15;

                    this.terminal.stdout(`New daily deal: ${server.manufacturer}: ${server.model} - ${discountPercent}%`);

                    setDailyDeal({ server, discountPercent });
                    break;
                }
                case 'randomOffers': {
                    const count = parseInt(argv[1]);
                    if (!count) {
                        this.terminal.stderr('Error: Count is required.\n');
                        return;
                    }

                    let serverList = SERVERS;
                    if (dailyDeal?.server) {
                        serverList = serverList.filter((server) => {
                            return server.model !== dailyDeal.server.model && server.manufacturer !== dailyDeal.server.manufacturer;
                        });
                    }

                    serverList = serverList.map((server) => omit(server, 'discount'));

                    const dailyOffers = [];
                    for (let i = 0; i < count; i++) {
                        serverList = serverList.filter((server) => !dailyOffers.find((dailyOffer) => dailyOffer.server.model === server.model && dailyOffer.server.manufacturer === server.manufacturer));
                        const server = serverList[Math.floor(Math.random() * serverList.length)];
                        const discountPercent = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
                        dailyOffers.push({ server, discountPercent });
                    }

                    dailyOffers.forEach((dailyOffer) => {
                        this.terminal.stdout(`- Server: ${dailyOffer.server.manufacturer}: ${dailyOffer.server.model} - ${dailyOffer.discountPercent}%`);
                    });

                    setDailyOffers(dailyOffers);
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
