/* global React, MuiIcon, MuiChip, MuiButton, TIER_COLORS, TIER_NAMES */

// Compact server card used both in inventory (draggable) and in the rack U-slots.
// When height ≤ 24 (a 1U slot) we collapse into a single-line layout.
function ServerChip({ server, dragging, onDragStart, onDragEnd, compact, height }) {
  const color = TIER_COLORS[server.tier] || '#0af5b0';
  const h = height != null ? height : (compact ? 56 : 64);
  const oneU = h <= 24;

  if (oneU) {
    return (
      <div
        draggable={!!onDragStart}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '0 6px',
          background: 'linear-gradient(180deg, rgba(40,40,42,0.92), rgba(18,18,20,0.92))',
          border: '1px solid rgba(255,255,255,0.10)',
          borderLeft: `3px solid ${color}`,
          borderRadius: 4,
          cursor: onDragStart ? 'grab' : 'default',
          opacity: dragging ? 0.4 : 1,
          height: h, overflow: 'hidden',
          boxShadow: dragging ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
          transition: 'opacity 120ms',
        }}
      >
        {/* single screw */}
        <span style={{ width: 3, height: 3, background: 'rgba(255,255,255,0.25)', borderRadius: '50%', flexShrink: 0 }} />

        {/* SKU + tier */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, flex: 1,
          fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 600,
          lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          <span style={{ color }}>{server.sku}</span>
          <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 500, fontSize: 9 }}>
            {server.watts}W
          </span>
        </div>

        {/* tiny inline LED row */}
        <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          <span className="led-blink" style={{ width: 4, height: 4, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}` }} />
          <span className="led-blink-fast" style={{ width: 4, height: 4, borderRadius: '50%', background: '#28ff28', boxShadow: '0 0 4px #28ff28' }} />
        </div>

        {/* short vent strip */}
        <div style={{
          width: 14, height: 8, borderRadius: 1, flexShrink: 0,
          background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }} />
      </div>
    );
  }

  return (
    <div
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px',
        background: 'linear-gradient(180deg, rgba(40,40,42,0.92), rgba(18,18,20,0.92))',
        border: '1px solid rgba(255,255,255,0.10)',
        borderLeft: `3px solid ${color}`,
        borderRadius: 6,
        cursor: onDragStart ? 'grab' : 'default',
        opacity: dragging ? 0.4 : 1,
        height: h, overflow: 'hidden',
        boxShadow: dragging ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
        transition: 'opacity 120ms',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
        <span style={{ width: 4, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }} />
        <span style={{ width: 4, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 600,
          color: 'rgba(255,255,255,0.92)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          <span style={{ color }}>{server.sku}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{server.size}U</span>
        </div>
        <div style={{
          marginTop: 2,
          fontSize: 10, fontWeight: 600, letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {TIER_NAMES[server.tier]} · {server.watts}W
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginRight: 2, flexShrink: 0 }}>
        <span className="led-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
        <span className="led-blink-fast" style={{ width: 6, height: 6, borderRadius: '50%', background: '#28ff28', boxShadow: '0 0 6px #28ff28' }} />
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
      </div>

      <div style={{
        width: 26, height: '70%', borderRadius: 2, flexShrink: 0,
        background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 2px, transparent 2px, transparent 4px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }} />
    </div>
  );
}

function Inventory({ items, draggingId, onDragStart, onDragEnd, onAddRack }) {
  return (
    <div style={{
      background: 'rgba(25,25,25,0.82)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column',
      minHeight: 0, height: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: 'rgba(38,198,218,0.15)', color: '#26c6da',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MuiIcon name="inventory_2" size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>Inventory</div>
          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}>
            DRAG TO INSTALL · {items.length} UNITS
          </div>
        </div>
      </div>

      {/* Hint */}
      <div style={{
        padding: '10px 16px',
        background: 'rgba(10,245,176,0.05)',
        borderBottom: '1px solid rgba(10,245,176,0.12)',
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 11, color: 'rgba(10,245,176,0.85)',
        fontFamily: "'Fira Code', monospace",
      }}>
        <MuiIcon name="drag_indicator" size={14} />
        Drag any server onto an empty rack slot
      </div>

      {/* Server list */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: 12, display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {items.length === 0 ? (
          <div style={{
            padding: '40px 16px', textAlign: 'center',
            color: 'rgba(255,255,255,0.4)', fontSize: 13,
          }}>
            <MuiIcon name="inventory_2" size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
            <div>Inventory empty</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Visit the Servers Store to buy more</div>
          </div>
        ) : items.map((s) => (
          <ServerChip
            key={s.instId}
            server={s}
            dragging={draggingId === s.instId}
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', s.instId);
              onDragStart(s.instId);
            }}
            onDragEnd={() => onDragEnd()}
          />
        ))}
      </div>

      {/* Footer action: buy a new rack */}
      <div style={{
        padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <MuiButton variant="outlined" color="primary" fullWidth
          startIcon={<MuiIcon name="add" size={16} />}
          onClick={onAddRack}>
          Buy New Rack
        </MuiButton>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontFamily: "'Fira Code', monospace", letterSpacing: '0.08em' }}>
          NEXT TIER UNLOCK · 2 RACKS
        </div>
      </div>
    </div>
  );
}

window.ServerChip = ServerChip;
window.Inventory = Inventory;
