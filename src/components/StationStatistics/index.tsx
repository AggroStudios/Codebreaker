import {
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

import { StationStoreType } from '../../includes/Process.interface';

import StationCard, { StationCardAccentType } from '../StationCard';

export default function StationStatistics({ station }: { station: StationStoreType }) {
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
                            <TableCell className="value-cell">{`${station.memory?.capacity} GB`}</TableCell>
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
