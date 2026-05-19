/* global React, ReactDOM, CipherCanvas,
   MuiIcon, MuiAvatar, MuiCard, MuiCardHeader, MuiCardContent, MuiCardActions,
   MuiButton, MuiIconButton, MuiChip, MuiLinearProgress, MuiSelect, MuiCheckbox, MuiDefRow,
   TweaksPanel, useTweaks, TweakSection, TweakSlider, TweakToggle, TweakRadio, TweakColor */

// ── Game data ─────────────────────────────────────────────────────────────────
const CIPHER_TYPES = [
  { name: 'CRC-32',   complexity: 1,  parallelism: 1, block: '64 KB',  payout: 25,    xp: 5,    duration: 8 },
  { name: 'MD5',      complexity: 2,  parallelism: 1, block: '128 KB', payout: 75,    xp: 12,   duration: 14 },
  { name: 'SHA-1',    complexity: 4,  parallelism: 2, block: '256 KB', payout: 220,   xp: 28,   duration: 22 },
  { name: 'SHA-256',  complexity: 8,  parallelism: 4, block: '512 KB', payout: 640,   xp: 60,   duration: 38 },
  { name: 'AES-128',  complexity: 12, parallelism: 4, block: '1.0 MB', payout: 1450,  xp: 110,  duration: 52 },
  { name: 'RSA-2048', complexity: 24, parallelism: 8, block: '2.0 MB', payout: 4800,  xp: 280,  duration: 96 },
];

const STATION_INFO = {
  cpu: 'Codium i7-9750H',
  cpuSpeed: '2.6 GHz',
  cores: 6,
  memory: 16,
  storage: '512',
  network: 'Gigabit Fiber',
};

const fmtMoney = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── CPU sparkline (canvas) ────────────────────────────────────────────────────
function CpuSparkline({ data, height = 220 }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    canvas.width = cssW * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const W = cssW, H = height;

    ctx.clearRect(0, 0, W, H);

    const padL = 44, padR = 16, padT = 14, padB = 28;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padT + (innerH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(padL, y); ctx.lineTo(W - padR, y);
      ctx.stroke();
    }
    // y labels
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.font = '11px "Fira Code", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) {
      const v = 100 - i * 25;
      const y = padT + (innerH * i) / 4;
      ctx.fillText(v + '%', padL - 8, y);
    }

    // x axis baseline
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath();
    ctx.moveTo(padL, padT + innerH);
    ctx.lineTo(W - padR, padT + innerH);
    ctx.stroke();

    if (data.length < 2) return;

    const pts = data.map((v, i) => ({
      x: padL + (innerW * i) / (data.length - 1),
      y: padT + innerH * (1 - v / 100),
    }));

    // area fill
    const grad = ctx.createLinearGradient(0, padT, 0, padT + innerH);
    grad.addColorStop(0, 'rgba(10,245,176,0.34)');
    grad.addColorStop(1, 'rgba(10,245,176,0.0)');
    ctx.beginPath();
    ctx.moveTo(pts[0].x, padT + innerH);
    pts.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, padT + innerH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.strokeStyle = '#0af5b0';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(10,245,176,0.6)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.stroke();
    ctx.shadowBlur = 0;

    // marker dot at last point
    const last = pts[pts.length - 1];
    ctx.fillStyle = '#0af5b0';
    ctx.beginPath();
    ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // current value floating
    ctx.fillStyle = 'rgba(10,245,176,0.95)';
    ctx.font = '600 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(data[data.length - 1].toFixed(0) + '%', last.x + 8, last.y - 4);

    // x label
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TIME →', W / 2, H - 8);
  }, [data, height]);

  return <canvas ref={ref} style={{ width: '100%', height, display: 'block' }} />;
}

