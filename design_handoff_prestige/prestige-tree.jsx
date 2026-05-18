/* global React, MuiIcon, MuiChip, MuiButton, MuiIconButton */

// ── Skill catalog ─────────────────────────────────────────────────────────────
// 4 branches radiating from a center "Genesis" root.
// Branches: N=Throughput (cyan), E=Wealth (green), S=Automation (purple), W=Recon (orange).

const BRANCHES = {
  root: { color: '#0af5b0', fg: '#0af5b0', label: 'CORE'        },
  N:    { color: '#26c6da', fg: '#26c6da', label: 'THROUGHPUT'  },
  E:    { color: '#0af5b0', fg: '#0af5b0', label: 'WEALTH'      },
  S:    { color: '#b39ddb', fg: '#b39ddb', label: 'AUTOMATION' },
  W:    { color: '#ff9800', fg: '#ff9800', label: 'RECON'       },
};

const SKILLS = [
  // ROOT
  { id: 'genesis', branch: 'root', x: 800, y: 600, cost: 0, name: 'Genesis',
    icon: 'autorenew', short: 'CORE',
    desc: 'Every prestige cycle awards this node automatically. Anchor for all skill paths.' },

  // NORTH — Throughput
  { id: 'n1', branch: 'N', x: 800, y: 460, cost: 1, name: 'Quick Break',     icon: 'bolt',
    short: '+10% CIPHER SPEED', requires: ['genesis'],
    desc: 'Permanently accelerate every cipher break by 10%.' },
  { id: 'n2', branch: 'N', x: 680, y: 320, cost: 2, name: 'Parallel Streams', icon: 'splitscreen',
    short: '+1 CONCURRENT', requires: ['n1'],
    desc: 'Unlocks one additional cipher slot on the Station.' },
  { id: 'n3', branch: 'N', x: 920, y: 320, cost: 2, name: 'Burst Mode', icon: 'flash_on',
    short: '5× ON FIRST BREAK', requires: ['n1'],
    desc: 'The first cipher each session runs at 5× speed.' },
  { id: 'n4', branch: 'N', x: 800, y: 200, cost: 4, name: 'Quantum Pipelines', icon: 'rocket_launch',
    short: '+20% SPEED', requires: ['n2', 'n3'],
    desc: 'Compounds with Quick Break for total +30% throughput.' },
  { id: 'n5', branch: 'N', x: 800, y: 70,  cost: 6, name: 'Singularity', icon: 'all_inclusive',
    capstone: true, short: 'CAPSTONE — NEVER FAIL', requires: ['n4'],
    desc: 'Ciphers can no longer fail. Cancellation refunds full payout.' },

  // EAST — Wealth
  { id: 'e1', branch: 'E', x: 940, y: 600, cost: 1, name: 'Compound Returns', icon: 'trending_up',
    short: '+15% PAYOUT', requires: ['genesis'],
    desc: 'All cipher payouts increased by 15%.' },
  { id: 'e2', branch: 'E', x: 1080, y: 480, cost: 2, name: 'Risk Tolerance', icon: 'verified',
    short: '+50% ON RSA-2048', requires: ['e1'],
    desc: 'The hardest ciphers pay out an extra 50%.' },
  { id: 'e3', branch: 'E', x: 1080, y: 720, cost: 2, name: 'Insider Trading', icon: 'attach_money',
    short: '2× XP / FIRST HOUR', requires: ['e1'],
    desc: 'Double XP for the first hour of every session.' },
  { id: 'e4', branch: 'E', x: 1200, y: 600, cost: 4, name: 'Black Swan', icon: 'casino',
    short: 'RANDOM JACKPOTS', requires: ['e2', 'e3'],
    desc: '1% chance of a 100× payout on any cipher break.' },
  { id: 'e5', branch: 'E', x: 1330, y: 600, cost: 6, name: 'Midas Protocol', icon: 'workspace_premium',
    capstone: true, short: 'CAPSTONE — 2× ALL', requires: ['e4'],
    desc: 'All cipher payouts permanently doubled.' },

  // SOUTH — Automation
  { id: 's1', branch: 'S', x: 800, y: 740, cost: 1, name: 'Auto-Restart', icon: 'restart_alt',
    short: 'AUTO-QUEUE', requires: ['genesis'],
    desc: 'Completed ciphers automatically restart with the same target.' },
  { id: 's2', branch: 'S', x: 680, y: 880, cost: 2, name: 'Daemon', icon: 'computer',
    short: 'OFFLINE EARNINGS', requires: ['s1'],
    desc: 'Continues earning at 50% rate while the tab is closed.' },
  { id: 's3', branch: 'S', x: 920, y: 880, cost: 2, name: 'Smart Queue', icon: 'auto_fix_high',
    short: 'OPTIMAL CIPHER', requires: ['s1'],
    desc: 'Auto-Restart picks the highest-EV cipher available.' },
  { id: 's4', branch: 'S', x: 800, y: 1000, cost: 4, name: 'Hivemind', icon: 'hub',
    short: '+100% OFFLINE', requires: ['s2', 's3'],
    desc: 'Offline earnings rate raised to 100% of online rate.' },
  { id: 's5', branch: 'S', x: 800, y: 1130, cost: 6, name: 'Ghost in the Machine', icon: 'smart_toy',
    capstone: true, short: 'CAPSTONE — FULL AUTO', requires: ['s4'],
    desc: 'Full autoplay: purchases, upgrades, and prestige decisions can be automated.' },

  // WEST — Recon
  { id: 'w1', branch: 'W', x: 660, y: 600, cost: 1, name: 'Recon', icon: 'visibility',
    short: 'EARLY DARK WEB', requires: ['genesis'],
    desc: 'Reveals one additional dark-web cipher per cycle.' },
  { id: 'w2', branch: 'W', x: 520, y: 480, cost: 2, name: 'Mapper', icon: 'explore',
    short: 'SEE HIDDEN NODES', requires: ['w1'],
    desc: 'Reveals hidden upgrades and unlocks in advance.' },
  { id: 'w3', branch: 'W', x: 520, y: 720, cost: 2, name: 'Backdoor', icon: 'vpn_key',
    short: '-1 LVL REQ', requires: ['w1'],
    desc: 'Reduces prestige level requirement by 1 every cycle.' },
  { id: 'w4', branch: 'W', x: 400, y: 600, cost: 4, name: 'Stealth', icon: 'shield',
    short: 'NO DETECTION', requires: ['w2', 'w3'],
    desc: 'Threat events ignored. No detection penalties on dark web ops.' },
  { id: 'w5', branch: 'W', x: 270, y: 600, cost: 6, name: 'Phantom Override', icon: 'remove_red_eye',
    capstone: true, short: 'CAPSTONE — GHOST OP', requires: ['w4'],
    desc: 'Bypass any access gate. Instantly complete one cipher per cycle.' },
];

