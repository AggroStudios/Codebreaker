import { Avatar, Button, Card, CardActions, CardContent, CardHeader, Chip, IconButton, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { IDataCenter, IDataCenterContract, IDataCenterContractProps } from '../../includes/DataCenter.interface';
import { formatGbps, formatKw, formatMoney, formatMoneyDay, formatMs, projectLngLat } from '../../lib/utils';
import {
    ApartmentOutlined,
    ArrowForwardOutlined,
    BoltOutlined,
    CloseOutlined,
    DnsOutlined,
    LocationOnOutlined,
    PlaceOutlined,
    PowerOutlined,
    RequestQuoteOutlined,
    SpeedOutlined,
    RouterOutlined,
    UpgradeOutlined,
    VerifiedOutlined,
    ShieldOutlined,
    OpenInNewOutlined,
    AddOutlined,
    DrawOutlined
} from '@mui/icons-material';
import { POWER_TIERS, UPLINK_TIERS } from '../../data/dataCenter';
import { Stat } from '../common/Stat';
import { ShimmerProgress } from '../common/ShimmerProgress';
import clsx from 'clsx';
import { usePlayerStore } from '../../stores/player';
import { useEffect } from 'react';
    
// ── DataCenter pin ──────────────────────────────────────────────────────────────
export function DataCenterPin({ dataCenter, signed, selected, onClick, scale = 1 }: IDataCenterContractProps) {
    const [x, y] = projectLngLat(dataCenter.lng, dataCenter.lat);
    const color = signed ? '#0af5b0' : '#26c6da';
    return (
        <g
            transform={`translate(${x}, ${y}) scale(${scale})`}
            onClick={(e) => { e.stopPropagation(); onClick(dataCenter.id); }}
            style={{ cursor: 'pointer' }}
        >
            <circle r={62} fill="transparent" />
            {signed && (
                <circle r={36} fill="none" stroke={color} strokeWidth={4.6} opacity={0.6}>
                    <animate attributeName="r" values="20;55;20" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0;0.7" dur="2.4s" repeatCount="indefinite" />
                </circle>
            )}
            
            {selected && (
                <circle
                    r={40}
                    fill="none"
                    stroke={color}
                    strokeWidth={5}
                    strokeDasharray="10 10"
                    opacity={0.9}
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0"
                        to="360"
                        dur="6s"
                        repeatCount="indefinite"
                    />
                </circle>
            )}
            
            <circle r={17} fill={color} opacity={signed ? 1 : 0.85} />
            <circle r={6.5} fill="#0a0f0d" />
            
            <g transform="translate(28, -28)">
                <rect
                    x={-4}
                    y={-30}
                    width={dataCenter.code.length * 18 + 26}
                    height={42}
                    rx={5}
                    fill="rgba(10, 12, 14, 0.82)"
                    stroke="rgba(255,255,255,0.16)"
                    strokeWidth={1.4}
                />
                <text
                    x={9}
                    y={3}
                    fill={signed ? '#0af5b0' : 'rgba(255,255,255,0.82)'}
                    fontFamily="'Fira Code', monospace"
                    fontSize={26}
                    fontWeight={600}
                    letterSpacing="0.04em"
                >
                    {dataCenter.code}
                </text>
            </g>
        </g>
    );
}

// ── Upgrade row ─────────────────────────────────────────────────────────────
function UpgradeRow({ icon, label, current, currentUnit, nextValue, nextUnit, cost, canAfford, onUpgrade, maxed }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
        }}>
        <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(10,245,176,0.10)',
            color: '#0af5b0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        {icon}
        </div>
        <div style={{ minWidth: 0 }}>
        <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)',
        }}>
        {label}
        </div>
        <div style={{
            marginTop: 4,
            fontFamily: "'Fira Code', monospace",
            fontSize: 13,
            color: 'rgba(255,255,255,0.92)',
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
        <span>{current}{currentUnit}</span>
        {!maxed && (
            <>
            <ArrowForwardOutlined fontSize="small" style={{ color: 'rgba(10,245,176,0.7)' }} />
            <span style={{ color: '#0af5b0' }}>{nextValue}{nextUnit}</span>
            </>
        )}
        {maxed && (
            <span style={{ color: 'rgba(255,152,0,0.85)', fontSize: 11, letterSpacing: '0.08em' }}>MAX TIER</span>
        )}
        </div>
        </div>
        {!maxed ? (
            <Button
                className={clsx('data-center-card-button', canAfford ? 'accent' : 'neutral')}
                variant="contained"
                size="small"
                disabled={!canAfford}
                onClick={onUpgrade}
                startIcon={<UpgradeOutlined fontSize="small" />}
            >
                {formatMoney(cost)}
            </Button>
        ) : (
            <Chip label="MAXED" color="warning" size="small" variant="outlined" />
        )}
        </div>
    );
}

interface IDataCenterCardProps {
    dataCenter?: IDataCenter;
    contract?: IDataCenterContract;
    onSign: (id: string) => void;
    onUpgradePower: (id: string, power: number, cost: number) => void;
    onUpgradeUplink: (id: string, uplink: number, cost: number) => void;
    onAddRack: (id: string, cost: number) => void;
    onClose: () => void;
    floating: boolean;
}

