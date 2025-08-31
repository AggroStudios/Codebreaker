import Process from "../includes/Process.interface";
import create from 'solid-zustand';

interface ICipherGrid {
    characterGrid: IGridItem[];
    setCharacterGrid(charactedGrid: IGridItem[]): void;
}

const cipherStore = create<ICipherGrid>(set => ({
    characterGrid: [],
    setCharacterGrid: (characterGrid: IGridItem[]) => set(() => ({ characterGrid })),
}));

interface IGridItem {
    character: string;
    cssClass: string;
}

export default class Cipher implements Process {

    private characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()/\\-=+,.<>;:';
    private _characterGrid?: IGridItem[];
    private _setCharacterGrid: (...args:unknown[]) => unknown;
    private width: number;
    private height: number;
    private cssClasses: string[];

    constructor(width: number, height: number, cssClasses: string[]) {
        const {
            characterGrid,
            setCharacterGrid
        } = cipherStore();

        this._characterGrid = characterGrid;
        this._setCharacterGrid = setCharacterGrid;
        this.width = width;
        this.height = height;
        this.cssClasses = cssClasses;

        console.log('Cipher constructed!');
    }

    public get characterGrid() {
        return this._characterGrid;
    }

    private randomizeGrid() {
        const rndGrid = [];
        for (let i = 0; i < (this.width * this.height); i++) {
            const cssClassIndex = Math.floor(Math.random() * this.cssClasses.length);
            const charIndex = Math.floor(Math.random() * this.characters.length);
            rndGrid.push({
                character: this.characters[charIndex],
                cssClass: this.cssClasses[cssClassIndex],
            });
        }
        this._setCharacterGrid(rndGrid);
    }

    public get id() {
        return 'cipher';
    }

    public callback(_: number) {
        this.randomizeGrid();
    }
};