// ── Header ────────────────────────────────────────────────────────────────────
function PageHeader({ uptime, threats }) {
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
          <MuiIcon name="important_devices" size={16} />
          /home/operator/station
        </div>
        <h1 style={{
          margin: 0, fontSize: 38, fontWeight: 700, lineHeight: 1.1,
          letterSpacing: '-0.01em',
          color: 'rgba(255,255,255,0.96)',
        }}>
          Station Overview
        </h1>
        <div style={{
          marginTop: 8, fontSize: 14,
          color: 'rgba(255,255,255,0.55)', maxWidth: 580,
        }}>
          Monitor station health, manage running cipher processes, and queue new breaks.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <MuiChip
          label={<><span className="live-dot" style={{ marginRight: 6 }} />ONLINE</>}
          color="accent" variant="outlined"
        />
        <MuiChip label={`UPTIME ${uptime}`} color="default" variant="outlined" icon={<MuiIcon name="schedule" size={14} />} />
        <MuiChip label={`${threats} THREATS`} color={threats > 0 ? 'warn' : 'default'} variant="outlined" icon={<MuiIcon name="shield" size={14} />} />
      </div>
    </div>
  );
}

// ── Station Statistics card ───────────────────────────────────────────────────
function StationStatistics({ totalLoad }) {
  return (
    <MuiCard>
      <MuiCardHeader
        avatar={<MuiAvatar color="cyan"><MuiIcon name="analytics" size={22} /></MuiAvatar>}
        title="Station Statistics"
        subheader="HARDWARE PROFILE"
      />
      <MuiCardContent>
        <MuiDefRow icon="memory"      label="CPU"        value={STATION_INFO.cpu} mono />
        <MuiDefRow icon="speed"       label="CPU Speed"  value={STATION_INFO.cpuSpeed} mono />
        <MuiDefRow icon="developer_board" label="Cores"  value={`${STATION_INFO.cores} cores`} mono />
        <MuiDefRow icon="memory"      label="Memory"     value={`${STATION_INFO.memory} GB`} mono />
        <MuiDefRow icon="storage"     label="Storage"    value={`${STATION_INFO.storage} GB`} mono />
        <MuiDefRow icon="lan"         label="Network"    value={STATION_INFO.network} mono />

        <div style={{ marginTop: 14, padding: '14px 0 4px' }}>
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
        </div>
      </MuiCardContent>
    </MuiCard>
  );
}

// ── CPU Activity card ─────────────────────────────────────────────────────────
function CpuActivityCard({ data }) {
  const current = data[data.length - 1] || 0;
  const peak = Math.max(...data, 0);
  const avg = data.length ? data.reduce((a, b) => a + b, 0) / data.length : 0;

  return (
    <MuiCard>
      <MuiCardHeader
        avatar={<MuiAvatar color="accent"><MuiIcon name="ssid_chart" size={22} /></MuiAvatar>}
        title="CPU Activity"
        subheader="REAL-TIME % USAGE"
        action={<>
          <MuiChip label="LIVE" color="accent" size="small" icon={<span className="live-dot" />} />
          <MuiIconButton title="Settings"><MuiIcon name="more_vert" /></MuiIconButton>
        </>}
      />
      <MuiCardContent>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12, marginBottom: 14,
        }}>
          <Stat label="CURRENT" value={current.toFixed(0) + '%'} accent />
          <Stat label="PEAK"    value={peak.toFixed(0) + '%'} />
          <Stat label="AVG"     value={avg.toFixed(0) + '%'} />
        </div>
        <CpuSparkline data={data} height={220} />
      </MuiCardContent>
    </MuiCard>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 8,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
      }}>{label}</div>
      <div style={{
        fontSize: 22, fontWeight: 700, lineHeight: 1.1, marginTop: 4,
        fontFamily: "'Fira Code', monospace",
        color: accent ? '#0af5b0' : 'rgba(255,255,255,0.92)',
        textShadow: accent ? '0 0 12px rgba(10,245,176,0.4)' : 'none',
      }}>{value}</div>
    </div>
  );
}

