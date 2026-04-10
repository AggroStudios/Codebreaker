import { ICipherType } from "../includes/Cipher.interface";
import Process from "../includes/Process.interface";
import OperatingSystem from '../lib/OperatingSystem';

interface IGridItem {
    character: string;
    cssClass: string;
}

export default class Cipher implements Process {

    private readonly characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()/\\-=+,.<>;:';
    private _characterGrid: IGridItem[] = [];
    private _setGrid: ((grid: IGridItem[], cipherType: ICipherType, progress: number) => void) = () => {};
    private unsolvedIndexes: number[] = [];
    private width: number;
    private height: number;
    private cssClasses: string[];
    private _id: string;
    private _completeCipher: (cipher: Cipher, cancelled: boolean) => void = () => {};
    private progress: number = 0;
    private frame: number = 0;
    private _stationOs: OperatingSystem;
    private _cipherType: ICipherType;

    constructor(width: number, height: number, cssClasses: string[], cipherType: ICipherType, stationOs: OperatingSystem) {
        this.width = width;
        this.height = height;
        this.cssClasses = cssClasses;
        this._id = crypto.randomUUID();
        this._stationOs = stationOs;
        this._cipherType = cipherType;

        for (let i = 0; i < this.width * this.height; i++) {
            this.unsolvedIndexes.push(i);
        }

        stationOs.addProcess(this);
    }

    public get characterGrid() {
        return this._characterGrid;
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
        this._setGrid(this.generateGrid(), this._cipherType, this.progress);
    }

    public get id() {
        return `cipher-${this._id}`;
    }

    public setCompleteCipher(fn: (cipher: Cipher, cancelled: boolean) => void) {
        this._completeCipher = fn;
    }

    public setGrid(fn: ((grid: IGridItem[], cipherType: ICipherType, progress: number) => void)) {
        this._setGrid = fn;
    }

    public callback(_: number) {
        this.frame++;
        if (this.frame > 0 && this.frame % 10 === 0) {
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
        
        if (this.progress >= 100) {
            this._stationOs.removeProcess(this);
            this._completeCipher(this, false);
        }
    }
};