const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

// World bounds (used to compute initial centering)
const WORLD_W = 1600;
const WORLD_H = 1200;

// ── Helpers ───────────────────────────────────────────────────────────────────
function nodeStatus(skill, allocated, available) {
  if (allocated[skill.id]) return 'allocated';
  const reqs = skill.requires || [];
  const reqOk = reqs.every((r) => allocated[r]);
  if (!reqOk) return 'locked';
  if (skill.cost > available) return 'unaffordable';
  return 'available';
}

// ── Skill Tree component ──────────────────────────────────────────────────────
function PrestigeSkillTree({ allocated, available, onAllocate, onRefund }) {
  const containerRef = React.useRef(null);
  const [view, setView] = React.useState({ x: 0, y: 0, z: 1, ready: false });
  const [dragging, setDragging] = React.useState(false);
  const [hovered, setHovered] = React.useState(null);
  const dragRef = React.useRef(null);

  // Fit-to-screen on mount
  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth, h = el.clientHeight;
      const z = Math.min(w / WORLD_W, h / WORLD_H) * 0.92;
      setView({ x: (w - WORLD_W * z) / 2, y: (h - WORLD_H * z) / 2, z, ready: true });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('[data-node]')) return;
    setDragging(true);
    dragRef.current = { sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y };
  };
  const onMouseMove = (e) => {
    if (!dragging || !dragRef.current) return;
    const dx = e.clientX - dragRef.current.sx;
    const dy = e.clientY - dragRef.current.sy;
    setView((v) => ({ ...v, x: dragRef.current.vx + dx, y: dragRef.current.vy + dy }));
  };
  const onMouseUp = () => { setDragging(false); dragRef.current = null; };

  const onWheel = (e) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    setView((v) => {
      const z = Math.min(2.4, Math.max(0.3, v.z * factor));
      const k = z / v.z;
      // zoom around mouse
      const x = mx - (mx - v.x) * k;
      const y = my - (my - v.y) * k;
      return { ...v, x, y, z };
    });
  };

  // touch — minimal: 1-finger pan
  const touchRef = React.useRef(null);
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchRef.current = { sx: t.clientX, sy: t.clientY, vx: view.x, vy: view.y, mode: 'pan' };
    } else if (e.touches.length === 2) {
      const [a, b] = e.touches;
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      touchRef.current = { d0: d, z0: view.z, mode: 'pinch' };
    }
  };
  const onTouchMove = (e) => {
    if (!touchRef.current) return;
    e.preventDefault();
    if (touchRef.current.mode === 'pan' && e.touches.length === 1) {
      const t = e.touches[0];
      const dx = t.clientX - touchRef.current.sx;
      const dy = t.clientY - touchRef.current.sy;
      setView((v) => ({ ...v, x: touchRef.current.vx + dx, y: touchRef.current.vy + dy }));
    } else if (touchRef.current.mode === 'pinch' && e.touches.length === 2) {
      const [a, b] = e.touches;
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const ratio = d / touchRef.current.d0;
      setView((v) => ({ ...v, z: Math.min(2.4, Math.max(0.3, touchRef.current.z0 * ratio)) }));
    }
  };
  const onTouchEnd = () => { touchRef.current = null; };

  const resetView = () => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const z = Math.min(w / WORLD_W, h / WORLD_H) * 0.92;
    setView({ x: (w - WORLD_W * z) / 2, y: (h - WORLD_H * z) / 2, z, ready: true });
  };
  const zoomBy = (factor) => {
    const el = containerRef.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    setView((v) => {
      const z = Math.min(2.4, Math.max(0.3, v.z * factor));
      const k = z / v.z;
      const cx = w / 2, cy = h / 2;
      const x = cx - (cx - v.x) * k;
      const y = cy - (cy - v.y) * k;
      return { ...v, x, y, z };
    });
  };

  // Render edges as SVG lines between requires->dependents
  const edges = [];
  SKILLS.forEach((s) => {
    (s.requires || []).forEach((rid) => {
      const a = SKILL_BY_ID[rid];
      if (!a) return;
      edges.push({ a, b: s, key: rid + '->' + s.id });
    });
  });

  const hoveredSkill = hovered ? SKILL_BY_ID[hovered] : null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        className={'tree-canvas' + (dragging ? ' dragging' : '')}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'absolute', inset: 0,
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 50% 50%, rgba(10,245,176,0.06), transparent 55%), ' +
            'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.65), rgba(0,0,0,0.85))',
          borderRadius: 8,
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* Background grid — fixed pattern that moves with view */}
        <BackgroundGrid view={view} />

        <div style={{
          position: 'absolute',
          left: 0, top: 0,
          width: WORLD_W, height: WORLD_H,
          transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`,
          transformOrigin: '0 0',
          opacity: view.ready ? 1 : 0,
          transition: 'opacity 200ms ease',
        }}>
          {/* Branch sector labels */}
          <BranchLabels />

          <svg
            width={WORLD_W} height={WORLD_H}
            viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
            style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
          >
            <defs>
              <radialGradient id="rootGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"  stopColor="#0af5b0" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#0af5b0" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#0af5b0" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx={800} cy={600} r={240} fill="url(#rootGlow)" />

            {edges.map((e) => {
              const active = allocated[e.a.id] && allocated[e.b.id];
              const reachable = allocated[e.a.id];
              const col = BRANCHES[e.b.branch].color;
              return (
                <line
                  key={e.key}
                  x1={e.a.x} y1={e.a.y} x2={e.b.x} y2={e.b.y}
                  stroke={active ? col : (reachable ? `${col}88` : 'rgba(255,255,255,0.12)')}
                  strokeWidth={active ? 3 : 2}
                  strokeDasharray={active ? '6 6' : reachable ? '4 6' : '2 6'}
                  className={active ? 'edge-active' : ''}
                  style={{
                    filter: active ? `drop-shadow(0 0 6px ${col}aa)` : 'none',
                  }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {SKILLS.map((s) => (
            <SkillNode
              key={s.id}
              skill={s}
              status={nodeStatus(s, allocated, available)}
              onHover={setHovered}
              onAllocate={onAllocate}
              onRefund={onRefund}
            />
          ))}
        </div>
      </div>

      {/* Detail panel — top-left overlay */}
      <NodeInspector skill={hoveredSkill} allocated={allocated} available={available}
                     onAllocate={onAllocate} onRefund={onRefund} />

      {/* Controls — bottom-right overlay */}
      <div style={{
        position: 'absolute', right: 14, bottom: 14,
        display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end',
        pointerEvents: 'none',
      }}>
        <div style={{
          pointerEvents: 'auto',
          display: 'flex', flexDirection: 'column', gap: 4,
          background: 'rgba(10,16,20,0.85)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 8, padding: 4,
          backdropFilter: 'blur(6px)',
        }}>
          <MuiIconButton title="Zoom in"  onClick={() => zoomBy(1.2)}><MuiIcon name="add" /></MuiIconButton>
          <MuiIconButton title="Zoom out" onClick={() => zoomBy(1/1.2)}><MuiIcon name="remove" /></MuiIconButton>
          <MuiIconButton title="Re-center" onClick={resetView}><MuiIcon name="filter_center_focus" /></MuiIconButton>
        </div>
        <div style={{
          pointerEvents: 'none',
          fontFamily: "'Fira Code', monospace", fontSize: 10,
          color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em',
          background: 'rgba(10,16,20,0.7)',
          padding: '4px 8px', borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          ZOOM {(view.z * 100).toFixed(0)}%
        </div>
      </div>

      {/* Hint — bottom-left */}
      <div style={{
        position: 'absolute', left: 14, bottom: 14,
        fontFamily: "'Fira Code', monospace", fontSize: 10,
        color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em',
        background: 'rgba(10,16,20,0.7)',
        padding: '6px 10px', borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.06)',
        pointerEvents: 'none',
        textTransform: 'uppercase',
      }}>
        DRAG TO PAN · SCROLL TO ZOOM · CLICK TO ALLOCATE
      </div>
    </div>
  );
}

// ── Background grid (zoom-aware dots) ─────────────────────────────────────────
function BackgroundGrid({ view }) {
  const step = 40 * view.z;
  const ox = ((view.x % step) + step) % step;
  const oy = ((view.y % step) + step) % step;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.10) 1px, transparent 1px)',
      backgroundSize: `${step}px ${step}px`,
      backgroundPosition: `${ox}px ${oy}px`,
      opacity: 0.6,
      pointerEvents: 'none',
    }} />
  );
}

// ── Branch sector labels (in world coordinates) ───────────────────────────────
function BranchLabels() {
  const items = [
    { x: 800, y: 30,   text: 'THROUGHPUT',  col: BRANCHES.N.fg },
    { x: 1410, y: 600, text: 'WEALTH',      col: BRANCHES.E.fg },
    { x: 800, y: 1170, text: 'AUTOMATION', col: BRANCHES.S.fg },
    { x: 190, y: 600,  text: 'RECON',       col: BRANCHES.W.fg },
  ];
  return (
    <>
      {items.map((it) => (
        <div key={it.text} style={{
          position: 'absolute',
          left: it.x, top: it.y,
          transform: 'translate(-50%, -50%)',
          fontFamily: "'Fira Code', monospace", fontWeight: 600,
          fontSize: 14, letterSpacing: '0.3em',
          color: it.col,
          textShadow: `0 0 12px ${it.col}80`,
          opacity: 0.85,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}>{it.text}</div>
      ))}
    </>
  );
}

// ── Single Skill Node ─────────────────────────────────────────────────────────
function SkillNode({ skill, status, onHover, onAllocate, onRefund }) {
  const col = BRANCHES[skill.branch].color;
  const isCap = !!skill.capstone;
  const isRoot = skill.branch === 'root';
  const size = isRoot ? 96 : isCap ? 82 : 68;

  const bg = {
    allocated:    `radial-gradient(circle at 50% 35%, ${col}33, ${col}10 70%), rgba(20,28,32,0.95)`,
    available:    'rgba(20,28,32,0.92)',
    unaffordable: 'rgba(20,28,32,0.92)',
    locked:       'rgba(14,18,22,0.85)',
  }[status];

  const border = {
    allocated:    `2px solid ${col}`,
    available:    `2px solid ${col}cc`,
    unaffordable: `2px dashed ${col}80`,
    locked:       '2px dashed rgba(255,255,255,0.18)',
  }[status];

  const fg = {
    allocated:    col,
    available:    col,
    unaffordable: `${col}aa`,
    locked:       'rgba(255,255,255,0.32)',
  }[status];

  const shadow = {
    allocated:    `0 0 20px ${col}55, 0 0 38px ${col}28`,
    available:    `0 0 12px ${col}30`,
    unaffordable: '0 0 0 rgba(0,0,0,0)',
    locked:       'inset 0 0 0 1px rgba(255,255,255,0.04)',
  }[status];

  const handleClick = (e) => {
    if (e.shiftKey || e.altKey) { onRefund(skill); return; }
    onAllocate(skill);
  };

  return (
    <div
      data-node={skill.id}
      onMouseEnter={() => onHover(skill.id)}
      onMouseLeave={() => onHover(null)}
      onClick={handleClick}
      onContextMenu={(e) => { e.preventDefault(); onRefund(skill); }}
      title={skill.name}
      className={status === 'available' ? 'node-ready' : ''}
      style={{
        position: 'absolute',
        left: skill.x - size / 2, top: skill.y - size / 2,
        width: size, height: size,
        borderRadius: isCap || isRoot ? size / 4 : '50%',
        background: bg, border, boxShadow: shadow,
        color: fg, cursor: status === 'locked' ? 'not-allowed' : 'pointer',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        transition: 'transform 180ms ease, box-shadow 220ms ease, border-color 220ms ease, background 220ms ease',
        textAlign: 'center',
        padding: 4,
      }}
    >
      <span className="msym" style={{ fontSize: isRoot ? 36 : isCap ? 30 : 26 }}>{skill.icon}</span>
      <div style={{
        marginTop: 4,
        fontSize: isRoot ? 10 : 9,
        fontWeight: 700,
        fontFamily: "'Fira Code', monospace",
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        lineHeight: 1.1,
        maxWidth: size - 8,
        color: status === 'locked' ? 'rgba(255,255,255,0.4)' : fg,
        overflow: 'hidden',
      }}>
        {skill.name}
      </div>

      {/* Cost badge */}
      {!isRoot && (
        <div style={{
          position: 'absolute', bottom: -8, right: -8,
          minWidth: 22, height: 22, padding: '0 6px',
          borderRadius: 11,
          background: status === 'allocated' ? col : 'rgba(10,16,20,0.95)',
          color: status === 'allocated' ? '#0a0f0d' : fg,
          border: `1px solid ${status === 'allocated' ? col : `${col}66`}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700,
          boxShadow: status === 'allocated' ? `0 0 8px ${col}` : 'none',
        }}>
          {status === 'allocated' ? '✓' : skill.cost}
        </div>
      )}

      {/* Capstone notch */}
      {isCap && (
        <div style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'Fira Code', monospace", fontSize: 9,
          letterSpacing: '0.2em', color: col,
          background: 'rgba(10,16,20,0.95)',
          padding: '2px 6px', borderRadius: 3,
          border: `1px solid ${col}`,
          whiteSpace: 'nowrap',
        }}>★ CAPSTONE</div>
      )}
    </div>
  );
}