// ── Cipher Break card ─────────────────────────────────────────────────────────
function CipherBreakCard({ slot, onChange, onCancel, onRemove, onPauseToggle, onAutoToggle, onRestart, onInfo }) {
  const cardRef = React.useRef(null);
  const { id, type, state, progress, autoCipher } = slot;

  React.useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    if (state === 'SUCCESS') {
      card.classList.add('cipher-success');
      card.classList.remove('cipher-error');
    } else if (state === 'CANCELLED') {
      card.classList.add('cipher-error');
      card.classList.remove('cipher-success');
    }
    const t = setTimeout(() => {
      card.classList.remove('cipher-success', 'cipher-error');
    }, 1100);
    return () => clearTimeout(t);
  }, [state]);

  const isRunning = state === 'BREAKING' || state === 'DOWNLOADING';
  const stateColor = {
    BREAKING:    'cyan',
    DOWNLOADING: 'accent',
    PAUSED:      'warn',
    SUCCESS:     'success',
    CANCELLED:   'error',
    IDLE:        'default',
  }[state] || 'default';

  return (
    <MuiCard ref={cardRef}>
      <MuiCardHeader
        avatar={<MuiAvatar color={state === 'IDLE' ? 'default' : 'accent'}><MuiIcon name="code" size={22} /></MuiAvatar>}
        title="Cipher Break"
        subheader={state !== 'IDLE' && type ? `${type.name.toUpperCase()} · ${type.block}` : 'IDLE'}
        action={
          <>
            {isRunning && (
              <MuiIconButton onClick={onPauseToggle} title="Pause">
                <MuiIcon name="pause" />
              </MuiIconButton>
            )}
            {state === 'PAUSED' && (
              <MuiIconButton onClick={onPauseToggle} title="Resume" color="primary">
                <MuiIcon name="play_arrow" />
              </MuiIconButton>
            )}
            <MuiIconButton onClick={onRestart} title="Restart" disabled={isRunning || state === 'PAUSED'}>
              <MuiIcon name="replay" />
            </MuiIconButton>
          </>
        }
      />

      <MuiCardContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <MuiChip label={state} color={stateColor} size="small" />
          {type && (
            <span style={{
              fontFamily: "'Fira Code', monospace", fontSize: 11,
              color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em',
            }}>
              C{type.complexity} · ×{type.parallelism}
            </span>
          )}
          <div style={{ flex: 1 }} />
          <div style={{
            fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 600,
            color: state === 'IDLE' ? 'rgba(255,255,255,0.5)' : '#0af5b0',
          }}>
            {Math.round(progress)}%
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <MuiLinearProgress
            value={progress}
            color={state === 'PAUSED' ? 'warn' : state === 'CANCELLED' ? 'error' : 'accent'}
          />
        </div>

        <CipherCanvas progress={progress} state={state} />

        {type && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 8, marginTop: 12,
          }}>
            <MiniStat label="PAYOUT" value={fmtMoney(type.payout)} positive />
            <MiniStat label="XP" value={`${type.xp} XP`} />
          </div>
        )}
      </MuiCardContent>

      <MuiCardActions style={{ justifyContent: 'space-between' }}>
        <MuiCheckbox
          checked={autoCipher}
          onChange={onAutoToggle}
          label="Auto-restart"
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MuiIconButton onClick={onInfo} title="Cipher info" color="cyan">
            <MuiIcon name="info" />
          </MuiIconButton>
          {state === 'IDLE' ? (
            <MuiButton variant="text" color="neutral" onClick={onRemove}>
              Delete
            </MuiButton>
          ) : (
            <MuiButton variant="contained" color="error" size="small" onClick={onCancel}
              startIcon={<MuiIcon name="close" size={16} />}>
              Cancel
            </MuiButton>
          )}
        </div>
      </MuiCardActions>
    </MuiCard>
  );
}

