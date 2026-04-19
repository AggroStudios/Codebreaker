import './App.css';
import { useEffect } from 'react';
import Grid from '@mui/material/Grid';

import CipherBreak from './components/Widgets/cipherBreak';
import StationStatistics from './components/StationStatistics';
import { CpuActivityWidget } from './components/Widgets/cpuActivity';

import { useCipherStore } from './stores/cipher';
import { useStationContext } from './stores/stationContext';

export default function StationComponent() {
    const { stationProxy } = useStationContext();

    const setStation = useCipherStore((s) => s.setStation);

    useEffect(() => {
        setStation(stationProxy);
    }, [setStation, stationProxy]);

    const { runningProcesses, addProcess, removeProcess } = useCipherStore();

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
                    {runningProcesses.length > 0 &&
                        runningProcesses.map(({id, type}) => (
                            <Grid size={4} key={id}>
                                <CipherBreak
                                    station={stationProxy}
                                    id={id}
                                    type={type}
                                    width={20}
                                    functions={{ removeProcess }}
                                />
                            </Grid>
                        ))}
                    <Grid size={4}>
                        <CipherBreak
                            station={stationProxy}
                            width={20}
                            functions={{ addProcess }}
                        />
                    </Grid>
                </Grid>
            </div>
        </>
    );
}
