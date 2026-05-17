import { Box } from '@mui/material';

import { Rack } from '../../stores/racks';
import { SwitchUnit, UplinkInfo, statusColor } from '../../includes/serverRacks.interface';

interface NetworkDiagramProps {
    racks: Rack[];
    switches: SwitchUnit[];
    uplink: UplinkInfo;
}

const W = 280;
const H = 220;
const UPLINK_Y = 24;
const SWITCH_Y = 100;
const RACK_Y = 184;

export default function NetworkDiagram({ racks, switches, uplink }: NetworkDiagramProps) {
    const swCount = switches.length;
    const swX = (i: number) => ((i + 1) * W) / (swCount + 1);
    const rackX = (i: number) => ((i + 1) * W) / (racks.length + 1);
    const uplinkColor = statusColor(uplink.status);

    const switchById = new Map(switches.map((sw) => [sw.id, sw] as const));
    const switchIndexById = new Map(switches.map((sw, i) => [sw.id, i] as const));

    return (
        <Box
            sx={{
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 1,
                p: 1,
            }}
        >
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: 'block' }}>
                {/* uplink → switches */}
                {switches.map((sw, i) => {
                    const ok = uplink.status === 'UP' && sw.status === 'UP';
                    return (
                        <line
                            key={`u-${sw.id}`}
                            x1={W / 2}
                            y1={UPLINK_Y + 10}
                            x2={swX(i)}
                            y2={SWITCH_Y - 12}
                            stroke={ok ? '#0af5b0' : uplinkColor}
                            strokeOpacity={ok ? 0.85 : 0.6}
                            strokeWidth={1.2}
                            strokeDasharray="6 8"
                            className="packet-line"
                        />
                    );
                })}

                {/* switches → racks */}
                {racks.map((r, ri) => {
                    if (!r.switchId) return null;
                    const idx = switchIndexById.get(r.switchId);
                    const sw = switchById.get(r.switchId);
                    if (idx == null || !sw) return null;
                    const ok = uplink.status === 'UP' && sw.status === 'UP';
                    return (
                        <line
                            key={`s-${r.id}`}
                            x1={swX(idx)}
                            y1={SWITCH_Y + 12}
                            x2={rackX(ri)}
                            y2={RACK_Y - 12}
                            stroke={ok ? '#26c6da' : '#ff9800'}
                            strokeOpacity={0.75}
                            strokeWidth={1.1}
                            strokeDasharray="4 6"
                            className="packet-line"
                        />
                    );
                })}

                {/* uplink node */}
                <g>
                    <rect
                        x={W / 2 - 26}
                        y={UPLINK_Y - 10}
                        width={52}
                        height={20}
                        rx={4}
                        fill="rgba(10,245,176,0.15)"
                        stroke={uplinkColor}
                    />
                    <text
                        x={W / 2}
                        y={UPLINK_Y + 4}
                        textAnchor="middle"
                        fontFamily="Fira Code, monospace"
                        fontSize={9}
                        fill={uplinkColor}
                    >
                        UPLINK
                    </text>
                </g>

                {/* switch nodes */}
                {switches.map((sw, i) => {
                    const color = statusColor(sw.status);
                    return (
                        <g key={sw.id}>
                            <rect
                                x={swX(i) - 24}
                                y={SWITCH_Y - 12}
                                width={48}
                                height={24}
                                rx={3}
                                fill="rgba(38,198,218,0.12)"
                                stroke={color}
                            />
                            <text
                                x={swX(i)}
                                y={SWITCH_Y + 3}
                                textAnchor="middle"
                                fontFamily="Fira Code, monospace"
                                fontSize={8}
                                fill="rgba(255,255,255,0.85)"
                            >
                                {sw.name.replace(/-SW.*/, '').toUpperCase()}
                            </text>
                        </g>
                    );
                })}

                {/* rack nodes */}
                {racks.map((r, i) => (
                    <g key={r.id}>
                        <rect
                            x={rackX(i) - 22}
                            y={RACK_Y - 12}
                            width={44}
                            height={22}
                            rx={3}
                            fill="rgba(255,255,255,0.06)"
                            stroke="rgba(255,255,255,0.25)"
                        />
                        <text
                            x={rackX(i)}
                            y={RACK_Y + 3}
                            textAnchor="middle"
                            fontFamily="Fira Code, monospace"
                            fontSize={8}
                            fill="rgba(255,255,255,0.75)"
                        >
                            {r.name.split(' ')[1] ?? r.name.slice(0, 4)}
                        </text>
                    </g>
                ))}
            </svg>
        </Box>
    );
}