function MiniStat({ label, value, positive }) {
  return (
    <div style={{
      padding: '8px 10px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 6,
    }}>
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)' }}>{label}</div>
      <div style={{
        fontFamily: "'Fira Code', monospace", fontWeight: 600, fontSize: 14, marginTop: 2,
        color: positive ? '#28ff28' : 'rgba(255,255,255,0.92)',
        textShadow: positive ? '0 0 8px rgba(40,255,40,0.4)' : 'none',
      }}>{value}</div>
    </div>
  );
}

// ── Add-Process card (empty state) ────────────────────────────────────────────
function AddProcessCard({ onAdd }) {
  const [picked, setPicked] = React.useState('');
  const opts = CIPHER_TYPES.map((t) => ({
    value: t.name, label: t.name, meta: `${fmtMoney(t.payout)}`
  }));
  return (
    <MuiCard style={{ borderStyle: 'dashed', borderColor: 'rgba(10,245,176,0.30)' }}>
      <MuiCardHeader
        avatar={<MuiAvatar color="accent"><MuiIcon name="add_circle" size={22} /></MuiAvatar>}
        title="Queue Cipher Break"
        subheader="ADD NEW PROCESS"
      />
      <MuiCardContent>
        <div style={{
          minHeight: 200,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 14, padding: 16, textAlign: 'center',
          background: 'rgba(0,0,0,0.30)',
          border: '1px dashed rgba(255,255,255,0.10)',
          borderRadius: 8,
        }}>
          <MuiIcon name="terminal" size={40} style={{ color: 'rgba(10,245,176,0.6)' }} />
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', maxWidth: 280, lineHeight: 1.5 }}>
            Pick a cipher type to spin up a new break.
            Larger ciphers pay more but require more cores.
          </div>
          <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <MuiSelect
              value={picked}
              onChange={setPicked}
              placeholder="Select cipher type…"
              options={opts}
              minWidth={'100%'}
            />
            <MuiButton
              variant="contained" color="primary" fullWidth
              disabled={!picked}
              onClick={() => {
                const t = CIPHER_TYPES.find((x) => x.name === picked);
                if (t) { onAdd(t); setPicked(''); }
              }}
              startIcon={<MuiIcon name="play_arrow" size={18} />}
            >
              Begin Break
            </MuiButton>
          </div>
        </div>
      </MuiCardContent>
    </MuiCard>
  );
}

// ── Game state hook ───────────────────────────────────────────────────────────
function useStation(speed) {
  const [slots, setSlots] = React.useState(() => [
    { id: 's1', type: CIPHER_TYPES[2], state: 'BREAKING',    progress: 32, autoCipher: false },
    { id: 's2', type: CIPHER_TYPES[3], state: 'DOWNLOADING', progress: 68, autoCipher: true  },
    { id: 's3', type: CIPHER_TYPES[1], state: 'PAUSED',      progress: 14, autoCipher: false },
  ]);

  // Tick animation
  React.useEffect(() => {
    const id = setInterval(() => {
      setSlots((prev) => prev.map((s) => {
        if (s.state !== 'BREAKING' && s.state !== 'DOWNLOADING') return s;
        const inc = (1.2 / Math.max(1, s.type.complexity)) * speed;
        let p = s.progress + inc;
        let st = s.state;
        if (p >= 100) {
          p = 0;
          st = 'BREAKING';
        } else if (p >= 50 && s.state === 'BREAKING') {
          st = 'DOWNLOADING';
        }
        return { ...s, progress: p, state: st };
      }));
    }, 200);
    return () => clearInterval(id);
  }, [speed]);

  const cpuActivity = React.useRef(Array.from({ length: 50 }, () => 30 + Math.random() * 10));
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => {
    const id = setInterval(() => {
      const active = slots.filter((s) => s.state === 'BREAKING' || s.state === 'DOWNLOADING').length;
      const target = 18 + active * 22 + Math.random() * 10;
      cpuActivity.current = [...cpuActivity.current.slice(1), Math.min(99, target + (Math.random() - 0.5) * 6)];
      force();
    }, 600);
    return () => clearInterval(id);
  }, [slots]);

  return { slots, setSlots, cpuActivity: cpuActivity.current };
}

