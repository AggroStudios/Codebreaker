/* global React, ReactDOM,
   MuiIcon, MuiAvatar, MuiCard, MuiCardHeader, MuiCardContent,
   MuiButton, MuiIconButton, MuiChip,
   TweaksPanel, useTweaks, TweakSection, TweakSlider, TweakToggle, TweakRadio, TweakSelect,
   RACK_CATALOG, INITIAL_RACKS, INVENTORY, INITIAL_SWITCHES, TIER_COLORS, fmtRackMoney,
   Inventory, RackFloor, TopologyPanel, canPlace */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "scanlines": true,
  "density": "comfortable",
  "uplinkStatus": "UP",
  "showTopology": true,
  "showPower": true,
  "rackBgDim": 70
}/*EDITMODE-END*/;

const DATA_CENTERS = [
  { id: 'dc-sea',  name: 'Seattle-01', region: 'us-west', tier: 'Tier III', power: '480 kW', flag: '🇺🇸', primary: true },
  { id: 'dc-fra',  name: 'Frankfurt-02', region: 'eu-central', tier: 'Tier IV', power: '720 kW', flag: '🇩🇪' },
  { id: 'dc-sgp',  name: 'Singapore-01', region: 'apac', tier: 'Tier III', power: '320 kW', flag: '🇸🇬' },
  { id: 'dc-rey',  name: 'Reykjavik-01', region: 'eu-north', tier: 'Tier II · Geo', power: '200 kW', flag: '🇮🇸' },
];

