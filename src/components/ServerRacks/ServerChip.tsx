import { Server } from '../../includes/Servers.interface';
import { TIER_COLORS, serverSize, serverTierLevel } from '../../includes/serverRacks.interface';

interface ServerChipProps {
    server: Server;
    height?: number;
    selected?: boolean;
    dimmed?: boolean;
    /** Powered-off state — used for inventory chips. LEDs render as static gray. */
    idle?: boolean;
}

export default function ServerChip({ server, height, selected, dimmed, idle }: ServerChipProps) {
    const tier = serverTierLevel(server.tier);
    const size = serverSize(server);
    const color = TIER_COLORS[tier] ?? '#0af5b0';
    const tierName = server.tier;
    const sku = server.model;
    const name = server.name ?? server.model;
    const watts = server.powerConsumption;

    const h = height ?? 22 * size - 2;
    const compact = h <= 24;

    const baseStyle: React.CSSProperties = {
        height: h,
        background: 'linear-gradient(180deg, rgba(40,40,42,0.95), rgba(18,18,20,0.95))',
        borderRadius: compact ? 4 : 6,
        borderLeft: `3px solid ${color}`,
        outline: selected ? `1px solid ${color}` : 'none',
        outlineOffset: selected ? 1 : 0,
        opacity: dimmed ? 0.4 : 1,
        boxShadow: '0 1px 0 rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        color: 'rgba(255,255,255,0.85)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
    };

    if (compact) {
        return (
            <div className="server-chip compact" style={{ ...baseStyle, padding: '0 6px', gap: 6 }}>
                <span className="screw" />
                <div style={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {sku}
                    <span style={{ marginLeft: 6, color: 'rgba(255,255,255,0.5)' }}>{watts}W</span>
                </div>
                <div style={{ display: 'flex', gap: 3 }}>
                    {idle ? (
                        <>
                            <span className="led" style={{ background: 'rgba(255,255,255,0.2)' }} />
                            <span className="led" style={{ background: 'rgba(255,255,255,0.2)' }} />
                        </>
                    ) : (
                        <>
                            <span className="led led-blink" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                            <span className="led led-blink-fast" style={{ background: '#28ff28', boxShadow: '0 0 4px #28ff28' }} />
                        </>
                    )}
                </div>
                <div className="vent vent-small" />
            </div>
        );
    }

    return (
        <div className="server-chip" style={{ ...baseStyle, padding: '6px 8px', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                <span className="screw" />
                <span className="screw" />
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {name}
                    <span style={{ marginLeft: 8, color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
                        · {size}U
                    </span>
                </div>
                <div style={{
                    fontFamily: 'Fira Code, monospace',
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                }}>
                    <span style={{ color }}>{tierName}</span>
                    <span> · </span>
                    <span>{sku}</span>
                    <span> · </span>
                    <span>{watts}W</span>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                {idle ? (
                    <>
                        <span className="led" style={{ background: 'rgba(255,255,255,0.2)' }} />
                        <span className="led" style={{ background: 'rgba(255,255,255,0.2)' }} />
                        <span className="led" style={{ background: 'rgba(255,255,255,0.18)' }} />
                    </>
                ) : (
                    <>
                        <span className="led led-blink" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
                        <span className="led led-blink-fast" style={{ background: '#28ff28', boxShadow: '0 0 4px #28ff28' }} />
                        <span className="led" style={{ background: 'rgba(255,255,255,0.18)' }} />
                    </>
                )}
            </div>
            <div className="vent" style={{ height: '70%' }} />
        </div>
    );
}
