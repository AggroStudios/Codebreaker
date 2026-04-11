import clsx from 'clsx';
import { Component, createSignal, onMount } from 'solid-js';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    styled,
    Typography
} from '@suid/material';
import type { LinearProgressProps } from '@suid/material/LinearProgress';

import { AddTwoTone, CodeTwoTone, PauseTwoTone, PlayArrowTwoTone } from '@suid/icons-material';
import IconButton from '@suid/material/IconButton';

import Cipher from "../../lib/Cipher";

import './styles.scss';
import { StationStoreType } from '../../includes/Process.interface';
import { CipherState, ICipherType } from '../../includes/Cipher.interface';

const CipherContainer = styled('div')({
    display: 'grid',
    marginBottom: '12px',
});

interface IGridItem {
    character: string;
    cssClass: string;
}

function LinearProgressWithLabel(props: LinearProgressProps & { value: number, label?: string }) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {props.label && <Box sx={{ minWidth: 75, textAlign: 'left' }}>
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
    onComplete?: (cipher: Cipher) => void;
};

const CipherBreak: Component<CipherBreakOptions> = (props) => {

    let cardRef: HTMLElement | undefined = undefined;

    const [grid, setGrid] = createSignal<IGridItem[]>([]);
    const [progress, setProgress] = createSignal<number>(0);
    const [cipherType, setCipherType] = createSignal<ICipherType|undefined>(undefined);
    const [cipherState, setCipherState] = createSignal<CipherState|undefined>(undefined);
    const [open, setOpen] = createSignal<boolean>(false);

    const { width, cipher, newCipher, station, onComplete } = props;

    onMount(() => {
        cipher?.setProgress((p: number, type: ICipherType, state: CipherState) => {
            if (p !== progress()) {
                setProgress(p);
            }
            if (type !== cipherType()) {
                setCipherType(type);
            }
            if (state !== cipherState()) {
                setCipherState(state);
            }
        });

        cipher?.setGrid((grid: IGridItem[]) => {
            setGrid(grid);
        });

        cipher?.setCompleteCipher((c: Cipher, cancelled: boolean) => {
            cardRef?.classList.remove('background');
            if (!cancelled) {
                setCipherState(CipherState.SUCCESS);
                cardRef?.classList.add('cipher-success');
                station.os.player.earnExperience(cipherType()?.xp ?? 0);
                station.os.player.addMoney(cipherType()?.payout ?? 0);
            }
            else {
                setCipherState(CipherState.CANCELLED);
                cardRef?.classList.add('cipher-error');
            }
            setTimeout(() => {
                cardRef?.classList.add('background');
                cardRef?.classList.remove('cipher-success');
                cardRef?.classList.remove('cipher-error');
                onComplete?.(c);
                setCipherType(undefined);
            }, 1000);
        });
    });

    const handleOpen = () => {
        setOpen(true);
        cipher?.pause();
    }

    const handleClose = () => {
        setOpen(false);
        cipher?.resume();
    }
    
    const cancelCipher = () => {
        setOpen(false);
        cipher?.cancel();
    }

    const pauseCipher = () => {
        cipher?.pause();
    }

    const resumeCipher = () => {
        cipher?.resume();
    }
    
    return (
        <>
            <Card ref={el => cardRef = el} class="background">
                <CardHeader
                    avatar={<Avatar><CodeTwoTone /></Avatar>}
                    title='Cipher Break'
                    titleTypographyProps={{
                        variant: 'h5',
                        noWrap: true,
                    }}
                    subheader={cipherType()?.name}
                    action={
                        <>
                            {([CipherState.BREAKING, CipherState.DOWNLOADING].includes(cipherState()) && cipherState() !== CipherState.PAUSED) &&
                            <IconButton onClick={pauseCipher}>
                                <PauseTwoTone />
                            </IconButton>}
                            {cipherState() === CipherState.PAUSED && 
                            <IconButton onClick={resumeCipher}>
                                <PlayArrowTwoTone />
                            </IconButton>}
                            <IconButton onClick={newCipher}>
                                <AddTwoTone />
                            </IconButton>
                        </>
                    }
                />
                <CardContent class="centerContent">
                    {cipherState() && <div class="progress">
                        <LinearProgressWithLabel variant="determinate" value={progress()} label={cipherState()?.toString()} />
                    </div>}
                    {grid().length > 0 && <CipherContainer style={{
                        'grid-template-columns': `repeat(${width}, ${100/width}%)`
                    }}>
                        {grid().map(char => <div class={clsx(char.cssClass)}>{char.character}</div>)}
                    </CipherContainer>}
                    {[CipherState.BREAKING, CipherState.DOWNLOADING, CipherState.PAUSED].includes(cipherState()) && <Button onClick={handleOpen} variant="contained" color="error">Cancel</Button>}
                </CardContent>
            </Card>
            <Dialog open={open()} onClose={handleClose}>
                <DialogTitle>Cancel Cipher?</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to cancel this process? You will not be able to recover the data you already downloaded and will not be rewarded any experience or money.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelCipher} variant="contained" color="success">Yes</Button>
                    <Button onClick={handleClose} variant="contained" color="primary">No</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default CipherBreak;
