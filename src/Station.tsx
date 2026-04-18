import './App.css';
import { useEffect } from 'react';
import Grid from '@mui/material/Grid';

import CipherBreak, {
    CipherBreakFunctions,
} from './components/Widgets/cipherBreak';
import StationStatistics from './components/StationStatistics';
import { CpuActivityWidget } from './components/Widgets/cpuActivity';

import Cipher from './lib/Cipher';
import { ICipherType } from './includes/Cipher.interface';
import { NotificationLevel } from './includes/OperatingSystem.interface';

import { useCipherStore } from './stores/cipher';
import { useStationContext } from './stores/stationContext';
import { useNotifier } from './components/Notifier';

const cssClasses = ['breaking-1', 'breaking-2', 'breaking-3', 'breaking-4'];

export default function StationComponent() {
    const { stationProxy } = useStationContext();
    const { notify } = useNotifier();

    const runningCiphers = useCipherStore((s) => s.runningCiphers);
    const addCipher = useCipherStore((s) => s.addCipher);
    const removeCipher = useCipherStore((s) => s.removeCipher);
    const updateCipher = useCipherStore((s) => s.updateCipher);
    const setStation = useCipherStore((s) => s.setStation);

    useEffect(() => {
        setStation(stationProxy);
    }, [setStation, stationProxy]);

    const completeCipher = (cipher: Cipher, cancelled: boolean) => {
        stationProxy.os?.sendNotification(
            `Cipher '${cipher.cipherType.name}' (${cipher.id}) ${
                cancelled ? 'cancelled' : 'completed'
            }.`,
            cancelled ? NotificationLevel.ERROR : NotificationLevel.INFO,
        );
    };

    const handleRemoveCipher = (cipher: Cipher) => {
        removeCipher(cipher);
    };

    const handleAddCipher = (cipherType: ICipherType) => {
        try {
            const c = new Cipher(20, 10, cssClasses, cipherType, stationProxy);
            addCipher(c);
        } catch {
            const message = `Not enough cores available to add process '${cipherType.name}'.`;
            notify({ level: 'error', message });
            stationProxy.os?.sendNotification(
                message,
                NotificationLevel.ERROR,
            );
        }
    };

    const handleUpdateCipher = (cipher: Cipher) => {
        const newCipher = new Cipher(
            20,
            10,
            cssClasses,
            cipher.cipherType,
            stationProxy,
        );
        updateCipher(cipher, newCipher);
    };

    const functions: CipherBreakFunctions = {
        newCipher: handleAddCipher,
        onComplete: completeCipher,
        removeCipher: handleRemoveCipher,
        updateCipher: handleUpdateCipher,
    };

    return (
        <>
            <div className="card">
                <Grid container spacing={2}>
                    <Grid size={4}>
                        <StationStatistics station={stationProxy} />
                    </Grid>
                    <Grid size={8}>
                        <CpuActivityWidget title="CPU Activity" />
                    </Grid>
                </Grid>
            </div>
            <div className="card">
                <Grid container spacing={2}>
                    {runningCiphers.length > 0 &&
                        runningCiphers.map((cipher) => (
                            <Grid size={4} key={cipher.id}>
                                <CipherBreak
                                    station={stationProxy}
                                    width={20}
                                    cipher={cipher}
                                    functions={functions}
                                />
                            </Grid>
                        ))}
                    <Grid size={4}>
                        <CipherBreak
                            station={stationProxy}
                            width={20}
                            functions={functions}
                        />
                    </Grid>
                </Grid>
            </div>
        </>
    );
}
