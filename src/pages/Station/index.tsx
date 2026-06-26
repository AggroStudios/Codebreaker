import { useEffect } from 'react';
import Grid from '@mui/material/Grid';

import CipherBreak from '../../components/CipherBreak';
import StationStatistics from '../../components/StationStatistics';
import CpuActivityWidget from '../../components/CpuActivity';

import { useCipherStore } from '../../stores/cipher';
import { useStationContext, useStationState } from '../../stores/stationContext';
import { usePlayerStore } from '../../stores/player';

import './style.scss';
import CipherAdd from '../../components/CipherAdd';
import { Chip } from '@mui/material';
import { ImportantDevicesOutlined, ScheduleOutlined, ShieldOutlined } from '@mui/icons-material';
import clsx from 'clsx';

import PageHeader from '../../components/common/PageHeader';
import { useThreatsStore } from '../../stores/threats';

/** Formats a duration in seconds as `H:MM:SS`. */
function formatUptime(totalSeconds: number): string {
    const s = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function StationHeader({ uptime, threats }) {
    return (
        <PageHeader
            className="station-header"
            title="Station Overview"
            subtitle="Monitor station health, manage running cipher processes, and queue new breaks."
            breadcrumbs={['home', 'station']}
            actions={
                <div className="chips">
                    <Chip label="ONLINE" size="small" variant="outlined" className="accent" style={{ marginRight: 6 }} icon={<span className="live-dot" />} />
                    <Chip label={`UPTIME ${uptime}`} variant="outlined" icon={<ScheduleOutlined fontSize="small" />} />
                    <Chip label={`${threats} THREATS`} variant="outlined" className={clsx(threats === 0 || 'warning')} icon={<ShieldOutlined fontSize="small" />} />
                </div>
            }
            icon={ImportantDevicesOutlined}
        />
    );
}

export default function StationComponent() {
    const { stationProxy } = useStationContext();
    // Select individual slices so the page doesn't re-render on every unrelated
    // player/cipher store change (e.g. money ticking each income frame).
    const showTutorial = usePlayerStore((s) => s.showTutorial);

    const setStation = useCipherStore((s) => s.setStation);
    const threatCount = useThreatsStore((s) => s.threatCount);
    const uptimeSeconds = useStationState((s) => s.uptime);

    useEffect(() => {
        showTutorial('station');
    }, []);

    useEffect(() => {
        setStation(stationProxy);
    }, [setStation, stationProxy]);

    const runningProcesses = useCipherStore((s) => s.runningProcesses);
    const addProcess = useCipherStore((s) => s.addProcess);
    const removeProcess = useCipherStore((s) => s.removeProcess);

    return (
        <>
            <StationHeader uptime={formatUptime(uptimeSeconds)} threats={threatCount} />
            <div className="card">
                <Grid container spacing={2}>
                    <Grid size={4} id="coachmark-statistics">
                        <StationStatistics station={stationProxy} />
                    </Grid>
                    <Grid size={8} id="coachmark-cpu-activity">
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
