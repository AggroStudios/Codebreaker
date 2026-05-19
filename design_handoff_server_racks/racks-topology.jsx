/* global React, MuiIcon, MuiChip, MuiButton, MuiIconButton */

function UplinkPanel({ uplink, onCycle }) {
  const status = uplink.status; // UP / DEGRADED / DOWN
  const color = status === 'UP' ? '#0af5b0' : status === 'DEGRADED' ? '#ff9800' : '#f44336';
  const dotClass = status === 'UP' ? '' : status === 'DEGRADED' ? 'warn' : 'error';
  return (
    <div style={{
      padding: 14,
      background: 'linear-gradient(180deg, rgba(10,245,176,0.06), rgba(0,0,0,0.2))',
      border: `1px solid ${color}55`,
      borderRadius: 8,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MuiIcon name="public" size={18} style={{ color }} />
        <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
          {uplink.provider}
        </div>
        <span className={`live-dot ${dotClass}`} />
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
      }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)' }}>BANDWIDTH</div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, fontWeight: 600, color }}>{uplink.bandwidth}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)' }}>LATENCY</div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{uplink.latency}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)' }}>PUBLIC IP</div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>{uplink.ip}</div>
        </div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)' }}>ASN</div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>{uplink.asn}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <MuiButton variant="text" color="primary" size="small" startIcon={<MuiIcon name="autorenew" size={14} />} onClick={onCycle}>
          Cycle
        </MuiButton>
        <MuiButton variant="text" color="neutral" size="small" startIcon={<MuiIcon name="settings_ethernet" size={14} />}>
          BGP
        </MuiButton>
      </div>
    </div>
  );
}

