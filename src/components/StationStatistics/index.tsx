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
import MemoryIcon from '@mui/icons-material/Memory';
import LanIcon from '@mui/icons-material/Lan';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';

import { StationStoreType } from '../../includes/Process.interface';
import './style.scss';


// function DefRow({ label, value, mono, icon, accent = null }) {
//     return (
//       <div style={{
//         display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//         padding: '10px 0',
//         borderBottom: '1px solid rgba(255,255,255,0.06)',
//         gap: 12,
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
//           {icon && <Icon name={icon} size={18} style={{ color: 'rgba(255,255,255,0.45)' }} />}
//           {label}
//         </div>
//         <div style={{
//           fontFamily: mono ? "'Fira Code', monospace" : 'Inter, sans-serif',
//           fontSize: 13, fontWeight: mono ? 500 : 600,
//           color: accent ? '#0af5b0' : 'rgba(255,255,255,0.92)',
//           textAlign: 'right',
//         }}>
//           {value}
//         </div>
//       </div>
//     );
//   }

// ── Station Statistics card ───────────────────────────────────────────────────
export default function StationStatistics({ station }: { station: StationStoreType }) {
    return (
      <Card className="background" id="stationStatistics">
        <CardHeader
          avatar={<Avatar sx={{ color: '#26c6da', bgcolor: 'rgba(38,198,218,0.15)' }}><AnalyticsOutlinedIcon /></Avatar>}
          title="Station Statistics"
          subheader="HARDWARE PROFILE"
        />
        <CardContent>
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
          {/* <DefRow icon="memory"      label="CPU"        value={station.cpu.toString()} mono />
          <DefRow icon="speed"       label="CPU Speed"  value={station.cpu?.speed} mono />
          <DefRow icon="developer_board" label="Cores"  value={`${station.cpu?.cores} cores`} mono />
          <DefRow icon="memory"      label="Memory"     value={`${station.memory?.capacity} GB`} mono />
          <DefRow icon="storage"     label="Storage"    value={`${station.storage?.map((storage) => storage.capacity).join(' ')} GB`} mono />
          <DefRow icon="lan"         label="Network"    value={station.network?.network.toString()} mono /> */}
  
          {/* <div style={{ marginTop: 14, padding: '14px 0 4px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
              marginBottom: 8,
            }}>
              <span>Total Load</span>
              <span style={{ color: '#0af5b0', fontFamily: "'Fira Code', monospace" }}>
                {totalLoad.toFixed(0)}%
              </span>
            </div>
            <MuiLinearProgress value={totalLoad} color={totalLoad > 80 ? 'warn' : 'accent'} height={8} />
          </div> */}
        </CardContent>
      </Card>
    );
  }



// export default function StationStatistics({
//     station,
// }: {
//     station: StationStoreType;
// }) {
//     return (
//         <Card className="background">
//             <CardHeader
//                 title="Station Statistics"
//                 slotProps={{ title: { variant: 'h5' } }}
//                 avatar={
//                     <Avatar>
//                         <AnalyticsOutlinedIcon />
//                     </Avatar>
//                 }
//             />
//             <CardContent>
//                 <Table sx={{ width: '100%' }} size="small">
//                     <TableBody>
//                         <TableRow>
//                             <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                 CPU:
//                             </TableCell>
//                             <TableCell sx={{ width: '100%' }}>
//                                 {station.cpu?.toString()}
//                             </TableCell>
//                         </TableRow>
//                         <TableRow>
//                             <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                 CPU Speed:
//                             </TableCell>
//                             <TableCell sx={{ width: '100%' }}>
//                                 {station.cpu?.speed}
//                             </TableCell>
//                         </TableRow>
//                         <TableRow>
//                             <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                 Nb Cores:
//                             </TableCell>
//                             <TableCell sx={{ width: '100%' }}>
//                                 {station.cpu?.cores} Cores
//                             </TableCell>
//                         </TableRow>
//                         <TableRow>
//                             <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                 Memory:
//                             </TableCell>
//                             <TableCell>
//                                 {station.memory?.capacity} GB
//                             </TableCell>
//                         </TableRow>
//                         <TableRow>
//                             <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                 Storage:
//                             </TableCell>
//                             <TableCell>
//                                 {station.storage
//                                     ?.map((storage) => storage.capacity)
//                                     .join(', ')}{' '}
//                                 GB
//                             </TableCell>
//                         </TableRow>
//                         <TableRow>
//                             <TableCell sx={{ whiteSpace: 'nowrap' }}>
//                                 Network:
//                             </TableCell>
//                             <TableCell>
//                                 {station.network?.network.toString()}
//                             </TableCell>
//                         </TableRow>
//                     </TableBody>
//                 </Table>
//             </CardContent>
//         </Card>
//     );
// }
