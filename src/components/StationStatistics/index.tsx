import { useMemo } from 'react';
import {
    Box,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@mui/material';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import MemoryIcon from '@mui/icons-material/Memory';
import LanIcon from '@mui/icons-material/Lan';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

import { StationStoreType } from '../../includes/Process.interface';
import { ICipherType } from '../../includes/Cipher.interface';
import { useCipherStore } from '../../stores/cipher';

import StationCard, { StationCardAccentType } from '../StationCard';

const cipherMemoryGb = (type: ICipherType): number =>
    Math.ceil((type.memoryRequired ?? 0) / 1024);

function UsageCell({
    used,
    total,
    suffix = '',
    warnThreshold = 80,
}: {
    used: number;
    total: number;
    suffix?: string;
    warnThreshold?: number;
}) {
    const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
    const warn = pct >= warnThreshold;
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, minWidth: 120 }}>
            <span>{`${used} / ${total}${suffix}`}</span>
            <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                    width: '100%',
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: warn ? '#ff9800' : '#0af5b0',
                        boxShadow: warn
                            ? '0 0 6px rgba(255,152,0,0.5)'
                            : '0 0 6px rgba(10,245,176,0.5)',
                    },
                }}
            />
        </Box>
    );
}

export default function StationStatistics({ station }: { station: StationStoreType }) {
    const runningProcesses = useCipherStore((s) => s.runningProcesses);

    const totalMemoryGb = station.memory?.capacity ?? 0;
    const usedMemoryGb = useMemo(
        () => runningProcesses.reduce((sum, p) => sum + cipherMemoryGb(p.type), 0),
        [runningProcesses],
    );
    const maxSlots = station.memory?.maxConcurrentBreaks ?? 0;
    const slotsUsed = runningProcesses.length;

    return (
        <StationCard
            avatar={AnalyticsOutlinedIcon}
            accent={StationCardAccentType.CYAN}
            title="Station Statistics"
            subheader="HARDWARE PROFILE"
            content={
                <Table sx={{ width: '100%' }} size="small">
                    <TableBody>
                        <TableRow className="statistics-row">
                            <TableCell className="title-cell" sx={{ whiteSpace: 'nowrap' }}><MemoryIcon /> CPU</TableCell>
                            <TableCell className="value-cell">{station.cpu.toString()}</TableCell>
                        </TableRow>
                        <TableRow className="statistics-row">
                            <TableCell className="title-cell" sx={{ whiteSpace: 'nowrap' }}><SpeedIcon /> CPU Speed</TableCell>
                            <TableCell className="value-cell">{station.cpu?.speed}</TableCell>
                        </TableRow>
                        <TableRow className="statistics-row">
                            <TableCell className="title-cell" sx={{ whiteSpace: 'nowrap' }}><DeveloperBoardIcon /> Cores</TableCell>
                            <TableCell className="value-cell">{`${station.cpu?.cores} cores`}</TableCell>
                        </TableRow>
                        <TableRow className="statistics-row">
                            <TableCell className="title-cell" sx={{ whiteSpace: 'nowrap' }}><MemoryIcon /> Memory</TableCell>
                            <TableCell className="value-cell">
                                <UsageCell used={usedMemoryGb} total={totalMemoryGb} suffix=" GB" />
                            </TableCell>
                        </TableRow>
                        <TableRow className="statistics-row">
                            <TableCell className="title-cell" sx={{ whiteSpace: 'nowrap' }}><ViewModuleIcon /> Cipher Slots</TableCell>
                            <TableCell className="value-cell">
                                <UsageCell used={slotsUsed} total={maxSlots} warnThreshold={100} />
                            </TableCell>
                        </TableRow>
                        <TableRow className="statistics-row">
                            <TableCell className="title-cell" sx={{ whiteSpace: 'nowrap' }}><StorageIcon /> Storage</TableCell>
                            <TableCell className="value-cell">{`${station.storage?.map((storage) => storage.capacity).join(' ')} GB`}</TableCell>
                        </TableRow>
                        <TableRow className="statistics-row">
                            <TableCell className="title-cell" sx={{ whiteSpace: 'nowrap' }}><LanIcon /> Network</TableCell>
                            <TableCell className="value-cell">{station.network?.network.toString()}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            }
        />
    );
}
