import {
    Avatar,
    Card,
    CardContent,
    CardHeader,
    Table,
    TableBody,
    TableCell,
    TableRow,
} from '@mui/material';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';

import { StationStoreType } from '../../includes/Process.interface';

export default function StationStatistics({
    station,
}: {
    station: StationStoreType;
}) {
    return (
        <Card className="background">
            <CardHeader
                title="Station Statistics"
                slotProps={{ title: { variant: 'h5' } }}
                avatar={
                    <Avatar>
                        <AnalyticsOutlinedIcon />
                    </Avatar>
                }
            />
            <CardContent>
                <Table sx={{ width: '100%' }} size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                CPU:
                            </TableCell>
                            <TableCell sx={{ width: '100%' }}>
                                {station.cpu?.toString()}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                CPU Speed:
                            </TableCell>
                            <TableCell sx={{ width: '100%' }}>
                                {station.cpu?.speed}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                Nb Cores:
                            </TableCell>
                            <TableCell sx={{ width: '100%' }}>
                                {station.cpu?.cores} Cores
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                Memory:
                            </TableCell>
                            <TableCell>
                                {station.memory?.capacity} GB
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                Storage:
                            </TableCell>
                            <TableCell>
                                {station.storage
                                    ?.map((storage) => storage.capacity)
                                    .join(', ')}{' '}
                                GB
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                Network:
                            </TableCell>
                            <TableCell>
                                {station.network?.network.toString()}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
