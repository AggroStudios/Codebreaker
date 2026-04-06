import Process from "../includes/Process.interface";

interface IGridItem {
    character: string;
    cssClass: string;
}

export default class Cipher implements Process {

    private readonly characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()/\\-=+,.<>;:';
    private _characterGrid: IGridItem[] = [];
    private _setGrid: ((grid: IGridItem[]) => void) | undefined = undefined;
    private width: number;
    private height: number;
    private cssClasses: string[];
    private _id: string;

    constructor(width: number, height: number, cssClasses: string[], setGrid?: ((grid: IGridItem[]) => void) | undefined) {
        this.width = width;
        this.height = height;
        this.cssClasses = cssClasses;
        this._setGrid = setGrid;
        this._id = crypto.randomUUID();

        console.log('Cipher constructed!');
    }

    public get characterGrid() {
        return this._characterGrid;
    }

    private generateGrid(): IGridItem[] {
        const rndGrid = [];
        for (let i = 0; i < (this.width * this.height); i++) {
            const cssClassIndex = Math.floor(Math.random() * this.cssClasses.length);
            const charIndex = Math.floor(Math.random() * this.characters.length);
            rndGrid.push({
                character: this.characters[charIndex],
                cssClass: this.cssClasses[cssClassIndex],
            });
        }
        console.log('generateGrid', rndGrid);
        return rndGrid;
    }

    private randomizeGrid() {
        this._setGrid?.(this.generateGrid());
    }

    public get id() {
        return `cipher-${this._id}`;
    }

    public setGrid(fn: ((grid: IGridItem[]) => void)) {
        this._setGrid = fn;
    }

    public callback(_: number) {
        this.randomizeGrid();
        console.log(`Cipher ${this._id}:`, this._characterGrid);
    }
};