function DataCenterPicker({ selected, onSelect }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const dc = DATA_CENTERS.find((d) => d.id === selected) || DATA_CENTERS[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 12px',
          background: 'rgba(25,25,25,0.85)',
          border: '1px solid rgba(10,245,176,0.30)',
          borderRadius: 8, cursor: 'pointer',
          color: 'rgba(255,255,255,0.92)',
          minWidth: 240,
        }}
      >
        <span style={{ fontSize: 18 }}>{dc.flag}</span>
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: 'rgba(10,245,176,0.85)',
            fontFamily: "'Fira Code', monospace",
          }}>DATACENTER</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {dc.name} <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>· {dc.region}</span>
          </div>
        </div>
        <MuiIcon name={open ? 'arrow_drop_up' : 'arrow_drop_down'} size={20} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          minWidth: 320,
          background: 'rgba(28,28,30,0.98)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8,
          boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          zIndex: 50, padding: 6,
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{
            padding: '6px 10px',
            fontSize: 10, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)',
            fontFamily: "'Fira Code', monospace",
          }}>SWITCH DATACENTER</div>
          {DATA_CENTERS.map((d) => {
            const active = d.id === selected;
            return (
              <div key={d.id}
                onClick={() => { onSelect(d.id); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 10px', borderRadius: 6,
                  background: active ? 'rgba(10,245,176,0.10)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(10,245,176,0.30)' : 'transparent'}`,
                  cursor: 'pointer', marginBottom: 2,
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 22 }}>{d.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 600, color: active ? '#0af5b0' : 'rgba(255,255,255,0.92)',
                  }}>
                    {d.name}
                    {d.primary && (
                      <span style={{
                        fontSize: 9, padding: '1px 5px', borderRadius: 3,
                        background: 'rgba(10,245,176,0.15)', color: '#0af5b0',
                        fontFamily: "'Fira Code', monospace", letterSpacing: '0.08em',
                      }}>PRIMARY</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: "'Fira Code', monospace" }}>
                    {d.region} · {d.tier} · {d.power}
                  </div>
                </div>
                {active && <MuiIcon name="check" size={16} style={{ color: '#0af5b0' }} />}
              </div>
            );
          })}
          <div style={{
            marginTop: 4, padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'rgba(255,255,255,0.7)', fontSize: 12, cursor: 'pointer', borderRadius: 6,
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <MuiIcon name="add_business" size={16} style={{ color: '#0af5b0' }} />
            Lease new datacenter…
          </div>
        </div>
      )}
    </div>
  );
}

// ── Brand strip (kept consistent with Station v2 / Servers Store) ───────────
function BrandStrip() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      marginBottom: 20, paddingBottom: 14,
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 6,
        background: 'linear-gradient(180deg, #00e5bf, #003d35)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 12px rgba(10,245,176,0.4)',
      }}>
        <MuiIcon name="terminal" size={18} style={{ color: '#0a0f0d' }} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.92)' }}>
        CODEBREAKER
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'Fira Code', monospace" }}>v3.4.1</div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', gap: 4 }}>
        {['terminal', 'important_devices', 'storage', 'apartment', 'router', 'public', 'share'].map((ic, i) => (
          <MuiIconButton key={ic} title={ic} color={i === 3 ? 'primary' : 'default'}>
            <MuiIcon name={ic} />
          </MuiIconButton>
        ))}
      </div>
    </div>
  );
}

// ── Page header with UPLINK status indicator on the right ───────────────────
function PageHeader({ uplink, racks, switches, selectedDC, onSelectDC }) {
  const status = uplink.status;
  const statusColor = status === 'UP' ? 'accent' : status === 'DEGRADED' ? 'warn' : 'error';
  const dotClass = status === 'UP' ? '' : status === 'DEGRADED' ? 'warn' : 'error';
  const downSwitches = switches.filter((s) => s.status !== 'UP').length;
  const dc = DATA_CENTERS.find((d) => d.id === selectedDC) || DATA_CENTERS[0];
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      gap: 20, marginBottom: 20, flexWrap: 'wrap',
    }}>
      <div>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(10,245,176,0.85)',
          fontFamily: "'Fira Code', monospace", marginBottom: 6,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <MuiIcon name="apartment" size={16} />
          /home/operator/datacenter/{dc.id}/racks
        </div>
        <h1 style={{
          margin: 0, fontSize: 38, fontWeight: 700, lineHeight: 1.1,
          letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.96)',
        }}>
          Server Racks
        </h1>
        <div style={{
          marginTop: 8, fontSize: 14,
          color: 'rgba(255,255,255,0.55)', maxWidth: 640,
        }}>
          Install your servers, wire racks through switches, and manage the uplink to keep your code-breaking floor online.
        </div>
        <div style={{ marginTop: 14 }}>
          <DataCenterPicker selected={selectedDC} onSelect={onSelectDC} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <MuiChip
          label={<><span className={`live-dot ${dotClass}`} style={{ marginRight: 6 }} />UPLINK {status}</>}
          color={statusColor} variant="outlined"
        />
        <MuiChip
          label={`${uplink.bandwidth} · ${uplink.latency}`}
          color="default" variant="outlined"
          icon={<MuiIcon name="public" size={14} />}
        />
        {downSwitches > 0 && (
          <MuiChip
            label={`${downSwitches} SWITCH ALERT${downSwitches > 1 ? 'S' : ''}`}
            color="warn" variant="outlined"
            icon={<MuiIcon name="warning" size={14} />}
          />
        )}
      </div>
    </div>
  );
}

// ── Stat strip ──────────────────────────────────────────────────────────────
function RackStatStrip({ racks, switches, uplink, inventory }) {
  const totalSlots = racks.reduce((a, r) => a + r.slots, 0);
  const usedSlots = racks.reduce((a, r) => a + r.installed.reduce((b, s) => b + s.size, 0), 0);
  const totalServers = racks.reduce((a, r) => a + r.installed.length, 0);
  const totalWatts = racks.reduce((a, r) => a + r.installed.reduce((b, s) => b + s.watts, 0), 0);
  const throughput = (
    racks.reduce((a, r) => a + r.installed.reduce((b, s) => b + s.util, 0), 0) / Math.max(1, totalServers) || 0
  ).toFixed(0);

  const cells = [
    { icon: 'apartment', label: 'RACKS DEPLOYED', value: racks.length, meta: `${totalSlots}U capacity` },
    { icon: 'dns',       label: 'SERVERS INSTALLED', value: `${totalServers}`, meta: `${usedSlots}/${totalSlots}U used`, accent: true },
    { icon: 'inventory_2', label: 'IN INVENTORY', value: inventory.length, meta: 'awaiting install' },
    { icon: 'router',    label: 'ACTIVE SWITCHES', value: `${switches.filter((s) => s.status === 'UP').length}/${switches.length}`, meta: `${switches.reduce((a, s) => a + s.used, 0)} ports up` },
    { icon: 'speed',     label: 'AVG LOAD', value: throughput + '%', meta: 'across rack floor', positive: throughput < 80 },
    { icon: 'bolt',      label: 'POWER DRAW', value: (totalWatts / 1000).toFixed(2) + ' kW', meta: 'PUE 1.18' },
  ];
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
      gap: 12, marginBottom: 20,
    }}>
      {cells.map((c) => (
        <div key={c.label} style={{
          background: 'rgba(25,25,25,0.80)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: 4,
          minWidth: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
          }}>
            <MuiIcon name={c.icon} size={13} style={{ color: 'rgba(10,245,176,0.7)' }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
          </div>
          <div style={{
            fontSize: 20, fontWeight: 700, lineHeight: 1.15,
            fontFamily: "'Fira Code', monospace",
            color: c.accent ? '#0af5b0' : c.positive ? '#28ff28' : 'rgba(255,255,255,0.92)',
            textShadow: c.accent ? '0 0 12px rgba(10,245,176,0.4)' : 'none',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{c.value}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: "'Fira Code', monospace" }}>
            {c.meta}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page root ───────────────────────────────────────────────────────────────
function RacksPage() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [racks, setRacks] = React.useState(INITIAL_RACKS);
  const [inventory, setInventory] = React.useState(INVENTORY);
  const [switches, setSwitches] = React.useState(INITIAL_SWITCHES);
  const [draggingId, setDraggingId] = React.useState(null);
  const [moveDrag, setMoveDrag] = React.useState(null); // {rackId, server}
  const [selectedInstId, setSelectedInstId] = React.useState(null);
  const [selectedDC, setSelectedDC] = React.useState('dc-sea');

  const [uplink, setUplink] = React.useState({
    provider: 'AggroNet Tier-1',
    status: 'UP',
    bandwidth: '10 Gbps',
    latency: '4 ms',
    ip: '198.51.100.42',
    asn: 'AS64512',
  });

  React.useEffect(() => {
    document.body.classList.toggle('scanlines', !!tweaks.scanlines);
  }, [tweaks.scanlines]);

  React.useEffect(() => {
    setUplink((u) => ({ ...u, status: tweaks.uplinkStatus }));
  }, [tweaks.uplinkStatus]);

  // Live shimmer on installed-server util % + cipher progress
  React.useEffect(() => {
    const id = setInterval(() => {
      setRacks((rs) => rs.map((r) => ({
        ...r,
        installed: r.installed.map((s) => {
          const util = Math.max(8, Math.min(99, s.util + (Math.random() - 0.5) * 6));
          const ciphers = (s.ciphers || []).map((c) => {
            let p = c.progress + 1 + Math.random() * 3;
            if (p >= 100) {
              // pick a new cipher
              const pool = window.CIPHER_POOL || ['SHA-256', 'MD5', 'AES-128'];
              return { name: pool[Math.floor(Math.random() * pool.length)], progress: Math.random() * 10, eta: `${(20 + Math.random() * 90) | 0}s` };
            }
            return { ...c, progress: p };
          });
          return { ...s, util, ciphers };
        }),
      })));
    }, 800);
    return () => clearInterval(id);
  }, []);

  const draggingServer = React.useMemo(() => {
    if (moveDrag) return moveDrag.server;
    if (!draggingId) return null;
    return inventory.find((i) => i.instId === draggingId);
  }, [draggingId, moveDrag, inventory]);

  const onDrop = (rackId, u, server) => {
    // Move from another rack (or within same rack)
    if (moveDrag) {
      setRacks((rs) => {
        // remove from source
        const stripped = rs.map((r) => r.id === moveDrag.rackId
          ? { ...r, installed: r.installed.filter((s) => s.instId !== moveDrag.server.instId) }
          : r);
        // place into target (re-check capacity ignoring self)
        return stripped.map((r) => {
          if (r.id !== rackId) return r;
          if (!canPlace(r, u, server.size)) return r;
          return {
            ...r,
            installed: [...r.installed, {
              instId: moveDrag.server.instId, sku: moveDrag.server.sku, name: moveDrag.server.name,
              u, size: moveDrag.server.size, tier: moveDrag.server.tier, watts: moveDrag.server.watts,
              util: moveDrag.server.util ?? (20 + Math.random() * 40),
            }],
          };
        });
      });
      setMoveDrag(null);
      return;
    }
    // Install from inventory
    setRacks((rs) => rs.map((r) => {
      if (r.id !== rackId) return r;
      if (!canPlace(r, u, server.size)) return r;
      return {
        ...r,
        installed: [...r.installed, {
          instId: server.instId, sku: server.sku, name: server.name,
          u, size: server.size, tier: server.tier, watts: server.watts,
          util: 20 + Math.random() * 40,
          uptime: '0d 00h',
          ciphers: [{
            name: (window.CIPHER_POOL || ['SHA-256'])[Math.floor(Math.random() * 8) % (window.CIPHER_POOL || ['SHA-256']).length],
            progress: Math.random() * 10,
            eta: `${(20 + Math.random() * 90) | 0}s`,
          }],
        }],
      };
    }));
    setInventory((inv) => inv.filter((i) => i.instId !== server.instId));
    setDraggingId(null);
  };

  const onRemoveInstalled = (rackId, instId) => {
    let removed = null;
    setRacks((rs) => rs.map((r) => {
      if (r.id !== rackId) return r;
      const target = r.installed.find((s) => s.instId === instId);
      if (target) removed = target;
      return { ...r, installed: r.installed.filter((s) => s.instId !== instId) };
    }));
    if (removed) {
      setInventory((inv) => [...inv, {
        instId: removed.instId, sku: removed.sku, name: removed.name,
        size: removed.size, tier: removed.tier, watts: removed.watts,
      }]);
    }
  };

  const onAddRack = () => {
    const id = 'rack-' + Math.random().toString(36).slice(2, 6);
    setRacks((rs) => [...rs, {
      id, sku: 'RK-24U', slots: 24,
      name: `Rack ${String.fromCharCode(65 + rs.length)} · New`,
      switchId: null, installed: [],
    }]);
  };

  const onAssignRack = (rackId, switchId) => {
    setRacks((rs) => rs.map((r) => r.id === rackId ? { ...r, switchId } : r));
    setSwitches((ss) => ss.map((s) => {
      const count = (rackId !== null && switchId === s.id ? 1 : 0);
      // recompute based on assignment
      return s;
    }));
  };

  const onCycleUplink = () => {
    const seq = ['UP', 'DEGRADED', 'DOWN'];
    const next = seq[(seq.indexOf(uplink.status) + 1) % seq.length];
    setUplink((u) => ({ ...u, status: next }));
    setTweak('uplinkStatus', next);
  };

  const dense = tweaks.density === 'compact';

  return (
    <div style={{
      minHeight: '100%',
      padding: dense ? '20px 24px 100px' : '32px 40px 100px',
      maxWidth: 1700, margin: '0 auto',
    }}>
      <BrandStrip />
      <PageHeader uplink={uplink} racks={racks} switches={switches} selectedDC={selectedDC} onSelectDC={setSelectedDC} />
      <RackStatStrip racks={racks} switches={switches} uplink={uplink} inventory={inventory} />

      {/* 3-column working area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: tweaks.showTopology
          ? 'minmax(260px, 280px) minmax(0, 1fr) minmax(300px, 340px)'
          : 'minmax(260px, 280px) minmax(0, 1fr)',
        gap: 16,
        height: 'calc(100vh - 380px)',
        minHeight: 640,
      }}>
        <Inventory
          items={inventory}
          draggingId={draggingId}
          onDragStart={setDraggingId}
          onDragEnd={() => setDraggingId(null)}
          onAddRack={onAddRack}
        />
        <RackFloor
          racks={racks}
          draggingServer={draggingServer}
          draggingFromRackId={moveDrag?.rackId || null}
          draggingFromInstId={moveDrag?.server.instId || null}
          onDrop={onDrop}
          onRemoveInstalled={onRemoveInstalled}
          onAddRack={onAddRack}
          onSelectServer={setSelectedInstId}
          onMoveDragStart={(rackId, server) => setMoveDrag({ rackId, server })}
          onDragEndAny={() => { setMoveDrag(null); setDraggingId(null); }}
          selectedInstId={selectedInstId}
        />
        {tweaks.showTopology && (
          <TopologyPanel
            uplink={uplink}
            switches={switches}
            racks={racks}
            onAssignRack={onAssignRack}
            onCycleUplink={onCycleUplink}
          />
        )}
      </div>

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Layout">
          <TweakRadio
            label="Density"
            value={tweaks.density}
            options={[{ label: 'Comfortable', value: 'comfortable' }, { label: 'Compact', value: 'compact' }]}
            onChange={(v) => setTweak('density', v)}
          />
          <TweakToggle label="Topology panel" checked={tweaks.showTopology} onChange={(v) => setTweak('showTopology', v)} />
          <TweakToggle label="Power footers" checked={tweaks.showPower} onChange={(v) => setTweak('showPower', v)} />
        </TweakSection>
        <TweakSection title="Visual">
          <TweakToggle label="Scanlines" checked={tweaks.scanlines} onChange={(v) => setTweak('scanlines', v)} />
        </TweakSection>
        <TweakSection title="Network">
          <TweakRadio
            label="Uplink status"
            value={tweaks.uplinkStatus}
            options={[
              { label: 'Up', value: 'UP' },
              { label: 'Degraded', value: 'DEGRADED' },
              { label: 'Down', value: 'DOWN' },
            ]}
            onChange={(v) => setTweak('uplinkStatus', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<RacksPage />);
