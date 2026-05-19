/* global React, MuiIcon, MuiChip, MuiIconButton, ServerChip, TIER_COLORS, TIER_NAMES */

const U_HEIGHT = 22; // pixels per rack unit

// ── Hover tooltip ──────────────────────────────────────────────────────────
function ServerTooltip({ server, rackName, anchor }) {
  if (!server || !anchor) return null;
  const color = TIER_COLORS[server.tier] || '#0af5b0';

  // Position above-right of the cursor, clamped within viewport.
  const W = 280;
  const pad = 12;
  let left = anchor.x + 16;
  if (left + W + pad > window.innerWidth) left = anchor.x - W - 16;
  let top = anchor.y + 12;
  if (top + 320 > window.innerHeight) top = anchor.y - 320;
  if (top < 8) top = 8;

  const utilColor = server.util > 85 ? '#ff9800' : server.util > 60 ? '#0af5b0' : 'rgba(255,255,255,0.85)';

  return (
    <div style={{
      position: 'fixed', left, top, width: W, zIndex: 9998,
      background: 'rgba(18,18,20,0.96)',
      backdropFilter: 'blur(8px)',
      border: `1px solid ${color}55`,
      borderRadius: 8,
      boxShadow: '0 16px 48px rgba(0,0,0,0.75)',
      pointerEvents: 'none',
      overflow: 'hidden',
    }}>
      {/* Header strip */}
      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: `linear-gradient(180deg, ${color}1F, transparent)`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 4,
          background: `${color}26`, color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MuiIcon name="dns" size={14} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 600,
            color: 'rgba(255,255,255,0.95)',
          }}>
            {server.sku}
            <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>· {server.size}U</span>
          </div>
          <div style={{
            fontSize: 9, fontWeight: 600, letterSpacing: '0.16em',
            textTransform: 'uppercase', color,
          }}>
            {TIER_NAMES[server.tier]} TIER
          </div>
        </div>
        <span style={{
          fontFamily: "'Fira Code', monospace", fontSize: 10,
          color: 'rgba(255,255,255,0.5)',
        }}>
          U{server.u}
        </span>
      </div>

      {/* Spec grid */}
      <div style={{
        padding: '10px 12px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {[
          { label: 'RACK',    value: rackName.replace(' · ', ' '), mono: false },
          { label: 'INST ID', value: server.instId.toUpperCase(), mono: true },
          { label: 'POWER',   value: server.watts + ' W', mono: true },
          { label: 'UPTIME',  value: server.uptime || '—', mono: true },
        ].map((s) => (
          <div key={s.label}>
            <div style={{ fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
            <div style={{
              fontSize: 11, fontWeight: 600, marginTop: 1,
              fontFamily: s.mono ? "'Fira Code', monospace" : 'Inter, sans-serif',
              color: 'rgba(255,255,255,0.92)',
            }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Utilization bar */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)',
          marginBottom: 4,
        }}>
          <span>UTILIZATION</span>
          <span style={{ color: utilColor, fontFamily: "'Fira Code', monospace" }}>
            {server.util.toFixed(0)}%
          </span>
        </div>
        <div style={{
          height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.min(100, server.util)}%`, height: '100%',
            background: utilColor, boxShadow: `0 0 8px ${utilColor}99`,
            transition: 'width 250ms ease',
          }} />
        </div>
      </div>

      {/* Ciphers list */}
      <div style={{ padding: '10px 12px' }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)',
          marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <MuiIcon name="code" size={11} />
          ACTIVE CIPHERS · {server.ciphers ? server.ciphers.length : 0}
        </div>
        {(!server.ciphers || server.ciphers.length === 0) ? (
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic',
            padding: '6px 0',
          }}>
            Idle · awaiting workload
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {server.ciphers.map((c, i) => (
              <div key={i} style={{
                padding: '6px 8px', borderRadius: 4,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 600,
                  color: 'rgba(255,255,255,0.92)', marginBottom: 4,
                }}>
                  <span style={{ color: '#0af5b0' }}>{c.name}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>ETA {c.eta}</span>
                </div>
                <div style={{
                  height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${c.progress}%`, height: '100%',
                    background: '#0af5b0', boxShadow: '0 0 6px rgba(10,245,176,0.5)',
                  }} />
                </div>
                <div style={{
                  fontFamily: "'Fira Code', monospace", fontSize: 9,
                  color: 'rgba(255,255,255,0.5)', marginTop: 3,
                }}>
                  {c.progress.toFixed(0)}% complete
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Build a slot map: occupied[u] = installedServer (the head). Returns array length = slots+1 (1-indexed).
function buildSlotMap(rack) {
  const occ = new Array(rack.slots + 1).fill(null);
  for (const s of rack.installed) {
    for (let i = 0; i < s.size; i++) {
      occ[s.u + i] = { ...s, _isHead: i === 0 };
    }
  }
  return occ;
}

// Can we install `size` units starting at `startU`?
function canPlace(rack, startU, size, ignoreInstId) {
  if (startU < 1 || startU + size - 1 > rack.slots) return false;
  for (const s of rack.installed) {
    if (ignoreInstId && s.instId === ignoreInstId) continue;
    const a1 = s.u, a2 = s.u + s.size - 1;
    const b1 = startU, b2 = startU + size - 1;
    if (!(b2 < a1 || b1 > a2)) return false;
  }
  return true;
}

function RackUnit({ rack, draggingServer, draggingFromRackId, draggingFromInstId, onDrop, onRemove, onSelect, onMoveDragStart, onDragEndAny, selectedInstId, onHoverServer }) {
  const [hoverU, setHoverU] = React.useState(null);
  const slotMap = React.useMemo(() => buildSlotMap(rack), [rack]);
  const headerH = 36;
  const footerH = 28;
  const totalH = rack.slots * U_HEIGHT + headerH + footerH + 16;

  const occupied = rack.installed.reduce((a, s) => a + s.size, 0);
  const fillPct = Math.round((occupied / rack.slots) * 100);

  const handleDragOver = (e, u) => {
    if (!draggingServer) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoverU(u);
  };
  const handleDrop = (e, u) => {
    e.preventDefault();
    setHoverU(null);
    if (!draggingServer) return;
    const ignoreId = (draggingFromRackId === rack.id) ? draggingFromInstId : null;
    if (canPlace(rack, u, draggingServer.size, ignoreId)) {
      onDrop(rack.id, u, draggingServer);
    }
  };

  // for hover highlight, compute the range (ignoring self if moving within rack)
  const ignoreId = (draggingFromRackId === rack.id) ? draggingFromInstId : null;
  const hoverRange = (hoverU != null && draggingServer) ? {
    start: hoverU,
    end: hoverU + draggingServer.size - 1,
    valid: canPlace(rack, hoverU, draggingServer.size, ignoreId),
  } : null;

  return (
    <div style={{
      position: 'relative',
      width: 280,
      flex: '0 0 auto',
      background: 'linear-gradient(180deg, rgba(35,35,38,0.92), rgba(20,20,22,0.92))',
      border: '1px solid rgba(255,255,255,0.10)',
      borderRadius: 10,
      padding: 8,
      boxShadow: '0 6px 20px rgba(0,0,0,0.55)',
    }}>
      {/* Rack chassis header */}
      <div style={{
        height: headerH,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 10px',
        background: 'linear-gradient(180deg, #1d1f22, #0e1011)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '6px 6px 0 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="live-dot" style={{ width: 6, height: 6 }} />
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 600, color: '#0af5b0', letterSpacing: '0.06em' }}>
            {rack.name.split(' · ')[0]}
          </span>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: "'Fira Code', monospace", letterSpacing: '0.08em' }}>
          {rack.slots}U
        </div>
      </div>

      {/* The rack body — slot grid */}
      <div style={{
        position: 'relative',
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.4), rgba(0,0,0,0.4) 1px, rgba(8,8,10,0.92) 1px, rgba(8,8,10,0.92) ' + U_HEIGHT + 'px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderTop: 'none',
        height: rack.slots * U_HEIGHT,
        overflow: 'hidden',
      }}>
        {/* U-number column on the left */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 22,
          background: 'linear-gradient(90deg, rgba(0,0,0,0.5), transparent)',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Fira Code', monospace", fontSize: 8,
          color: 'rgba(255,255,255,0.35)',
          paddingTop: 2,
          zIndex: 1,
          pointerEvents: 'none',
        }}>
          {Array.from({ length: rack.slots }, (_, i) => (
            <div key={i} style={{ height: U_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Drop zones (one per U) — also allow zones currently occupied by the
            server being moved within this rack so it can shift. */}
        {Array.from({ length: rack.slots }, (_, i) => {
          const u = i + 1;
          const occ = slotMap[u];
          const isSelfSlot = occ && draggingFromRackId === rack.id && occ.instId === draggingFromInstId;
          if (occ && !isSelfSlot) return null;
          const inHover = hoverRange && u >= hoverRange.start && u <= hoverRange.end;
          return (
            <div key={u}
              onDragOver={(e) => handleDragOver(e, u)}
              onDragLeave={() => setHoverU(null)}
              onDrop={(e) => handleDrop(e, u)}
              className={inHover && hoverRange.valid ? 'drop-active' : ''}
              style={{
                position: 'absolute', left: 22, right: 4,
                top: i * U_HEIGHT, height: U_HEIGHT,
                background: inHover
                  ? (hoverRange.valid ? 'rgba(10,245,176,0.18)' : 'rgba(244,67,54,0.18)')
                  : 'transparent',
                border: inHover
                  ? `1px dashed ${hoverRange.valid ? '#0af5b0' : '#f44336'}`
                  : '1px dashed transparent',
                borderRadius: 3,
              }}
            />
          );
        })}

        {/* Installed servers */}
        {rack.installed.map((s) => {
          const top = (s.u - 1) * U_HEIGHT;
          const height = s.size * U_HEIGHT - 2;
          const selected = selectedInstId === s.instId;
          const isBeingMoved = draggingFromRackId === rack.id && draggingFromInstId === s.instId;
          const oneU = height <= 24;
          return (
            <div key={s.instId}
              draggable
              onClick={() => onSelect(s.instId)}
              onMouseEnter={(e) => onHoverServer && onHoverServer(s, rack, { x: e.clientX, y: e.clientY })}
              onMouseMove={(e) => onHoverServer && onHoverServer(s, rack, { x: e.clientX, y: e.clientY })}
              onMouseLeave={() => onHoverServer && onHoverServer(null, null, null)}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', 'move:' + s.instId);
                onMoveDragStart(rack.id, s);
                onHoverServer && onHoverServer(null, null, null);
              }}
              onDragEnd={() => onDragEndAny()}
              style={{
                position: 'absolute', left: 24, right: 6,
                top: top + 1, height,
                cursor: 'grab',
                outline: selected ? '1px solid #0af5b0' : 'none',
                outlineOffset: 1,
                borderRadius: 4,
                opacity: isBeingMoved ? 0.35 : 1,
                zIndex: 2,
              }}
            >
              <ServerChip server={s} height={height} />

              {/* Uninstall button */}
              <button
                title="Uninstall"
                onClick={(e) => { e.stopPropagation(); onRemove(rack.id, s.instId); }}
                style={{
                  position: 'absolute',
                  top: oneU ? 1 : 2,
                  right: 2,
                  width: oneU ? 16 : 18,
                  height: oneU ? U_HEIGHT - 4 : 18,
                  borderRadius: oneU ? 3 : 4,
                  background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0,
                }}
              >
                <MuiIcon name="close" size={oneU ? 10 : 12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Rack footer / fill bar */}
      <div style={{
        height: footerH,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 10px',
        background: 'linear-gradient(180deg, #0e1011, #1d1f22)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderTop: 'none',
        borderRadius: '0 0 6px 6px',
      }}>
        <MuiIcon name="bolt" size={12} style={{ color: 'rgba(255,152,0,0.7)' }} />
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
          {rack.installed.reduce((a, s) => a + s.watts, 0)}W
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          flex: 1, height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
        }}>
          <div style={{
            width: `${fillPct}%`, height: '100%', background: '#0af5b0',
            boxShadow: '0 0 6px rgba(10,245,176,0.5)',
          }} />
        </div>
        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: '#0af5b0', minWidth: 28, textAlign: 'right' }}>
          {fillPct}%
        </div>
      </div>
    </div>
  );
}

