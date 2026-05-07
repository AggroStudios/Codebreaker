import { useStationState } from '../../stores/stationContext';
import { Chip } from '@mui/material';
import { SsidChartOutlined } from '@mui/icons-material';

import './style.scss';
import StationCard, { StationCardAccentType } from '../StationCard';
import { Stat } from '../common/Stat';
import { Sparkline } from '../common/Sparkline';


export default function SparkLineWidget() {
    const cpuActivity = useStationState((s) => s.cpuActivity);
    
    const current = cpuActivity[cpuActivity.length - 1].y || 0;
    const peak = Math.max(...cpuActivity.map(({ y }) => y), 0);
    const avg = cpuActivity.length ? cpuActivity.reduce((a, { y }) => a + y, 0) / cpuActivity.length : 0;
    
    return (
        <StationCard
            id="cpuActivity"
            avatar={SsidChartOutlined}
            accent={StationCardAccentType.ACCENT}
            title="CPU Activity"
            subheader="REAL-TIME % USAGE"
            headerAction={<Chip label="LIVE" size="small" icon={<span className="live-dot" />} />}
            content={
                <>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 12, marginBottom: 14,
                    }}>
                        <Stat label="CURRENT" value={current.toFixed(0) + '%'} accent="accent" />
                        <Stat label="PEAK" value={peak.toFixed(0) + '%'} />
                        <Stat label="AVG" value={avg.toFixed(0) + '%'} />
                    </div>
                    <Sparkline values={cpuActivity} height={220} staticYAxis={100} yAxisSuffix="%" zeroMinYAxis={true} />
                </>
            }
        />
    );
}