import { CipherState, ICipherType } from '../includes/Cipher.interface';
import Process, { StationStoreType } from '../includes/Process.interface';
import OperatingSystem from '../lib/OperatingSystem';
import { Networking } from './network';
import { dataSizeFromSuffix } from './utils';

interface IGridItem {
    character: string;
    cssClass: string;
}

export interface CipherDelegate {
    setGrid: (grid: IGridItem[]) => void;
    setProgress: (progress: number, type: ICipherType, state: CipherState) => void;
    completeCipher: (cancelled: boolean) => void;
}

export default class Cipher implements Process {
    private readonly characters =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()/\\-=+,.<>;:';
    private _characterGrid: IGridItem[] = [];
    private delegate: CipherDelegate;
    private unsolvedIndexes: Set<number> = new Set();
    private width: number;
    private height: number;
    private cssClasses: string[];
    private _id: string;
    private _progress: number = 0;
    private downloadedBlocks: number = 0;
    private frame: number = 0;
    private _stationOs: OperatingSystem;
    private _stationNet: Networking;
    private _cipherType: ICipherType;
    private cipherSize: number;
    private _state: CipherState = CipherState.DOWNLOADING;
    private _previousState: CipherState | undefined = undefined;
    private _paused: boolean = false;
    private _percentUse: number = 0;

    constructor(
        width: number,
        height: number,
        cssClasses: string[],
        cipherType: ICipherType,
        station: StationStoreType,
        delegate: CipherDelegate
    ) {
        this.width = width;
        this.height = height;
        this.cssClasses = cssClasses;
        this._id = crypto.randomUUID();
        this._stationOs = station.os;
        this._stationNet = station.network;
        this._cipherType = cipherType;
        this.cipherSize = dataSizeFromSuffix({
            size: cipherType.block.size,
            unit: cipherType.block.unit,
        });
        this.delegate = delegate;

        for (let i = 0; i < this.width * this.height; i++) {
            this.unsolvedIndexes.add(i);
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

    public get cipherType() {
        return this._cipherType;
    }

    public get cores() {
        return this._cipherType.parallelism;
    }

    public get state() {
        return this._state;
    }

    public get paused() {
        return this._paused;
    }

    public get percentUse() {
        return this._percentUse / 100;
    }

    public pause() {
        this._paused = true;
        if (
            [CipherState.DOWNLOADING, CipherState.BREAKING].includes(
                this._state,
            )
        ) {
            this._previousState = this._state;
            this.state = CipherState.PAUSED;
        }
    }

    public resume() {
        this._paused = false;
        if (this._previousState) {
            this.state = this._previousState;
            this._previousState = undefined;
        }
    }

    public cancel() {
        this._paused = false;
        this.state = CipherState.CANCELLED;
    }

    private set state(value: CipherState) {
        this._state = value;
        this.delegate.setProgress(this._progress, this._cipherType, value);
    }

    private set progress(value: number) {
        this._progress = value;
        this.delegate.setProgress(value, this._cipherType, this._state);
    }

    private generateGrid(): IGridItem[] {
        const rndGrid = [];
        for (let i = 0; i < this.width * this.height; i++) {
            if (this.unsolvedIndexes.has(i)) {
                const cssClassIndex = Math.floor(
                    Math.random() * this.cssClasses.length,
                );
                const charIndex = Math.floor(
                    Math.random() * this.characters.length,
                );
                rndGrid.push({
                    character: this.characters[charIndex],
                    cssClass: this.cssClasses[cssClassIndex],
                });
            } else {
                rndGrid.push(this._characterGrid[i]);
            }
        }
        return rndGrid;
    }

    private randomizeGrid() {
        this.delegate.setGrid(this.generateGrid());
    }

    private breaking() {
        this._percentUse = 100;
        const complexity = Math.round(10 * this._cipherType.complexity);
        if (this.frame > 0 && this.frame % complexity === 0) {
            const unsolvedArr = [...this.unsolvedIndexes];
            const solvedIndex =
                unsolvedArr[Math.floor(Math.random() * unsolvedArr.length)];
            const solvedValue = Math.round(Math.random());

            this._characterGrid[solvedIndex] = {
                character: solvedValue.toString(),
                cssClass: 'broken',
            };

            this.unsolvedIndexes.delete(solvedIndex);
            this.progress = Math.floor(
                ((this.width * this.height - this.unsolvedIndexes.size) /
                    (this.width * this.height)) *
                    100,
            );
        }

        if (this.frame > 0 && this.frame % 10 === 0) {
            this.randomizeGrid();
        }

        if (this.unsolvedIndexes.size === 0) {
            this.randomizeGrid();
            console.log('Cipher breaking completed!');
            this.state = CipherState.SUCCESS;
        }
    }

    private downloading() {
        this._percentUse = 50;
        if (this.frame > 0 && this.frame % 10 === 0) {
            // calculate the amount of blocks downloaded, divided by the number of processes currently downloading.
            this.downloadedBlocks +=
                this._stationNet.network.speedInBps /
                this._stationNet.stack.length;
            this.progress = Math.floor(
                (this.downloadedBlocks / this.cipherSize) * 100,
            );
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
                this.delegate.completeCipher(false);
                break;
            case CipherState.CANCELLED:
                console.log('Cipher cancelled!');
                this._stationOs.removeProcess(this);
                this._stationNet.removeProcess(this);
                this.delegate.completeCipher(true);
                break;
            case CipherState.FAILURE:
                throw new Error('Cipher failed!');
        }
    }
}