function RackFloor({ racks, draggingServer, draggingFromRackId, draggingFromInstId, onDrop, onRemoveInstalled, onAddRack, onSelectServer, onMoveDragStart, onDragEndAny, selectedInstId }) {
  const [hover, setHover] = React.useState(null); // { server, rack, anchor }
  const handleHover = React.useCallback((server, rack, anchor) => {
    if (!server) setHover(null);
    else setHover({ server, rack, anchor });
  }, []);
  return (
    <>
    <div style={{
      background: 'rgba(25,25,25,0.78)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column',
      minHeight: 0, height: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: 'rgba(10,245,176,0.15)', color: '#0af5b0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MuiIcon name="dns" size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>Rack Floor</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>
            {racks.length} RACKS · {racks.reduce((a, r) => a + r.installed.length, 0)} INSTALLED
          </div>
        </div>
        <MuiChip label="HOT/COLD AISLE" color="cyan" variant="outlined" size="small"
          icon={<MuiIcon name="ac_unit" size={12} />} />
      </div>

      {/* Floor scroll area */}
      <div style={{
        flex: 1, overflowX: 'auto', overflowY: 'auto',
        padding: 18,
        background:
          'radial-gradient(circle at 30% 20%, rgba(10,245,176,0.04), transparent 50%),' +
          'radial-gradient(circle at 80% 70%, rgba(38,198,218,0.04), transparent 50%)',
      }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', minHeight: '100%' }}>
          {racks.map((r) => (
            <RackUnit key={r.id}
              rack={r}
              draggingServer={draggingServer}
              draggingFromRackId={draggingFromRackId}
              draggingFromInstId={draggingFromInstId}
              onDrop={onDrop}
              onRemove={onRemoveInstalled}
              onSelect={onSelectServer}
              onMoveDragStart={onMoveDragStart}
              onDragEndAny={onDragEndAny}
              onHoverServer={handleHover}
              selectedInstId={selectedInstId}
            />
          ))}

          {/* Add rack ghost slot */}
          <button
            onClick={onAddRack}
            style={{
              width: 280, alignSelf: 'stretch',
              minHeight: 320,
              background: 'rgba(255,255,255,0.02)',
              border: '2px dashed rgba(255,255,255,0.16)',
              borderRadius: 10,
              color: 'rgba(255,255,255,0.55)',
              cursor: 'pointer', display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 10, padding: 20,
              transition: 'border-color 200ms, color 200ms, background 200ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(10,245,176,0.6)'; e.currentTarget.style.color = '#0af5b0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
          >
            <MuiIcon name="add_circle" size={36} />
            <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Add Rack</div>
            <div style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>
              From $4,500
            </div>
          </button>
        </div>
      </div>
    </div>
    {hover && <ServerTooltip server={hover.server} rackName={hover.rack.name} anchor={hover.anchor} />}
    </>
  );
}

window.RackFloor = RackFloor;
window.canPlace = canPlace;