export function DataCenterCard({ dataCenter, contract, onSign, onUpgradePower, onUpgradeUplink, onAddRack, onClose, floating = false }: IDataCenterCardProps) {
    
    const money = usePlayerStore((state) => state.player.money);
    const signed = !!contract;
    
    const powerIdx = signed ? Math.max(0, POWER_TIERS.findIndex((t) => t.kw === contract.powerKw)) : -1;
    const nextPower = signed && powerIdx < POWER_TIERS.length - 1 ? POWER_TIERS[powerIdx + 1] : null;
    
    const uplinkIdx = signed ? Math.max(0, UPLINK_TIERS.findIndex((t) => t.gbps === contract.uplinkGbps)) : -1;
    const nextUplink = signed && uplinkIdx < UPLINK_TIERS.length - 1 ? UPLINK_TIERS[uplinkIdx + 1] : null;
    
    useEffect(() => {
        console.log('contract', contract);
    }, [contract]);

    if (!dataCenter) {
        return (
            <Card style={{ height: '100%' }}>
                <CardContent>
                    <div style={{
                        minHeight: 380,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 14, padding: 16, textAlign: 'center',
                    }}>
                        <LocationOnOutlined fontSize="large" style={{ color: 'rgba(10,245,176,0.45)' }} />
                        <div style={{
                            fontSize: 11, fontWeight: 600, letterSpacing: '0.18em',
                            color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase',
                            fontFamily: "'Fira Code', monospace",
                        }}>
                            No Data Center Selected
                        </div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', maxWidth: 280, lineHeight: 1.55 }}>
                            Click a node on the global map to inspect a data center, sign a new contract, or upgrade existing capacity.
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="data-center-card" style={{
            height: floating ? 'auto' : '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(8, 12, 12, 0.85)',
            boxShadow: floating ? '0 16px 40px rgba(0,0,0,0.55), 0 0 20px rgba(10,245,176,0.16)' : undefined,
            backdropFilter: floating ? 'blur(2px)' : undefined,
        }}>
            <CardHeader
                avatar={
                    <Avatar className={clsx('data-center-card-avatar', signed ? 'accent' : 'cyan')}>
                        {signed ? <VerifiedOutlined fontSize="small" /> : <PlaceOutlined fontSize="small" />}
                    </Avatar>
                }
                title={
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18 }}>
                        {dataCenter.name}
                        <span style={{
                            fontFamily: "'Fira Code', monospace", fontSize: 11,
                            color: 'rgba(255,255,255,0.5)', fontWeight: 500,
                            letterSpacing: '0.08em',
                        }}>
                            {dataCenter.code}
                        </span>
                    </span>
                }
                subheader={<span style={{ fontSize: 12 }}>{dataCenter.city.toUpperCase()} · {dataCenter.provider.toUpperCase()}</span>}
                action={
                    <>
                        <Chip className={clsx('data-center-card-chip', `data-center-card-chip-tier-${dataCenter?.tier}`)} label={`TIER ${dataCenter?.tier}`} size="small" variant="outlined" />
                        <IconButton title="Close" onClick={onClose}>
                            <CloseOutlined fontSize="small" />
                        </IconButton>
                    </>
                }
            />
            
            <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px',
                    background: signed ? (contract.status === 'ACTIVE' ? 'rgba(10,245,176,0.08)' : 'rgba(255,152,0,0.08)') : 'rgba(38,198,218,0.08)',
                    border: `1px solid ${signed ? (contract.status === 'ACTIVE' ? 'rgba(10,245,176,0.32)' : 'rgba(255,152,0,0.32)') : 'rgba(38,198,218,0.32)'}`,
                    borderRadius: 8,
                }}>
                    <span className="live-dot" style={{
                        background: signed ? (contract.status === 'ACTIVE' ? '#0af5b0' : '#ff9800') : '#26c6da',
                        boxShadow: `0 0 6px ${signed ? (contract.status === 'ACTIVE' ? '#0af5b0' : '#ff9800') : '#26c6da'}`,
                    }} />
                    <span style={{
                        fontSize: 12, fontWeight: 600, letterSpacing: '0.10em',
                        fontFamily: "'Fira Code', monospace",
                        color: signed ? (contract.status === 'ACTIVE' ? '#0af5b0' : '#ff9800') : '#26c6da',
                    }}>
                        {signed ? `${contract.status} · LEASED ${contract.signedDays}d AGO` : 'NO CONTRACT · OPEN FOR LEASE'}
                    </span>
                </div>
                    
                {signed ? (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 8,
                        }}>
                            <Stat
                                titleIcon={<DnsOutlined fontSize="small" />}
                                label="Racks"
                                value={`${contract.racks}/${contract.rackCap}`}
                                accent={signed ? 'accent' : 'cyan'}
                                subheader={`${contract.rackCap - contract.racks} free`}
                            />
                            <Stat
                                titleIcon={<PowerOutlined fontSize="small" />}
                                label="Power"
                                value={formatKw(contract.powerKw)}
                                subheader="provisioned"
                            />
                            <Stat
                                titleIcon={<RouterOutlined fontSize="small" />}
                                label="Uplink"
                                value={formatGbps(contract.uplinkGbps)}
                                subheader={formatMs(dataCenter.latency)}
                            />
                        </div>
                        
                        <div>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
                                textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
                                marginBottom: 6,
                            }}>
                                <span>Rack Utilization</span>
                                <span style={{ color: '#0af5b0', fontFamily: "'Fira Code', monospace" }}>
                                    {Math.round((contract.racks / contract.rackCap) * 100)}%
                                </span>
                            </div>
                            <ShimmerProgress value={(contract.racks / contract.rackCap) * 100} color="accent" />
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <div style={{
                                fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
                                textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
                                fontFamily: "'Fira Code', monospace",
                            }}>
                                Capacity Upgrades
                            </div>
                        
                            <UpgradeRow
                                icon={<BoltOutlined fontSize="small" />}
                                label="Power Capacity"
                                current={contract.powerKw} currentUnit=" kW"
                                nextValue={nextPower?.kw} nextUnit=" kW"
                                cost={nextPower?.cost || 0}
                                canAfford={!!nextPower && money >= nextPower.cost}
                                maxed={!nextPower}
                                onUpgrade={() => onUpgradePower(dataCenter.id, nextPower?.kw || 0, nextPower?.cost || 0)}
                            />
                        
                            <UpgradeRow
                                icon={<RouterOutlined fontSize="small" />}
                                label="Uplink Speed"
                                current={formatGbps(contract.uplinkGbps)} currentUnit=""
                                nextValue={nextUplink ? formatGbps(nextUplink.gbps) : ''} nextUnit=""
                                cost={nextUplink?.cost || 0}
                                canAfford={!!nextUplink && money >= nextUplink.cost}
                                maxed={!nextUplink}
                                onUpgrade={() => onUpgradeUplink(dataCenter.id, nextUplink?.gbps || 0, nextUplink?.cost || 0)}
                            />
                        </div>
                    </>
                ) : (
                    <Table className="data-center-card-contract-table">
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <ApartmentOutlined fontSize="small" />
                                        <span>Provider</span>
                                    </div>
                                    </TableCell>
                                <TableCell>{dataCenter.provider}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <ShieldOutlined fontSize="small" />
                                        <span>Facility Tier</span>
                                    </div>
                                    </TableCell>
                                <TableCell>{`Tier ${dataCenter.tier}`}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <BoltOutlined fontSize="small" />
                                        <span>Power Rate</span>
                                    </div>
                                    </TableCell>
                                <TableCell>{`$${dataCenter.ratePerKw.toFixed(3)} / kWh`}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <SpeedOutlined fontSize="small" />
                                        <span>Avg Latency</span>
                                    </div>
                                    </TableCell>
                                <TableCell>{formatMs(dataCenter.latency)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <RequestQuoteOutlined fontSize="small" />
                                        <span>Base Lease</span>
                                    </div>
                                    </TableCell>
                                <TableCell className="accent">{formatMoneyDay(dataCenter.baseLeaseDay)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={2}>
                                    <div style={{
                                        padding: 12,
                                        background: 'rgba(38,198,218,0.06)',
                                        border: '1px dashed rgba(38,198,218,0.28)',
                                        borderRadius: 8,
                                        fontSize: 12, lineHeight: 1.5,
                                        color: 'rgba(255,255,255,0.65)',
                                    }}>
                                        <div style={{
                                            fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
                                            color: '#26c6da', textTransform: 'uppercase', marginBottom: 4,
                                            fontFamily: "'Fira Code', monospace",
                                        }}>
                                            Starter Allocation
                                        </div>
                                        Initial contract provisions <strong>1 rack</strong>, <strong>6 kW</strong> of power, and a <strong>1 Gbps</strong> uplink.
                                        All limits can be expanded post-signing.
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                )}
            </CardContent>
                
            <CardActions style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                {signed ? (
                    <>
                        <Button className="data-center-card-floor-plan-button" variant="text" color="primary" startIcon={<OpenInNewOutlined fontSize="small" />}>
                            View Floor Plan
                        </Button>
                        <Button
                            className="data-center-card-install-rack-button"
                            variant="contained" color="primary" size="medium"
                            onClick={() => onAddRack(dataCenter.id, dataCenter.rackCost)}
                            disabled={contract.racks >= contract.rackCap}
                            startIcon={<AddOutlined fontSize="small" />}
                        >
                            Install Rack
                        </Button>
                    </>
                ) : (
                    <>
                        <Button className="data-center-card-floor-plan-button" variant="text" color="primary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            className="data-center-card-install-rack-button"
                            variant="contained" color="primary" size="medium"
                            onClick={() => onSign(dataCenter.id)}
                            disabled={money < dataCenter.baseLeaseDay * 7}
                            startIcon={<DrawOutlined fontSize="small" />}
                        >
                            Sign Contract · {formatMoney(dataCenter.baseLeaseDay * 7)}
                        </Button>
                    </>
                )}
            </CardActions>
        </Card>
    );
}