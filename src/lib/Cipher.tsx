import { CipherState, ICipherType } from '../includes/Cipher.interface';
import Process, { IProcessorType, StationStoreType } from '../includes/Process.interface';
import OperatingSystem from '../lib/OperatingSystem';
import { Networking } from '../data/network';
import { dataSizeFromSuffix } from './utils';

export interface CipherDelegate {
    setGrid: (chars: Uint8Array, classes: Uint8Array) => void;
    setProgress: (progress: number) => void;
    setState: (state: CipherState) => void;
    completeCipher: (cipher: Cipher, state: CipherState) => void;
    downloadTick: (frame: number) => void;
}

export default class Cipher implements Process {
    private readonly characters =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()/\\-=+,.<>;:';
    private _chars: Uint8Array;
    private _classes: Uint8Array;
    private _delegate: CipherDelegate;
    private unsolvedIndexes: Set<number> = new Set();
    private width: number;
    private height: number;
    private cssClasses: string[];
    private _id: string;
    private downloadedBlocks: number = 0;
    private frame: number = 0;
    private _stationOs: OperatingSystem;
    private _stationNet: Networking;
    private _stationProcessor: IProcessorType;
    private _cipherType: ICipherType;
    private cipherSize: number;
    private _state: CipherState = CipherState.DOWNLOADING;
    private _previousState: CipherState | undefined = undefined;
    private _paused: boolean = false;
    private _percentUse: number = 0;
    private _failureRate: number = 0.00001;

    constructor(
        width: number,
        height: number,
        cssClasses: string[],
        cipherType: ICipherType,
        station: StationStoreType,
        delegate: CipherDelegate,
    ) {
        this.width = width;
        this.height = height;
        this.cssClasses = cssClasses;
        this._id = crypto.randomUUID();
        this._stationOs = station.os;
        this._stationNet = station.network;
        this._stationProcessor = station.cpu;
        this._cipherType = cipherType;
        this.cipherSize = dataSizeFromSuffix({
            size: cipherType.block.size,
            unit: cipherType.block.unit,
        });
        this._delegate = delegate;
        this._chars = new Uint8Array(width * height);
        this._classes = new Uint8Array(width * height);

        for (let i = 0; i < this.width * this.height; i++) {
            this.unsolvedIndexes.add(i);
        }

        this._stationOs.addProcess(this);
        this._stationNet.addProcess(this);
        this.state = this._state;
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

    public set delegate(value: CipherDelegate) {
        this._delegate = value;
    }

    public reset() {
        this._delegate.setGrid(new Uint8Array(0), new Uint8Array(0));
        this._delegate.setProgress(0);
        this.state = CipherState.IDLE;
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

    public fail() {
        this._paused = false;
        this.state = CipherState.FAILURE;
    }

    private set state(value: CipherState) {
        this._state = value;
        this._delegate.setState(value);
    }

    public set progress(value: number) {
        this._delegate.setProgress(value);
    }

    private randomizeGrid() {
        const total = this.width * this.height;
        const charCount = this.characters.length;
        const classCount = this.cssClasses.length;
        for (let i = 0; i < total; i++) {
            if (this.unsolvedIndexes.has(i)) {
                this._chars[i] = Math.floor(Math.random() * charCount);
                this._classes[i] = Math.floor(Math.random() * classCount);
            }
        }
        this._delegate.setGrid(this._chars, this._classes);
    }

    private breaking() {
        this._percentUse = 100;

        // Manual-mode ciphers are solved by the player via a minigame
        if (this._cipherType.manualMode?.length) return;

        // Fail the cipher with a chance of this._failureRate
        if (Math.random() < this._failureRate) {
            this.fail();
            return;
        }

        const complexity = Math.round(10 * this._cipherType.complexity);
        if (this.frame > 0 && this.frame % parseFloat((complexity / this._stationProcessor.gigaflops).toFixed(3)) === 0) {
            const targetPos = Math.floor(
                Math.random() * this.unsolvedIndexes.size,
            );
            let solvedIndex = 0;
            let pos = 0;
            for (const idx of this.unsolvedIndexes) {
                if (pos === targetPos) {
                    solvedIndex = idx;
                    break;
                }
                pos++;
            }
            // '0' = index 73, '1' = index 74 in CHAR_SET; class 4 = 'broken'
            this._chars[solvedIndex] = 73 + Math.round(Math.random());
            this._classes[solvedIndex] = 4;
            this.unsolvedIndexes.delete(solvedIndex);
            this.progress = Math.floor(
                ((this.width * this.height - this.unsolvedIndexes.size) /
                    (this.width * this.height)) *
                    100,
            );
        }

        if (this.frame > 0 && this.frame % 5 === 0) {
            this.randomizeGrid();
        }

        if (this.unsolvedIndexes.size === 0) {
            this.randomizeGrid();
            this.state = CipherState.SUCCESS;
        }
    }

    public manualComplete() {
        this.progress = 100;
        this.state = CipherState.SUCCESS;
    }

    private downloading() {
        this._percentUse = 50;
        this._delegate.downloadTick(this.frame);
        if (this.frame > 0 && this.frame % 10 === 0) {
            this.downloadedBlocks +=
                this._stationNet.network.speedInBps /
                this._stationNet.stack.length;
            this.progress = Math.floor(
                (this.downloadedBlocks / this.cipherSize) * 100,
            );
        }

        if (this.downloadedBlocks >= this.cipherSize) {
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
                this._delegate.completeCipher(this, CipherState.SUCCESS);
                break;
            case CipherState.CANCELLED:
                this._stationOs.removeProcess(this);
                this._stationNet.removeProcess(this);
                this._delegate.completeCipher(this, CipherState.CANCELLED);
                break;
            case CipherState.FAILURE:
                this._stationOs.removeProcess(this);
                this._delegate.completeCipher(this, CipherState.FAILURE);
                break;
        }
    }
}
