import Process from '../includes/Process.interface';
import { Server } from '../includes/Servers.interface';
import { DailyDeal, useServersStore, ServersStoreState } from '../stores/servers';

import Servers from '../data/servers';

const MAX_DISCOUNT_PERCENT = 30;
const MIN_DAILY_DEAL_DISCOUNT_PERCENT = 15;
const MIN_DISCOUNT_PERCENT = 10;

const MIN_DAILY_OFFER_COUNT = 1;
const MAX_DAILY_OFFER_COUNT = 8;

export default class ServersDailyOffers implements Process {

    private _servers: Server[];
    private _serversStore: ServersStoreState;

    constructor() {
        this._servers = Servers;
        this._serversStore = useServersStore.getState();
    }

    public get id() {
        return 'servers-daily-offers';
    }

    private _generateDailyDeal(server: Server): DailyDeal {
        return {
            server: server,
            discountPercent: Math.floor(Math.random() * (MAX_DISCOUNT_PERCENT - MIN_DAILY_DEAL_DISCOUNT_PERCENT + 1)) + MIN_DAILY_DEAL_DISCOUNT_PERCENT,
        };
    }

    private _generateDailyOffer(server: Server): DailyDeal {
        return {
            server: server,
            discountPercent: Math.floor(Math.random() * (MAX_DISCOUNT_PERCENT - MIN_DISCOUNT_PERCENT + 1)) + MIN_DISCOUNT_PERCENT,
        };
    }

    public generateDailyOffers() {

        const dailyDeal = Math.floor(Math.random() * this._servers.length);
        const selectedServer = this._servers.splice(dailyDeal, 1)[0];
        this._serversStore.setDailyDeal(this._generateDailyDeal(selectedServer));

        const nbDailyOffers = Math.floor(Math.random() * (MAX_DAILY_OFFER_COUNT - MIN_DAILY_OFFER_COUNT + 1)) + MIN_DAILY_OFFER_COUNT;

        const dailyOffers: DailyDeal[] = [];
        for (let i = 0; i < nbDailyOffers; i++) {
            const selectedServer = this._servers.splice(Math.floor(Math.random() * this._servers.length), 1)[0];
            dailyOffers.push(this._generateDailyOffer(selectedServer));
        }

        this._serversStore.setDailyOffers(dailyOffers);
    }

    public callback() {
        // Every day at 00:00:00, generate a new daily offer for each server
        if (new Date().getHours() === 0 && new Date().getMinutes() === 0 && new Date().getSeconds() === 0) {
            this.generateDailyOffers();
        }
    }
}