// ── Node Inspector overlay ────────────────────────────────────────────────────
function NodeInspector({ skill, allocated, available, onAllocate, onRefund }) {
  if (!skill) {
    return (
      <div style={{
        position: 'absolute', top: 14, left: 14, width: 280,
        background: 'rgba(10,16,20,0.88)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 8, padding: '12px 14px',
        backdropFilter: 'blur(6px)',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: "'Fira Code', monospace", fontSize: 10,
          color: 'rgba(10,245,176,0.85)', letterSpacing: '0.18em',
          textTransform: 'uppercase', marginBottom: 6,
        }}>NODE INSPECTOR</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.45 }}>
          Hover a skill to inspect it. Click to allocate. Shift-click (or right-click) to refund.
        </div>
      </div>
    );
  }
  const col = BRANCHES[skill.branch].color;
  const status = nodeStatus(skill, allocated, available);
  const isRoot = skill.branch === 'root';

  return (
    <div style={{
      position: 'absolute', top: 14, left: 14, width: 300,
      background: 'rgba(10,16,20,0.92)',
      border: `1px solid ${col}66`,
      borderRadius: 8, overflow: 'hidden',
      backdropFilter: 'blur(6px)',
      boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px ${col}22 inset`,
    }}>
      <div style={{
        padding: '10px 14px',
        background: `linear-gradient(90deg, ${col}22, transparent)`,
        borderBottom: `1px solid ${col}44`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: `${col}1f`, color: col,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${col}66`,
        }}>
          <span className="msym" style={{ fontSize: 22 }}>{skill.icon}</span>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontFamily: "'Fira Code', monospace", fontSize: 9,
            color: col, letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>{BRANCHES[skill.branch].label}{skill.capstone ? ' · CAPSTONE' : ''}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.95)' }}>{skill.name}</div>
        </div>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <div style={{
          fontFamily: "'Fira Code', monospace", fontSize: 10,
          letterSpacing: '0.12em', color: col, marginBottom: 6,
        }}>{skill.short}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
          {skill.desc}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12,
        }}>
          <Mini label="COST"   value={isRoot ? '—' : `${skill.cost} pt${skill.cost === 1 ? '' : 's'}`} col={col} />
          <Mini label="STATUS" value={
            status === 'allocated'    ? 'ALLOCATED' :
            status === 'available'    ? 'AVAILABLE' :
            status === 'unaffordable' ? 'NEED PTS'  :
                                        'LOCKED'
          } col={col} />
        </div>

        {!isRoot && (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {status === 'allocated' ? (
              <MuiButton variant="outlined" color="neutral" size="small" fullWidth
                onClick={() => onRefund(skill)}
                startIcon={<MuiIcon name="undo" size={14} />}>
                Refund
              </MuiButton>
            ) : (
              <MuiButton variant="contained" color="primary" size="small" fullWidth
                disabled={status !== 'available'}
                onClick={() => onAllocate(skill)}
                startIcon={<MuiIcon name="add" size={14} />}>
                Allocate
              </MuiButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Mini({ label, value, col }) {
  return (
    <div style={{
      padding: '8px 10px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 6,
    }}>
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)' }}>{label}</div>
      <div style={{
        fontFamily: "'Fira Code', monospace", fontWeight: 700, fontSize: 13,
        color: col, marginTop: 2,
      }}>{value}</div>
    </div>
  );
}

window.PrestigeSkillTree = PrestigeSkillTree;
window.SKILLS = SKILLS;
window.SKILL_BY_ID = SKILL_BY_ID;
window.nodeStatus = nodeStatus;
window.BRANCHES = BRANCHES;
