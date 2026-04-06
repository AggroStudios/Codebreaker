import Process from "../includes/Process.interface";

interface IGridItem {
    character: string;
    cssClass: string;
}

export default class Cipher implements Process {

    private readonly characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()/\\-=+,.<>;:';
    private _characterGrid: IGridItem[] = [];
    private _setGrid: ((grid: IGridItem[], progress: number) => void) | undefined = undefined;
    private unsolvedIndexes: number[] = [];
    private width: number;
    private height: number;
    private cssClasses: string[];
    private _id: string;
    private _completeCipher: (cipher: Cipher, cancelled: boolean) => void;
    private progress: number = 0;
    private frame: number = 0;

    constructor(width: number, height: number, cssClasses: string[], completeCipher: (cipher: Cipher, cancelled: boolean) => void, setGrid?: ((grid: IGridItem[], progress: number) => void) | undefined) {
        this.width = width;
        this.height = height;
        this.cssClasses = cssClasses;
        this._setGrid = setGrid;
        this._id = crypto.randomUUID();
        this._completeCipher = completeCipher;

        for (let i = 0; i < this.width * this.height; i++) {
            this.unsolvedIndexes.push(i);
        }

        console.log('Cipher constructed!');
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
        this._setGrid?.(this.generateGrid(), this.progress);
    }

    public get id() {
        return `cipher-${this._id}`;
    }

    public setGrid(fn: ((grid: IGridItem[], progress: number) => void)) {
        this._setGrid = fn;
    }

    public callback(_: number) {
        this.randomizeGrid();
        this.frame++;
        if (this.frame > 0 && this.frame % 5 === 0) {
            console.log(`Cipher ${this._id}: progress ${this.progress}%`);
            
            const solvedIndex = this.unsolvedIndexes[Math.floor(Math.random() * this.unsolvedIndexes.length)];
            const solvedValue = Math.round(Math.random());

            this._characterGrid[solvedIndex] = {
                character: solvedValue.toString(),
                cssClass: 'broken',
            }

            this.unsolvedIndexes.splice(this.unsolvedIndexes.indexOf(solvedIndex), 1);
            console.log(`Solved Index: ${solvedIndex}, Unsolved indexes:`, this.unsolvedIndexes);
            this.progress = Math.floor((this.width * this.height - this.unsolvedIndexes.length) / (this.width * this.height) * 100);
        }

        if (this.progress >= 100) {
            this._completeCipher(this, false);
        }
    }
};