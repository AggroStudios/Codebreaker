import { ChangeEvent, useEffect, useRef, useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
    type LinearProgressProps,
} from '@mui/material';
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
    ICipherType,
} from '../../includes/Cipher.interface';
import { NotificationLevel } from '../../includes/OperatingSystem.interface';
import { useNotifier } from '../Notifier';
import { cipherGridRenderers, downloadTickHandlers, useCipherBreakStore } from '../../stores/cipher';
import { usePlayerStore } from '../../stores/player';
import { dataSizeFromSuffix, formatMoney } from '../../lib/utils';
import clsx from 'clsx';

import CipherGrid from '../CipherGrid';

function Stat({ label, value, accent }) {
    return (
      <div style={{
        padding: '10px 12px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
        }}>{label}</div>
        <div style={{
          fontSize: 16, fontWeight: 700, lineHeight: 1.1, marginTop: 4,
          fontFamily: "'Fira Code', monospace",
          color: accent ? 'var(--color-income)' : 'rgba(255,255,255,0.92)',
          textShadow: accent ? '0 0 12px rgba(10,245,176,0.4)' : 'none',
        }}>{value}</div>
      </div>
    );
  }
  

function CipherInfo({ cipherType }: { cipherType: ICipherType | undefined; }) {
    return (<Box className="cipher-info-container">
        <Stat label="Payout" value={`$${formatMoney(cipherType?.payout)}`} accent={true} />
        <Stat label="XP" value={`${cipherType?.xp} XP`} accent={false} />
    </Box>);
}

function CipherProgressBar({
    id,
    cipherType,
    cipherState,
}: {
    id: string;
    cipherType: ICipherType | undefined;
    cipherState: CipherState | undefined;
}) {
    const progress = useCipherBreakStore((s) => s.entries[id]?.progress) ?? 0;
    if (!cipherState || cipherState === CipherState.IDLE) return null;
    return (
        <div className="progress">
            <LinearProgressWithLabel
                variant="determinate"
                value={progress}
                type={cipherType}
                status={cipherState}
            />
        </div>
    );
}

