import { CipherState, ICipherType } from "../includes/Cipher.interface";
import Process, { StationStoreType } from "../includes/Process.interface";
import OperatingSystem from '../lib/OperatingSystem';
import { Networking } from "./network";
import { dataSizeFromSuffix } from "./utils";

interface IGridItem {
    character: string;
    cssClass: string;
}

export default class Cipher implements Process {

    private readonly characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()/\\-=+,.<>;:';
    private _characterGrid: IGridItem[] = [];
    private _setGrid: ((grid: IGridItem[]) => void) = () => {};
    private _setProgress: (progress: number, type: ICipherType, state: CipherState) => void = () => {};
    private unsolvedIndexes: number[] = [];
    private width: number;
    private height: number;
    private cssClasses: string[];
    private _id: string;
    private _completeCipher: (cipher: Cipher, cancelled: boolean) => void = () => {};
    private _progress: number = 0;
    private downloadedBlocks: number = 0;
    private frame: number = 0;
    private _stationOs: OperatingSystem;
    private _stationNet: Networking;
    private _cipherType: ICipherType;
    private cipherSize: number;
    private _state: CipherState = CipherState.DOWNLOADING;
    private _previousState: CipherState | undefined = undefined;

    constructor(width: number, height: number, cssClasses: string[], cipherType: ICipherType, station: StationStoreType) {
        this.width = width;
        this.height = height;
        this.cssClasses = cssClasses;
        this._id = crypto.randomUUID();
        this._stationOs = station.os;
        this._stationNet = station.network;
        this._cipherType = cipherType;
        this.cipherSize = dataSizeFromSuffix({ size: cipherType.block.size, unit: cipherType.block.unit });

        for (let i = 0; i < this.width * this.height; i++) {
            this.unsolvedIndexes.push(i);
        }

        this._stationOs.addProcess(this);
        this._stationNet.addProcess(this);
    }

    public get characterGrid() {
        return this._characterGrid;
    }

    public get id() {
        return `cipher-${this._id}`;
    }

    public get state() {
        return this._state;
    }

    public pause() {
        if ([CipherState.DOWNLOADING, CipherState.BREAKING].includes(this._state)) {
            this._previousState = this._state;
            this.state = CipherState.PAUSED;
        }
    }

    public resume() {
        if (this._previousState) {
            this.state = this._previousState;
            this._previousState = undefined;
        }
    }

    public cancel() {
        this.state = CipherState.CANCELLED;
    }

    private set state(value: CipherState) {
        this._state = value;
        this._setProgress(this._progress, this._cipherType, value);
    }

    private set progress(value: number) {
        this._progress = value;
        this._setProgress(value, this._cipherType, this._state);
    }

    private generateGrid(): IGridItem[] {
        const rndGrid = [];
        for (let i = 0; i < (this.width * this.height); i++) {
            if (this.unsolvedIndexes.includes(i)) {
                const cssClassIndex = Math.floor(Math.random() * this.cssClasses.length);
                const charIndex = Math.floor(Math.random() * this.characters.length);
                rndGrid.push({
                    character: this.characters[charIndex],
                    cssClass: this.cssClasses[cssClassIndex],
                });
            }
            else {
                rndGrid.push(this._characterGrid[i]);
            }
        }
        return rndGrid;
    }

    private randomizeGrid() {
        this._setGrid(this.generateGrid());
    }

    public setCompleteCipher(fn: (cipher: Cipher, cancelled: boolean) => void) {
        this._completeCipher = fn;
    }

    public setGrid(fn: ((grid: IGridItem[]) => void)) {
        this._setGrid = fn;
    }
    
    public setProgress(fn: (progress: number, type: ICipherType, state: CipherState) => void) {
        this._setProgress = fn;
        this._setProgress(this._progress, this._cipherType, this._state);
    }

    private breaking() {
        const complexity = Math.round(10 * this._cipherType.complexity);
        console.log('Complexity:', complexity);
        if (this.frame > 0 && this.frame % complexity === 0) {
            const solvedIndex = this.unsolvedIndexes[Math.floor(Math.random() * this.unsolvedIndexes.length)];
            const solvedValue = Math.round(Math.random());

            this._characterGrid[solvedIndex] = {
                character: solvedValue.toString(),
                cssClass: 'broken',
            };

            this.unsolvedIndexes.splice(this.unsolvedIndexes.indexOf(solvedIndex), 1);
            this.progress = Math.floor((this.width * this.height - this.unsolvedIndexes.length) / (this.width * this.height) * 100);

        }

        if (this.frame > 0 && this.frame % 10 === 0) {
            this.randomizeGrid();
        }

        if (this._progress >= 100) {
            console.log('Cipher breaking completed!');
            this.state = CipherState.SUCCESS;
        }
    }

    private downloading() {
        if (this.frame > 0 && this.frame % 10 === 0) {
            // calculate the amount of blocks downloaded, divided by the number of processes currently downloading.
            this.downloadedBlocks += (this._stationNet.network.speedInBps / this._stationNet.stack.length);
            this.progress = Math.floor(this.downloadedBlocks / this.cipherSize * 100);
        }

        if (this.downloadedBlocks >= this.cipherSize) {
            console.log('Cipher downloaded! Starting breaking...');
            this.state = CipherState.BREAKING;
            this.progress = 0;
            this._stationNet.removeProcess(this);
        }
    }

    public callback(_: number) {
        if (this._state === CipherState.PAUSED) return;

        this.frame++;
        switch (this._state) {
            case CipherState.DOWNLOADING:
                this.downloading();
                break;
            case CipherState.BREAKING:
                this.breaking();
                break;
            case CipherState.SUCCESS:
                this._stationOs.removeProcess(this);
                this._completeCipher(this, false);
                break;
            case CipherState.CANCELLED:
                this._stationOs.removeProcess(this);
                this._stationNet.removeProcess(this);
                this._completeCipher(this, true);
                break;
            case CipherState.FAILURE:
                throw new Error('Cipher failed!');
        }
    }
};