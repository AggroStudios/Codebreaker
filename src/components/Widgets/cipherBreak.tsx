import clsx from 'clsx';
import { Component, createSignal } from 'solid-js';
import { Card, CardContent, CardHeader, styled } from '@suid/material';

import { AddTwoTone } from '@suid/icons-material';
import IconButton from '@suid/material/IconButton';

import Cipher from "../../lib/Cipher";

import './styles.scss';
import { StationStoreType } from '../../includes/Process.interface';

const CipherContainer = styled('div')({
    display: 'grid'
});

interface IGridItem {
    character: string;
    cssClass: string;
}

const CipherBreak: Component<{ station: StationStoreType, width: number, cipher?: Cipher, newCipher: () => void }> = (props) => {
    

    const [grid, setGrid] = createSignal<IGridItem[]>([]);

    const { station, width, cipher, newCipher } = props;
    const { cpu, memory } = station;

    console.log(cpu.flops, cpu.cores, memory.capacity, cipher?.id);

    cipher?.setGrid((grid: IGridItem[]) => {
        console.log('setGrid', grid);
        setGrid(grid);
    });
    
    return (
        <Card class="background">
            <CardHeader
                title='Cipher Break'
                action={
                    <IconButton onClick={newCipher}>
                        <AddTwoTone />
                    </IconButton>
                }
            />
            <CardContent>
                <CipherContainer style={{
                    'grid-template-columns': `repeat(${width}, ${100/width}%)`
                }}>
                    {grid().map(char => <div class={clsx(char.cssClass)}>{char.character}</div>)}
                </CipherContainer>
            </CardContent>
        </Card>
    )
}

export default CipherBreak;
