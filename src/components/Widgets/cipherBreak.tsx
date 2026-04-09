import clsx from 'clsx';
import { Component, createSignal, onMount } from 'solid-js';
import { Box, Card, CardContent, CardHeader, LinearProgress, styled, Typography } from '@suid/material';
import type { LinearProgressProps } from '@suid/material/LinearProgress';

import { AddTwoTone } from '@suid/icons-material';
import IconButton from '@suid/material/IconButton';

import Cipher from "../../lib/Cipher";

import './styles.scss';
import { StationStoreType } from '../../includes/Process.interface';
import { ICipherType } from '../../includes/Cipher.interface';

const CipherContainer = styled('div')({
    display: 'grid'
});

interface IGridItem {
    character: string;
    cssClass: string;
}

enum CipherState {
    IDLE = undefined,
    DOWNLOADING = 'Downloading',
    BREAKING = 'Breaking',
    SUCCESS = 'Success',
    FAILURE = 'Failure',
    PAUSED = 'Paused',
}

function LinearProgressWithLabel(props: LinearProgressProps & { value: number, label?: string }) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {props.label && <Box sx={{ minWidth: 65, textAlign: 'left' }}>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >{props.label}</Typography>
        </Box>}
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

interface CipherBreakOptions {
    station: StationStoreType;
    width: number;
    cipher?: Cipher;
    newCipher: () => void;
    onComplete?: (cipher: Cipher, cipherType: ICipherType, cancelled: boolean) => void;
};

const CipherBreak: Component<CipherBreakOptions> = (props) => {

    let cardRef: HTMLElement | undefined = undefined;

    const [grid, setGrid] = createSignal<IGridItem[]>([]);
    const [progress, setProgress] = createSignal<number>(0);
    const [cipherType, setCipherType] = createSignal<ICipherType|undefined>(undefined);
    const [label, setLabel] = createSignal<CipherState>(CipherState.IDLE);

    const { width, cipher, newCipher } = props;

    onMount(() => {
        cipher?.setGrid((grid: IGridItem[], ct: ICipherType, p: number) => {
            setGrid(grid);
            setCipherType(ct);
            setLabel(CipherState.BREAKING);
            if (p !== progress()) {
                setProgress(p);
            }
        });

        cipher?.setCompleteCipher((c: Cipher, cancelled: boolean) => {
            setLabel(CipherState.SUCCESS);
            cardRef?.classList.add('success');
            cardRef?.classList.remove('background');
            setTimeout(() => {
                cardRef?.classList.add('background');
                cardRef?.classList.remove('success');
                props.onComplete?.(c, cipherType(), cancelled);
                setCipherType(undefined);
            }, 1000);
        });
    });
    
    return (
        <Card ref={el => cardRef = el} class="background">
            <CardHeader
                title='Cipher Break'
                subheader={cipherType()?.name}
                action={
                    <IconButton onClick={newCipher}>
                        <AddTwoTone />
                    </IconButton>
                }
            />
            <CardContent>
                {grid().length > 0 && <div class="progress">
                    <LinearProgressWithLabel variant="determinate" value={progress()} label={label()?.toString()} />
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
