import clsx from 'clsx';
import { Component, createSignal, JSX, onMount } from 'solid-js';
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
    Typography,
    CardActions,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Menu,
    MenuItem
} from '@suid/material';
import type { LinearProgressProps } from '@suid/material/LinearProgress';

import { AddTwoTone, CodeTwoTone, InfoTwoTone, PauseTwoTone, PlayArrowTwoTone } from '@suid/icons-material';
import IconButton from '@suid/material/IconButton';

import Cipher from "../../lib/Cipher";

import './styles.scss';
import { StationStoreType } from '../../includes/Process.interface';
import { CipherState, ICipherType, CipherTypes } from '../../includes/Cipher.interface';

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
    newCipher: (cipherType: ICipherType) => void;
    onComplete?: (cipher: Cipher) => void;
};

const CipherBreak: Component<CipherBreakOptions> = (props) => {

    let cardRef: HTMLElement | undefined = undefined;

    const [grid, setGrid] = createSignal<IGridItem[]>([]);
    const [progress, setProgress] = createSignal<number>(0);
    const [cipherType, setCipherType] = createSignal<ICipherType|undefined>(undefined);
    const [cipherState, setCipherState] = createSignal<CipherState|undefined>(undefined);
    const [cancelDialogOpen, setCancelDialogOpen] = createSignal<boolean>(false);
    const [infoDialogOpen, setInfoDialogOpen] = createSignal<boolean>(false);
    const [cipherMenuAnchorEl, setCipherMenuAnchorEl] = createSignal<null | HTMLElement>(null);

    const { width, cipher, newCipher, station, onComplete } = props;

    const isCipherMenuOpen = () => Boolean(cipherMenuAnchorEl());

    const handleCipherMenuOpen: JSX.EventHandler<HTMLElement, MouseEvent> = event => {
        setCipherMenuAnchorEl(event.currentTarget);
    }

    const handleCipherMenuClose = () => {
        setCipherMenuAnchorEl(null);
    }

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

    const handleInfoDialogOpen = () => {
        setInfoDialogOpen(true);
    }

    const handleInfoDialogClose = () => {
        setInfoDialogOpen(false);
    }

    const handleCancelDialogOpen = () => {
        setCancelDialogOpen(true);
        cipher?.pause();
    }

    const handleCancelDialogClose = () => {
        setCancelDialogOpen(false);
        cipher?.resume();
    }
    
    const cancelCipher = () => {
        setCancelDialogOpen(false);
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
                    subheader={cipherType()?.name ?? 'Idle'}
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
                            <IconButton onClick={handleCipherMenuOpen}>
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
                </CardContent>
                {[CipherState.BREAKING, CipherState.DOWNLOADING, CipherState.PAUSED].includes(cipherState()) && <CardActions disableSpacing sx={{ marginLeft: '40px' }}>
                    <Button onClick={handleCancelDialogOpen} variant="contained" color="error" class='rightAlign'>Cancel</Button>
                    <IconButton onClick={handleInfoDialogOpen}><InfoTwoTone /></IconButton>
                </CardActions>}
            </Card>
            <Dialog open={cancelDialogOpen()} onClose={handleCancelDialogClose}>
                <DialogTitle>Cancel Cipher?</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to cancel this process? You will not be able to recover the data you already downloaded and will not be rewarded any experience or money.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelCipher} variant="contained" color="success">Yes</Button>
                    <Button onClick={handleCancelDialogClose} variant="contained" color="primary">No</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={infoDialogOpen()} onClose={handleInfoDialogClose}>
                <DialogTitle>Cipher Information</DialogTitle>
                <DialogContent>
                    <Table sx={{ minWidth: 500 }} size="small">
                        <TableBody>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell sx={{ width: '100%' }}>{cipherType()?.name}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Complexity</TableCell>
                                <TableCell>{cipherType()?.complexity}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Parallelism</TableCell>
                                <TableCell>{cipherType()?.parallelism}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Block Size</TableCell>
                                <TableCell>{cipherType()?.block.size} {cipherType()?.block.unit}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Payout</TableCell>
                                <TableCell>${cipherType()?.payout}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>XP</TableCell>
                                <TableCell>{cipherType()?.xp} XP</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleInfoDialogClose} variant="contained" color="primary">Close</Button>
                </DialogActions>
            </Dialog>
            <Menu
                anchorEl={cipherMenuAnchorEl()}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                id={`${cipher?.id}-menu`}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={isCipherMenuOpen()}
                onClose={handleCipherMenuClose}
            >
                {CipherTypes.map(cipherType => <MenuItem onClick={() => {
                    newCipher(cipherType);
                }}>{cipherType.name}</MenuItem>)}
            </Menu>
        </>
    )
}

/*    {
        name: 'Cipher 1',
        complexity: 1,
        parallelism: 1,
        block: {
            size: 1024,
            unit: BlockUnit.megabytes,
        },
        payout: 100,
        xp: 10,
    },*/

export default CipherBreak;
