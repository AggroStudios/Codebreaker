import clsx from 'clsx';
import { Component, createSignal } from 'solid-js';
import { Box, Card, CardContent, CardHeader, LinearProgress, styled, Typography } from '@suid/material';
import type { LinearProgressProps } from '@suid/material/LinearProgress';

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

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>
    );
  }

const CipherBreak: Component<{ station: StationStoreType, width: number, cipher?: Cipher, newCipher: () => void }> = (props) => {
    

    const [grid, setGrid] = createSignal<IGridItem[]>([]);
    const [progress, setProgress] = createSignal<number>(0);

    const { station, width, cipher, newCipher } = props;
    const { cpu, memory } = station;

    console.log(cpu.flops, cpu.cores, memory.capacity, cipher?.id);

    cipher?.setGrid((grid: IGridItem[], p: number) => {
        setGrid(grid);
        console.log('progress', p);
        if (p !== progress()) {
            setProgress(p);
        }
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
                {grid().length > 0 && <div class="progress">
                    <LinearProgressWithLabel variant="determinate" value={progress()} />
                </div>}
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
