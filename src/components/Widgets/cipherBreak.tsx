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

import Cipher from '../../lib/Cipher';

import './styles.scss';
import { StationStoreType } from '../../includes/Process.interface';
import {
    CipherState,
    CipherTypes,
    ICipherType,
} from '../../includes/Cipher.interface';

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
    newCipher: (cipherType: ICipherType) => void;
    onComplete?: (cipher: Cipher, cancelled: boolean) => void;
    removeCipher?: (cipher: Cipher) => void;
    updateCipher?: (cipher: Cipher) => void;
}

interface CipherBreakOptions {
    station: StationStoreType;
    width: number;
    cipher?: Cipher;
    functions?: CipherBreakFunctions;
}

export default memo(function CipherBreak(props: CipherBreakOptions) {
    const cardRef = useRef<HTMLDivElement | null>(null);

    const [grid, setGrid] = useState<IGridItem[]>([]);
    const [progress, setProgress] = useState(0);
    const [cipherType, setCipherType] = useState<ICipherType | undefined>(
        undefined,
    );
    const [cipherState, setCipherState] = useState<CipherState | undefined>(
        undefined,
    );
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);

    const { width, cipher, functions, station } = props;
    const { newCipher, onComplete, removeCipher, updateCipher } =
        functions ?? {};

    // Keep current cipherType available to the completion callback without
    // re-subscribing every render.
    const cipherTypeRef = useRef<ICipherType | undefined>(undefined);
    useEffect(() => {
        cipherTypeRef.current = cipherType;
    }, [cipherType]);

    useEffect(() => {
        if (!cipher) return;

        cipher.setProgress((p, type, state) => {
            setProgress((prev) => (p !== prev ? p : prev));
            setCipherType((prev) => (type !== prev ? type : prev));
            setCipherState((prev) => (state !== prev ? state : prev));
        });

        cipher.setGrid((next: IGridItem[]) => {
            setGrid(next);
        });

        cipher.setCompleteCipher((c: Cipher, cancelled: boolean) => {
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
                onComplete?.(c, cancelled);
            }, 1000);
        });
    }, [cipher, onComplete, station]);

    const handleRemoveCipher = () => {
        if (cipher) removeCipher?.(cipher);
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
        const cType = CipherTypes.find(
            (t) => t.name === event.target.value,
        );
        if (cType && cType.name !== cipherType?.name) {
            if (cipher) removeCipher?.(cipher);
            newCipher(cType);
        }
    };

    const handleRestartCipher = () => {
        if (cipher) updateCipher?.(cipher);
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