// ── Page root ─────────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "scanlines": true,
  "speed": 1,
  "showLevelStrip": true
}/*EDITMODE-END*/;

function StationPage() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const { slots, setSlots, cpuActivity } = useStation(tweaks.speed);

  React.useEffect(() => {
    document.body.classList.toggle('scanlines', !!tweaks.scanlines);
  }, [tweaks.scanlines]);

  const dense = tweaks.density === 'compact';
  const totalLoad = Math.min(99, slots.filter((s) => s.state === 'BREAKING' || s.state === 'DOWNLOADING').length * 28 + 12);

  const updateSlot = (id, patch) =>
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const removeSlot = (id) => setSlots((prev) => prev.filter((s) => s.id !== id));

  const addProcess = (type) => {
    const id = 's' + Math.random().toString(36).slice(2, 7);
    setSlots((prev) => [...prev, { id, type, state: 'BREAKING', progress: 0, autoCipher: false }]);
  };

  return (
    <div style={{
      minHeight: '100%',
      padding: dense ? '20px 24px 80px' : '32px 40px 80px',
      maxWidth: 1600, margin: '0 auto',
    }}>
      {/* Brand strip */}
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
        <div style={{
          fontSize: 14, fontWeight: 700, letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.92)',
        }}>CODEBREAKER</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'Fira Code', monospace" }}>
          v3.4.1
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 4 }}>
          {['terminal', 'important_devices', 'storage', 'apartment', 'router', 'public', 'share'].map((ic, i) => (
            <MuiIconButton key={ic} title={ic} color={i === 1 ? 'primary' : 'default'}>
              <MuiIcon name={ic} />
            </MuiIconButton>
          ))}
        </div>
      </div>

      <PageHeader uptime="04:21:17" threats={0} />

      {/* Top row: stats + chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(0, 2fr)',
        gap: 20, marginBottom: 20,
      }}>
        <StationStatistics totalLoad={totalLoad} />
        <CpuActivityCard data={cpuActivity} />
      </div>

      {/* Cipher grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: 20,
      }}>
        {slots.map((s) => (
          <CipherBreakCard
            key={s.id}
            slot={s}
            onPauseToggle={() => updateSlot(s.id, {
              state: s.state === 'PAUSED' ? 'BREAKING' : 'PAUSED',
            })}
            onCancel={() => updateSlot(s.id, { state: 'CANCELLED', progress: 0 })}
            onRemove={() => removeSlot(s.id)}
            onAutoToggle={(v) => updateSlot(s.id, { autoCipher: v })}
            onRestart={() => updateSlot(s.id, { progress: 0, state: 'BREAKING' })}
            onInfo={() => alert(`${s.type.name}\nComplexity: ${s.type.complexity}\nPayout: ${fmtMoney(s.type.payout)}`)}
          />
        ))}
        <AddProcessCard onAdd={addProcess} />
      </div>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Layout">
          <TweakRadio
            label="Density"
            value={tweaks.density}
            options={[{ label: 'Comfortable', value: 'comfortable' }, { label: 'Compact', value: 'compact' }]}
            onChange={(v) => setTweak('density', v)}
          />
        </TweakSection>
        <TweakSection title="Visual">
          <TweakToggle label="Scanlines" checked={tweaks.scanlines} onChange={(v) => setTweak('scanlines', v)} />
        </TweakSection>
        <TweakSection title="Simulation">
          <TweakSlider label="Speed" min={0} max={3} step={0.1} value={tweaks.speed} onChange={(v) => setTweak('speed', v)} format={(v) => `${v.toFixed(1)}×`} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<StationPage />);
