import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography,
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
import { useMusicPlayerStore } from '../../stores/musicPlayer';
import { dataSizeFromSuffix } from '../../lib/utils';

import CipherGrid from '../CipherGrid';
import successSound from '../../assets/sounds/success.mp3';
import failureSound from '../../assets/sounds/failure.mp3';
import { CipherInfo, CipherProgressBar } from './components';
import StationCard, { StationCardAccentType } from '../common/StationCard';

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
    const [miniGameIndex, setMiniGameIndex] = useState(0);
    const sfxVolume = useMusicPlayerStore((s) => s.sfxVolume);
    const mutedSfx = useMusicPlayerStore((s) => s.mutedSfx);

    const isManualBreaking =
        !!cipherType?.manualMode?.length &&
        cipherState !== undefined &&
        cipherState !== CipherState.IDLE &&
        cipherState !== CipherState.DOWNLOADING;

    // Pick a random minigame from the cipher type's list; stable per cipherType.
    const MiniGame = useMemo(() => {
        const modes = cipherType?.manualMode;
        if (!modes?.length) return null;
        return modes[miniGameIndex];
    }, [cipherType, miniGameIndex]);

    const handleManualWin = useCallback(() => {
        const audioPlayer = new Audio(successSound);
        audioPlayer.volume = mutedSfx ? 0 : sfxVolume;
        audioPlayer.play();
        cipher?.manualComplete();
    }, [cipher]);

    const handleManualLose = useCallback(() => {
        const audioPlayer = new Audio(failureSound);
        audioPlayer.volume = mutedSfx ? 0 : sfxVolume;
        audioPlayer.play();
        cipher?.fail();
    }, [cipher]);

    const handleManualProgress = useCallback((progress: number) => {
        if (cipher) {
            cipher.progress = progress;
        }
    }, [cipher]);

    const { removeProcess } = functions;
    const { notify } = useNotifier();

    // Always points to the latest completeCipher so delegates created once
    // (on cipher construction) never call a stale closure.
    const completeCipherRef = useRef<(cipher: Cipher, state: CipherState) => void>(
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
        } else if (cipherState === CipherState.CANCELLED || cipherState === CipherState.FAILURE) {
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
    const completeCipher = (cipher: Cipher, state: CipherState) => {
        const entry = useCipherBreakStore.getState().entries[id ?? ''];
        if (state === CipherState.SUCCESS) {
            station.os?.player.earnExperience(entry?.type?.xp);
            station.os?.player.addMoney(entry?.type?.payout);
            station.os?.sendNotification(
                `You have earned ${entry?.type?.xp} XP and $${entry?.type?.payout}.`,
                NotificationLevel.INFO,
            );
        } else if (state === CipherState.CANCELLED) {
            station.os?.sendNotification(
                `You have cancelled the cipher.`,
                NotificationLevel.WARNING,
            );
        } else if (state === CipherState.FAILURE) {
            station.os?.sendNotification(
                `You have failed the cipher.`,
                NotificationLevel.ERROR,
            );
        }
        setTimeout(() => {
            cipher.reset();
            const currentEntry = useCipherBreakStore.getState().entries[id ?? ''];
            if (currentEntry?.autoCipher && state !== CipherState.CANCELLED) {
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
            completeCipher: (c, state) => completeCipherRef.current(c, state),
            downloadTick: (frame) => downloadTickHandlers.get(id)?.(frame),
        };

        try {
            const c = new Cipher(20, 10, cssClasses, cipherType, station, delegate);
            const isNewSlot = !useCipherBreakStore.getState().entries[id]?.cipher;
            if (cipherType?.manualMode?.length) {
                setMiniGameIndex(Math.floor(Math.random() * (cipherType?.manualMode?.length ?? 0)));
            }
            useCipherBreakStore.getState().update(id, {
                cipher: c,
                type: cipherType,
                ...(isNewSlot && { autoCipher: enableAutoCipher }),
            });
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

    // Sync per-cipher autoCipher only when the upgrade is actually toggled at
    // runtime — not on mount, where the value is already set by handleAddCipher.
    const prevEnableAutoCipherRef = useRef<boolean | null>(null);
    useEffect(() => {
        if (prevEnableAutoCipherRef.current !== null &&
            prevEnableAutoCipherRef.current !== enableAutoCipher) {
            useCipherBreakStore.getState().update(id ?? '', { autoCipher: enableAutoCipher });
        }
        prevEnableAutoCipherRef.current = enableAutoCipher;
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
            <StationCard
                ref={cardRef}
                id="cipher-break-card"
                avatar={CodeTwoTone}
                accent={StationCardAccentType.ACCENT}
                title="Cipher Break"
                subheader={cipherType?.name}
                headerAction={
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
                content={
                    <>
                        <CipherProgressBar id={id} cipherType={cipherType} cipherState={cipherState} />
                        {isManualBreaking && MiniGame ? (
                            <MiniGame rounds={5} onWin={handleManualWin} onLose={handleManualLose} onProgress={handleManualProgress} />
                        ) : (
                            <CipherGrid id={id} cipherKey={cipherKey} />
                        )}
                        <CipherInfo cipherType={cipherType} />
                    </>
                }
                action={
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
            }
            />
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
