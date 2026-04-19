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
import { useCipherBreakStore } from '../../stores/cipher';

const CipherContainer = styled('div')({
    display: 'grid',
    marginBottom: '12px',
});

const CipherGrid = memo(function CipherGrid({
    id,
    width,
}: {
    id: string;
    width: number;
}) {
    const grid = useCipherBreakStore((s) => s.grids[id]) ?? [];
    const gridTemplateColumns = `repeat(${width}, ${100 / width}%)`;
    if (grid.length === 0) return null;
    return (
        <CipherContainer style={{ gridTemplateColumns }}>
            {grid.map((char, index) => (
                <div key={index} className={clsx(char.cssClass)}>
                    {char.character}
                </div>
            ))}
        </CipherContainer>
    );
});

const CipherProgressBar = memo(function CipherProgressBar({
    id,
    cipherState,
}: {
    id: string;
    cipherState: CipherState | undefined;
}) {
    const progress = useCipherBreakStore((s) => s.progress[id]) ?? 0;
    if (!cipherState || cipherState === CipherState.IDLE) return null;
    return (
        <div className="progress">
            <LinearProgressWithLabel
                variant="determinate"
                value={progress}
                label={cipherState.toString()}
            />
        </div>
    );
});

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
    addProcess?: (id: string, type: ICipherType) => void;
    removeProcess?: (id: string) => void;
}

interface CipherBreakOptions {
    station: StationStoreType;
    width: number;
    id?: string;
    type?: ICipherType;
    functions?: CipherBreakFunctions;
}

const cssClasses = ['breaking-1', 'breaking-2', 'breaking-3', 'breaking-4'];

export default memo(function CipherBreak(props: CipherBreakOptions) {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const { width, functions, station, id, type } = props;
    const cipher = useCipherBreakStore((s) => (id ? s.ciphers[id] : undefined));
    const cipherType = useCipherBreakStore((s) => (id ? s.types[id] : undefined));
    const cipherState = useCipherBreakStore((s) => (id ? s.states[id] : undefined));
    const setCipher = useCipherBreakStore((s) => s.setCipher);
    const setGrid = useCipherBreakStore((s) => s.setGrid);
    const setProgress = useCipherBreakStore((s) => s.setProgress);
    const setType = useCipherBreakStore((s) => s.setType);
    const setState = useCipherBreakStore((s) => s.setState);

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);

    const { addProcess, removeProcess } = functions;
    const { notify } = useNotifier();

    // Bootstrap a cipher for this slot if one isn't already tracked in the
    // store. This runs on first mount AND on remount after tab switches, but
    // the `!cipher` guard ensures we don't recreate an in-flight cipher.
    useEffect(() => {
        if (!cipher && id && type) {
            handleAddCipher(type);
        }
    }, [id, type]);

    // Drive the success/error/idle card animations from the cipher state.
    // Keeping this here (rather than in the cipher delegate) means the
    // animations are re-applied correctly when the component remounts after
    // a tab switch.
    useEffect(() => {
        if (id) console.log('cipherState changed:', id, cipherState);
        const card = cardRef.current;
        if (!card) return;
        if (cipherState === CipherState.SUCCESS) {
            card.classList.remove('background');
            card.classList.add('cipher-success');
            card.classList.remove('cipher-error');
        } else if (cipherState === CipherState.CANCELLED) {
            card.classList.remove('background');
            card.classList.remove('cipher-success');
            card.classList.add('cipher-error');
        } else {
            card.classList.add('background');
            card.classList.remove('cipher-success');
            card.classList.remove('cipher-error');
        }
    }, [cipherState]);

    const handleAddCipher = (cipherType: ICipherType) => {
        if (!id) return;
        // Build the delegate using the store's stable setters (via
        // `getState()`), not React state setters. The cipher lives longer
        // than any single mount of this component (tab switches remount it),
        // so the delegate must not close over setState functions that belong
        // to an unmounted instance.
        const delegate: CipherDelegate = {
            setGrid: (g) => setGrid(id, g),
            setProgress: (p) => setProgress(id, p),
            setState: (s) => setState(id, s),
            completeCipher: (cipher: Cipher, cancelled: boolean) => {
                if (!cancelled) {
                    station.os?.player.earnExperience(cipherType.xp);
                    station.os?.player.addMoney(cipherType.payout);
                }
                setTimeout(() => {
                    cipher.reset();
                }, 1000);
            },
        };
        try {
            const c = new Cipher(20, 10, cssClasses, cipherType, station, delegate);
            setCipher(id, c);
            setType(id, cipherType);
        } catch {
            const message = `Not enough cores available to add process '${cipherType.name}'.`;
            notify({ level: 'error', message });
            removeProcess?.(id);
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
        const type = CipherTypes.find(t => t.name === event.target.value);
        if (id) {
            handleAddCipher(type);
        }
        else {
            addProcess?.(crypto.randomUUID(), type);
        }
    };

    const handleRestartCipher = () => {
        handleAddCipher(cipherType);
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
                    subheader={cipherState !== CipherState.IDLE ? cipherType?.name : cipherState}
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
                                disabled={id && cipherState !== CipherState.IDLE}
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
                    {id && (
                        <>
                            <CipherProgressBar id={id} cipherState={cipherState} />
                            <CipherGrid id={id} width={width} />
                        </>
                    )}
                </CardContent>
                {id && canShowActions && (
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
