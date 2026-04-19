import clsx from 'clsx';
import { memo, useEffect, useRef, useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    LinearProgress,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
    type LinearProgressProps,
    type SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import {
    CodeTwoTone,
    InfoTwoTone,
    PauseTwoTone,
    PlayArrowTwoTone,
    ReplayOutlined,
} from '@mui/icons-material';

import Cipher, { CipherDelegate } from '../../lib/Cipher';

import './styles.scss';
import { StationStoreType } from '../../includes/Process.interface';
import {
    CipherState,
    CipherTypes,
    ICipherType,
} from '../../includes/Cipher.interface';
import { NotificationLevel } from '../../includes/OperatingSystem.interface';
import { useNotifier } from '../Notifier';

const CipherContainer = styled('div')({
    display: 'grid',
    marginBottom: '12px',
});

interface IGridItem {
    character: string;
    cssClass: string;
}

function LinearProgressWithLabel(
    props: LinearProgressProps & { value: number; label?: string },
) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {props.label && (
                <Box sx={{ minWidth: 75, textAlign: 'left' }}>
                    <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                    >
                        {props.label}
                    </Typography>
                </Box>
            )}
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

export interface CipherBreakFunctions {
    addProcess?: (id: string) => void;
    removeProcess?: (id: string) => void;
}

interface CipherBreakOptions {
    station: StationStoreType;
    width: number;
    id?: string;
    functions?: CipherBreakFunctions;
}

const cssClasses = ['breaking-1', 'breaking-2', 'breaking-3', 'breaking-4'];

export default memo(function CipherBreak(props: CipherBreakOptions) {
    const cardRef = useRef<HTMLDivElement | null>(null);

    const [grid, setGrid] = useState<IGridItem[]>([]);
    const [progress, setProgress] = useState(0);
    const [cipher, setCipher] = useState<Cipher | undefined>(undefined);
    const [cipherType, setCipherType] = useState<ICipherType | undefined>(undefined);
    const [cipherState, setCipherState] = useState<CipherState | undefined>(undefined);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);

    const { width, functions, station, id } = props;
    const { addProcess, removeProcess } = functions;
    const { notify } = useNotifier();

    // Keep current cipherType available to the completion callback without
    // re-subscribing every render.
    const cipherTypeRef = useRef<ICipherType | undefined>(undefined);
    useEffect(() => {
        cipherTypeRef.current = cipherType;
    }, [cipherType]);

    const cipherDelegate: CipherDelegate = {
        setGrid: (grid: IGridItem[]) => {
            setGrid(grid);
        },
        setProgress: (progress: number, type: ICipherType, state: CipherState) => {
            setProgress((prev) => (progress !== prev ? progress : prev));
            setCipherType((prev) => (type !== prev ? type : prev));
            setCipherState((prev) => (state !== prev ? state : prev));
        },
        completeCipher: (cancelled: boolean) => {
            cardRef.current?.classList.remove('background');
            if (!cancelled) {
                setCipherState(CipherState.SUCCESS);
                cardRef.current?.classList.add('cipher-success');
                station.os?.player.earnExperience(
                    cipherTypeRef.current?.xp ?? 0,
                );
                station.os?.player.addMoney(
                    cipherTypeRef.current?.payout ?? 0,
                );
            } else {
                setCipherState(CipherState.CANCELLED);
                cardRef.current?.classList.add('cipher-error');
            }
            setTimeout(() => {
                setCipherState(CipherState.IDLE);
                cardRef.current?.classList.add('background');
                cardRef.current?.classList.remove('cipher-success');
                cardRef.current?.classList.remove('cipher-error');
                setGrid([]);
            }, 1000);
        },
    };

    const handleAddCipher = (cipherType: ICipherType) => {
        try {
            const c = new Cipher(20, 10, cssClasses, cipherType, station, cipherDelegate);
            console.log('Cipher:', c);
            setCipher(c);
            !id && addProcess?.(crypto.randomUUID());
        } catch {
            const message = `Not enough cores available to add process '${cipherType.name}'.`;
            notify({ level: 'error', message });
            station.os?.sendNotification(
                message,
                NotificationLevel.ERROR,
            );
        }
    };

    const handleRemoveCipher = () => {
        removeProcess?.(id);
    };

    const handleInfoDialogOpen = () => setInfoDialogOpen(true);
    const handleInfoDialogClose = () => setInfoDialogOpen(false);

    const handleCancelDialogOpen = () => {
        setCancelDialogOpen(true);
        cipher?.pause();
    };

    const handleCancelDialogClose = () => {
        setCancelDialogOpen(false);
        cipher?.resume();
    };

    const cancelCipher = () => {
        setCancelDialogOpen(false);
        cipher?.cancel();
    };

    const pauseCipher = () => cipher?.pause();
    const resumeCipher = () => cipher?.resume();

    const handleCipherChange = (event: SelectChangeEvent<string>) => {
        console.log('Cipher type:', event.target.value);
        handleAddCipher(CipherTypes.find(t => t.name === event.target.value) as ICipherType);
    };

    const handleRestartCipher = () => {
        handleAddCipher(cipherType as ICipherType);
    };

    const isBreakingOrDownloading =
        cipherState !== undefined &&
        [CipherState.BREAKING, CipherState.DOWNLOADING].includes(cipherState);

    const canShowActions =
        cipherState !== undefined &&
        [
            CipherState.BREAKING,
            CipherState.DOWNLOADING,
            CipherState.PAUSED,
            CipherState.IDLE,
        ].includes(cipherState);

    return (
        <>
            <Card ref={cardRef} className="background">
                <CardHeader
                    avatar={
                        <Avatar>
                            <CodeTwoTone />
                        </Avatar>
                    }
                    title="Cipher Break"
                    slotProps={{
                        title: { variant: 'h5', noWrap: true },
                    }}
                    subheader={cipherType?.name ?? 'Idle'}
                    action={
                        <>
                            {isBreakingOrDownloading &&
                                cipherState !== CipherState.PAUSED && (
                                    <IconButton onClick={pauseCipher}>
                                        <PauseTwoTone />
                                    </IconButton>
                                )}
                            {cipherState === CipherState.PAUSED && (
                                <IconButton onClick={resumeCipher}>
                                    <PlayArrowTwoTone />
                                </IconButton>
                            )}
                            <Select
                                variant="standard"
                                className="cipher-select"
                                displayEmpty
                                disabled={cipherState !== CipherState.IDLE}
                                value={cipherType?.name ?? ''}
                                onChange={handleCipherChange}
                                renderValue={(selected) => {
                                    if (!selected) {
                                        return <em>Select</em>;
                                    }
                                    return selected;
                                }}
                            >
                                {CipherTypes.map((type) => (
                                    <MenuItem key={type.name} value={type.name}>
                                        {type.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {cipherType?.name && (
                                <IconButton
                                    onClick={handleRestartCipher}
                                    disabled={
                                        cipherState !== CipherState.IDLE
                                    }
                                >
                                    <ReplayOutlined />
                                </IconButton>
                            )}
                        </>
                    }
                />
                <CardContent className="centerContent">
                    {cipherState && cipherState !== CipherState.IDLE && (
                        <div className="progress">
                            <LinearProgressWithLabel
                                variant="determinate"
                                value={progress}
                                label={cipherState?.toString()}
                            />
                        </div>
                    )}
                    {grid.length > 0 && (
                        <CipherContainer
                            style={{
                                gridTemplateColumns: `repeat(${width}, ${100 / width}%)`,
                            }}
                        >
                            {grid.map((char, index) => (
                                <div key={index} className={clsx(char.cssClass)}>
                                    {char.character}
                                </div>
                            ))}
                        </CipherContainer>
                    )}
                </CardContent>
                {cipher && canShowActions && (
                    <CardActions
                        disableSpacing
                        sx={{ marginLeft: '40px' }}
                    >
                        {cipherState !== CipherState.IDLE && (
                            <Button
                                onClick={handleCancelDialogOpen}
                                variant="contained"
                                color="error"
                                className="centerAlign"
                            >
                                Cancel
                            </Button>
                        )}
                        {cipherState === CipherState.IDLE && (
                            <Button
                                onClick={handleRemoveCipher}
                                variant="contained"
                                color="primary"
                                className="centerAlign"
                            >
                                Delete
                            </Button>
                        )}
                        <IconButton onClick={handleInfoDialogOpen}>
                            <InfoTwoTone />
                        </IconButton>
                    </CardActions>
                )}
            </Card>
            <Dialog
                open={cancelDialogOpen}
                onClose={handleCancelDialogClose}
            >
                <DialogTitle>Cancel Cipher?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to cancel this process? You will
                        not be able to recover the data you already downloaded
                        and will not be rewarded any experience or money.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={cancelCipher}
                        variant="contained"
                        color="success"
                    >
                        Yes
                    </Button>
                    <Button
                        onClick={handleCancelDialogClose}
                        variant="contained"
                        color="primary"
                    >
                        No
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={infoDialogOpen} onClose={handleInfoDialogClose}>
                <DialogTitle>Cipher Information</DialogTitle>
                <DialogContent>
                    <Table sx={{ minWidth: 500 }} size="small">
                        <TableBody>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell sx={{ width: '100%' }}>
                                    {cipherType?.name}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Complexity</TableCell>
                                <TableCell>{cipherType?.complexity}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Parallelism</TableCell>
                                <TableCell>
                                    {cipherType?.parallelism} cores
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Block Size</TableCell>
                                <TableCell>
                                    {cipherType?.block.size}{' '}
                                    {cipherType?.block.unit}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Payout</TableCell>
                                <TableCell>${cipherType?.payout}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>XP</TableCell>
                                <TableCell>{cipherType?.xp} XP</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleInfoDialogClose}
                        variant="contained"
                        color="primary"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
});