function LinearProgressWithLabel(
    props: LinearProgressProps & { value: number; type?: ICipherType | undefined; status?: CipherState },
) {
    const { status = CipherState.IDLE, type } = props;

    let statusClassName = 'idle';
    switch (status) {
        case CipherState.BREAKING:
            statusClassName = 'breaking';
            break;
        case CipherState.DOWNLOADING:
            statusClassName = 'downloading';
            break;
        case CipherState.SUCCESS:
            statusClassName = 'success';
            break;
        case CipherState.CANCELLED:
            statusClassName = 'cancelled';
            break;
        case CipherState.PAUSED:
            statusClassName = 'paused';
            break;
    }

    return (
        <Box className="cipher-progress-bar-container">
            <Box className="cipher-progress-header" sx={{ display: 'flex', alignItems: 'center' }}>
                {status && (
                    <Box sx={{ textAlign: 'left', flex: '1 1 0', justifyContent: 'flex-start', m: 0, whiteSpace: 'nowrap' }}>
                        <Chip className={clsx('cipher-progress-chip', statusClassName)} label={status.toString()} />
                        <span className="cipher-progress-complexity">C{type?.complexity} · x{type?.parallelism}</span>
                    </Box>
                )}
                <Box sx={{ textAlign: 'right', flex: '1 1 0', justifyContent: 'flex-end', m: 0 }}>
                    <Typography
                        className="cipher-progress-percentage"
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                    >{`${Math.round(props.value)}%`}</Typography>
                </Box>
            </Box>
            <Box className="cipher-progress-container">
                <LinearProgress className={clsx('cipher-progress-bar', statusClassName)} variant="determinate" {...props} />
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

export default function CipherBreak(props: CipherBreakOptions) {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const { functions, station, id, type } = props;
    const cipher = useCipherBreakStore((s) => (id ? s.entries[id]?.cipher : undefined));
    const cipherKey = useCipherBreakStore((s) => (id ? s.entries[id]?.cipher?.id : undefined));
    const cipherType = useCipherBreakStore((s) => (id ? s.entries[id]?.type : undefined));
    const cipherState = useCipherBreakStore((s) => (id ? s.entries[id]?.state : undefined));
    const autoCipher = useCipherBreakStore((s) => s.entries[id ?? '']?.autoCipher ?? false);
    const removeEntry = useCipherBreakStore((s) => s.removeEntry);
    const enableAutoCipher = usePlayerStore((s) => s.purchasedUpgrades.includes('auto-cipher'));

    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);

    const { removeProcess } = functions;
    const { notify } = useNotifier();

    // Always points to the latest completeCipher so delegates created once
    // (on cipher construction) never call a stale closure.
    const completeCipherRef = useRef<(cipher: Cipher, cancelled: boolean) => void>(
        () => {},
    );

    const handleAutoCipherChange = (event: ChangeEvent<HTMLInputElement>) => {
        useCipherBreakStore.getState().update(id ?? '', { autoCipher: event.target.checked });
    };

    // Drive the success/error/idle card animations from the cipher state.
    // Keeping this here (rather than in the cipher delegate) means the
    // animations are re-applied correctly when the component remounts after
    // a tab switch.
    useEffect(() => {
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

    // Reads everything from the store at call time — no stale closure risk
    // regardless of when the cipher finishes or when upgrades are purchased.
    const completeCipher = (cipher: Cipher, cancelled: boolean) => {
        const entry = useCipherBreakStore.getState().entries[id ?? ''];
        if (!cancelled) {
            station.os?.player.earnExperience(entry?.type?.xp);
            station.os?.player.addMoney(entry?.type?.payout);
            station.os?.sendNotification(
                `You have earned ${entry?.type?.xp} XP and $${entry?.type?.payout}.`,
                NotificationLevel.INFO,
            );
        } else {
            station.os?.sendNotification(
                `You have cancelled the cipher.`,
                NotificationLevel.WARNING,
            );
        }
        setTimeout(() => {
            cipher.reset();
            const currentEntry = useCipherBreakStore.getState().entries[id ?? ''];
            if (currentEntry?.autoCipher && !cancelled) {
                handleAddCipher(currentEntry.type);
            }
        }, 1000);
    };

    completeCipherRef.current = completeCipher;

    const handleAddCipher = (cipherType: ICipherType) => {
        if (!id) return;        
        // Delegate writes directly to the store via getState() so it never
        // captures stale React closure values.
        const delegate: CipherDelegate = {
            setGrid: (chars, classes) => cipherGridRenderers.get(id)?.(chars, classes),
            setProgress: (p) => useCipherBreakStore.getState().update(id, { progress: p }),
            setState: (s) => useCipherBreakStore.getState().update(id, { state: s }),
            completeCipher: (c, cancelled) => completeCipherRef.current(c, cancelled),
            downloadTick: (frame) => downloadTickHandlers.get(id)?.(frame),
        };

        try {
            const c = new Cipher(20, 10, cssClasses, cipherType, station, delegate);
            useCipherBreakStore.getState().update(id, { cipher: c, type: cipherType });
            station.os?.addFile({
                cmd: `${c.id}.bin`,
                path: `/${cipherType.name.replace(' ', '-').toLowerCase()}`,
                contentType: 'application/octet-stream',
                permissions: 644,
                size: dataSizeFromSuffix(cipherType.block),
            });
        } catch(error) {
            const message = error.message;
            notify({ level: 'error', message });
            removeEntry(id);
            removeProcess?.(id);
            station.os?.sendNotification(message, NotificationLevel.ERROR);
        }
    };

    // Bootstrap a cipher for this slot if one isn't already tracked in the
    // store. This runs on first mount AND on remount after tab switches, but
    // the `!cipher` guard ensures we don't recreate an in-flight cipher.
    useEffect(() => {
        if (!cipher && id && type) {
            handleAddCipher(type);
        }
    }, [id, type]);

    useEffect(() => {
        useCipherBreakStore.getState().update(id ?? '', { autoCipher: enableAutoCipher });
    }, [enableAutoCipher, id]);

    const handleRemoveCipher = () => {
        if (id) removeEntry(id);
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
            <Card ref={cardRef} className="background" id="cipher-break-card">
                <CardHeader
                    className="cipher-card-header"
                    avatar={
                        <Avatar sx={{ color: '#0af5b0', bgcolor: 'rgba(10,245,176,0.15)' }}>
                            <CodeTwoTone />
                        </Avatar>
                    }
                    title="Cipher Break"
                    slotProps={{
                        title: { noWrap: true },
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
                                    <PlayArrowTwoTone sx={{ color: '#0af5b0' }} />
                                </IconButton>
                            )}
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
                            <CipherProgressBar id={id} cipherType={cipherType} cipherState={cipherState} />
                            <CipherGrid id={id} cipherKey={cipherKey} />
                            <CipherInfo cipherType={cipherType} />
                        </>
                    )}
                </CardContent>
                <CardActions disableSpacing sx={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    alignItems: 'stretch',
                    alignContent: 'space-between',
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}>
                    {id && (
                        <>
                            <FormControlLabel
                                sx={{ textAlign: 'left', flex: '1 1 0', justifyContent: 'flex-start', m: 0 }}
                                control={<Checkbox className="auto-cipher-checkbox" disabled={!enableAutoCipher} onChange={handleAutoCipherChange} checked={autoCipher} />}
                                label="Auto Restart"
                            />
                            {canShowActions && (
                                <>
                                    {cipherState !== CipherState.IDLE && (
                                        <Box sx={{ flex: '0 0 auto', textAlign: 'center' }}>
                                            <Button
                                                onClick={handleCancelDialogOpen}
                                                variant="contained"
                                                color="error"
                                                className="centerAlign"
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    )}
                                    {cipherState === CipherState.IDLE && (
                                        <Box sx={{ flex: '0 0 auto', textAlign: 'center' }}>
                                            <Button
                                                onClick={handleRemoveCipher}
                                                variant="contained"
                                                color="primary"
                                                className="centerAlign"
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    )}
                                    <Box sx={{ textAlign: 'right', flex: '1 1 0' }}>
                                        <IconButton onClick={handleInfoDialogOpen}>
                                            <InfoTwoTone />
                                        </IconButton>
                                    </Box>
                                </>
                            )}
                        </>
                    )}
                </CardActions>
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
}
