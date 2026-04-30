import { useEffect } from 'react';
import Grid from '@mui/material/Grid';

import CipherBreak from '../../components/CipherBreak';
import StationStatistics from '../../components/StationStatistics';
import CpuActivityWidget from '../../components/CpuActivity';

import { useCipherStore } from '../../stores/cipher';
import { useStationContext } from '../../stores/stationContext';

import '../../App.css';
import './styles.scss';
import CipherAdd from '../../components/CipherAdd';

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
                        <CpuActivityWidget />
                    </Grid>
                    {runningProcesses.length > 0 &&
                        runningProcesses.map(({id, type}) => (
                            <Grid size={3} key={id}>
                                <CipherBreak
                                    station={stationProxy}
                                    id={id}
                                    type={type}
                                    width={20}
                                    functions={{ removeProcess }}
                                />
                            </Grid>
                        ))}
                    <Grid size={3}>
                        <CipherAdd
                            onAdd={addProcess}
                        />
                    </Grid>
                </Grid>
            </div>
        </>
    );
}