function SwitchRow({ sw, racks, onAssign, onSelect, selected }) {
  const status = sw.status;
  const color = status === 'UP' ? '#0af5b0' : status === 'DEGRADED' ? '#ff9800' : '#f44336';
  const connectedRacks = racks.filter((r) => r.switchId === sw.id);
  const usedPct = Math.round((sw.used / sw.ports) * 100);
  return (
    <div onClick={() => onSelect(sw.id)} style={{
      padding: 12,
      background: selected ? 'rgba(10,245,176,0.08)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${selected ? 'rgba(10,245,176,0.45)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 8, cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: 8,
      transition: 'background 200ms, border-color 200ms',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <MuiIcon name="router" size={16} style={{ color }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
            {sw.name}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{sw.model}</div>
        </div>
        <MuiChip label={status} color={status === 'UP' ? 'accent' : status === 'DEGRADED' ? 'warn' : 'error'} size="small" />
      </div>

      {/* Port grid (mini visual) */}
      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {Array.from({ length: sw.ports }).map((_, i) => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: 1,
            background: i < sw.used
              ? (status === 'UP' ? '#0af5b0' : color)
              : 'rgba(255,255,255,0.10)',
            boxShadow: i < sw.used && status === 'UP' ? '0 0 4px rgba(10,245,176,0.6)' : 'none',
          }} />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontFamily: "'Fira Code', monospace", color: 'rgba(255,255,255,0.6)' }}>
        <span>{sw.used}/{sw.ports} PORTS</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
        <span style={{ color }}>{sw.throughput}</span>
        <div style={{ flex: 1 }} />
        <span>{connectedRacks.length} RACK{connectedRacks.length !== 1 ? 'S' : ''}</span>
      </div>

      {selected && (
        <div style={{
          marginTop: 4, paddingTop: 8,
          borderTop: '1px dashed rgba(255,255,255,0.1)',
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em' }}>
            CONNECTED RACKS
          </div>
          {racks.map((r) => {
            const isOn = r.switchId === sw.id;
            return (
              <label key={r.id} onClick={(e) => e.stopPropagation()} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '4px 6px', borderRadius: 4, cursor: 'pointer',
                background: isOn ? 'rgba(10,245,176,0.06)' : 'transparent',
              }}>
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={(e) => onAssign(r.id, e.target.checked ? sw.id : null)}
                  style={{ accentColor: '#0af5b0' }}
                />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', flex: 1 }}>{r.name}</span>
                <span style={{ fontSize: 9, fontFamily: "'Fira Code', monospace", color: 'rgba(255,255,255,0.4)' }}>
                  {r.installed.length} SVR
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NetworkDiagram({ racks, switches, uplink }) {
  const W = 280, H = 220;
  const uplinkX = W / 2, uplinkY = 24;
  const switchY = 100;
  const rackY = 184;

  // position switches across width
  const swCount = switches.length;
  const swPositions = switches.map((sw, i) => ({
    sw, x: ((i + 1) * W) / (swCount + 1), y: switchY,
  }));

  // position racks
  const rackCount = racks.length;
  const rackPositions = racks.map((r, i) => ({
    r, x: ((i + 1) * W) / (rackCount + 1), y: rackY,
  }));

  const swById = Object.fromEntries(swPositions.map(({ sw, x, y }) => [sw.id, { sw, x, y }]));

  return (
    <div style={{
      padding: 12,
      background: 'rgba(0,0,0,0.45)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 8,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
        color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase',
        marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <MuiIcon name="hub" size={12} />
        Live Topology
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        {/* uplink → switches */}
        {swPositions.map(({ sw, x, y }) => {
          const ok = sw.status === 'UP' && uplink.status === 'UP';
          const stroke = ok ? '#0af5b0' : '#ff9800';
          return (
            <line key={'u' + sw.id}
              x1={uplinkX} y1={uplinkY + 8} x2={x} y2={y - 12}
              stroke={stroke} strokeWidth="1.4" strokeOpacity="0.9"
              className="packet-line"
            />
          );
        })}
        {/* switches → racks */}
        {rackPositions.map(({ r, x, y }) => {
          if (!r.switchId) return null;
          const swp = swById[r.switchId];
          if (!swp) return null;
          const ok = swp.sw.status === 'UP';
          return (
            <line key={'r' + r.id}
              x1={swp.x} y1={swp.y + 12} x2={x} y2={y - 10}
              stroke={ok ? '#26c6da' : '#ff9800'} strokeWidth="1.2" strokeOpacity="0.85"
              className="packet-line"
            />
          );
        })}

        {/* uplink node */}
        <g>
          <rect x={uplinkX - 26} y={uplinkY - 10} width="52" height="20" rx="4"
            fill="rgba(10,245,176,0.15)" stroke="#0af5b0" strokeWidth="1" />
          <text x={uplinkX} y={uplinkY + 4} textAnchor="middle"
            fontFamily="'Fira Code', monospace" fontSize="9" fill="#0af5b0" fontWeight="600">
            UPLINK
          </text>
        </g>

        {/* switch nodes */}
        {swPositions.map(({ sw, x, y }) => {
          const c = sw.status === 'UP' ? '#26c6da' : sw.status === 'DEGRADED' ? '#ff9800' : '#f44336';
          return (
            <g key={sw.id}>
              <rect x={x - 24} y={y - 12} width="48" height="24" rx="3"
                fill="rgba(38,198,218,0.12)" stroke={c} strokeWidth="1" />
              <text x={x} y={y + 3} textAnchor="middle"
                fontFamily="'Fira Code', monospace" fontSize="8" fill={c} fontWeight="600">
                {sw.name.replace(/-SW.*/, '').toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* rack nodes */}
        {rackPositions.map(({ r, x, y }) => {
          const c = r.switchId ? '#0af5b0' : '#ff9800';
          return (
            <g key={r.id}>
              <rect x={x - 18} y={y - 10} width="36" height="22" rx="2"
                fill="rgba(0,0,0,0.6)" stroke={c} strokeWidth="1" />
              <text x={x} y={y + 4} textAnchor="middle"
                fontFamily="'Fira Code', monospace" fontSize="8" fill={c} fontWeight="600">
                {r.name.match(/Rack ([A-Z])/)?.[1] || '?'}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TopologyPanel({ uplink, switches, racks, onAssignRack, onCycleUplink }) {
  const [selSw, setSelSw] = React.useState(switches[0]?.id);
  const orphanRacks = racks.filter((r) => !r.switchId);

  return (
    <div style={{
      background: 'rgba(25,25,25,0.82)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column',
      minHeight: 0, height: '100%',
    }}>
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: 'rgba(186,104,200,0.15)', color: '#ba68c8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MuiIcon name="lan" size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>Network</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>
            UPLINK · {switches.length} SWITCHES
          </div>
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto',
        padding: 12, display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <UplinkPanel uplink={uplink} onCycle={onCycleUplink} />

        <NetworkDiagram racks={racks} switches={switches} uplink={uplink} />

        <div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
            color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            <span>Switches</span>
            {orphanRacks.length > 0 && (
              <MuiChip
                label={`${orphanRacks.length} UNLINKED`}
                color="warn" size="small"
                icon={<MuiIcon name="warning" size={11} />}
              />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {switches.map((sw) => (
              <SwitchRow key={sw.id} sw={sw} racks={racks}
                selected={selSw === sw.id}
                onSelect={(id) => setSelSw(selSw === id ? null : id)}
                onAssign={onAssignRack}
              />
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <MuiButton variant="outlined" color="primary" fullWidth
              startIcon={<MuiIcon name="add" size={14} />} size="small">
              Add Switch
            </MuiButton>
          </div>
        </div>
      </div>
    </div>
  );
}

window.TopologyPanel = TopologyPanel;
