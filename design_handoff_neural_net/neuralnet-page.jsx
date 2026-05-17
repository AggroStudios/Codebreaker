/* global React, ReactDOM, NeuralNetCanvas,
   MuiIcon, MuiAvatar, MuiCard, MuiCardHeader, MuiCardContent, MuiCardActions,
   MuiButton, MuiIconButton, MuiChip, MuiLinearProgress, MuiSelect, MuiCheckbox, MuiDefRow,
   TweaksPanel, useTweaks, TweakSection, TweakSlider, TweakToggle, TweakRadio */

// ── Cipher catalogue (mirrors station-page) ────────────────────────────────────
const CIPHERS = [
  { name: 'CRC-32',    complexity: 1,  block: '64 KB'  },
  { name: 'MD5',       complexity: 2,  block: '128 KB' },
  { name: 'SHA-1',     complexity: 4,  block: '256 KB' },
  { name: 'SHA-256',   complexity: 8,  block: '512 KB' },
  { name: 'AES-128',   complexity: 12, block: '1.0 MB' },
  { name: 'RSA-2048',  complexity: 24, block: '2.0 MB' },
];

// ── Math: exponential point accumulation + log-based bonus ─────────────────────
// Points grow as POINT_BASE^(seconds / POINT_PERIOD).
// Tuned so a few minutes of session work nets ~tens of pts and long-trained
// ciphers land in the K range — not e+30.
const POINT_BASE = 1.05;
const POINT_PERIOD = 5; // seconds per exponent step
const pointsAt = (seconds) =>
  Math.floor(Math.pow(POINT_BASE, seconds / POINT_PERIOD) - 1);
const bonusFromPoints = (pts) => +(Math.log10(pts + 1) * 8).toFixed(1); // % speed bonus

const fmtNum = (n) => {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  return Math.floor(n).toLocaleString();
};
const fmtTime = (s) => {
  s = Math.floor(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
};

// ── Page Header ────────────────────────────────────────────────────────────────
function PageHeader({ totalPts, status }) {
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
          <MuiIcon name="psychology" size={16} />
          /home/operator/neural-net
        </div>
        <h1 style={{
          margin: 0, fontSize: 38, fontWeight: 700, lineHeight: 1.1,
          letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.96)',
        }}>
          Neural Net
        </h1>
        <div style={{
          marginTop: 8, fontSize: 14, color: 'rgba(255,255,255,0.55)', maxWidth: 620,
        }}>
          Train your model on a target cipher to accumulate exponential training points.
          Banked points convert into a permanent speed bonus on that cipher.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <MuiChip
          label={<><span className="live-dot" style={{ marginRight: 6, background: status === 'TRAINING' ? '#0af5b0' : '#888', boxShadow: status === 'TRAINING' ? '0 0 6px #0af5b0' : 'none' }} />{status}</>}
          color={status === 'TRAINING' ? 'accent' : 'default'} variant="outlined"
        />
        <MuiChip
          label={`${fmtNum(totalPts)} TOTAL PTS`}
          color="cyan" variant="outlined"
          icon={<MuiIcon name="memory" size={14} />}
        />
      </div>
    </div>
  );
}

// ── Network Status ────────────────────────────────────────────────────────────
function NetworkStatusCard({ active, totals, modelLevel }) {
  return (
    <MuiCard>
      <MuiCardHeader
        avatar={<MuiAvatar color="cyan"><MuiIcon name="hub" size={22} /></MuiAvatar>}
        title="Network Status"
        subheader="MODEL TELEMETRY"
        action={<MuiChip label={active ? 'LIVE' : 'IDLE'} color={active ? 'accent' : 'default'} size="small" icon={active ? <span className="live-dot" /> : null} />}
      />
      <MuiCardContent>
        <MuiDefRow icon="memory"           label="Architecture"  value="5 × 8 × 8 × 6 × 4 MLP" mono />
        <MuiDefRow icon="developer_board"  label="Parameters"    value="442,368" mono />
        <MuiDefRow icon="bolt"             label="Optimizer"     value="AdamW (β=0.9)" mono />
        <MuiDefRow icon="model_training"   label="Ciphers trained" value={`${totals.trained} / ${CIPHERS.length}`} mono accent />
        <MuiDefRow icon="trending_up"      label="Avg. bonus"    value={`+${totals.avgBonus.toFixed(1)}%`} mono accent />
        <MuiDefRow icon="military_tech"    label="Model level"   value={`L${modelLevel}`} mono accent />

        <div style={{ marginTop: 14, padding: '14px 0 4px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
            marginBottom: 8,
          }}>
            <span>Cumulative training</span>
            <span style={{ color: '#0af5b0', fontFamily: "'Fira Code', monospace" }}>
              {fmtNum(totals.points)} pts
            </span>
          </div>
          <MuiLinearProgress value={Math.min(100, Math.log10(totals.points + 1) * 14)} color="accent" height={8} />
        </div>
      </MuiCardContent>
    </MuiCard>
  );
}

// ── Active Training (hero) ────────────────────────────────────────────────────
function ActiveTrainingCard({
  active, paused, currentCipher, sessionSeconds, sessionPts, currentBonus,
  onPickCipher, onToggle, onCommit, intensity,
}) {
  const opts = CIPHERS.map((c) => ({
    value: c.name, label: c.name, meta: `C${c.complexity}`,
  }));
  const cipher = CIPHERS.find((c) => c.name === currentCipher);

  // tick to next milestone (every 60s = one "epoch")
  const epochSec = 60;
  const epochProgress = ((sessionSeconds % epochSec) / epochSec) * 100;

  return (
    <MuiCard>
      <MuiCardHeader
        avatar={<MuiAvatar color="accent"><MuiIcon name="auto_awesome" size={22} /></MuiAvatar>}
        title="Active Training"
        subheader={cipher ? `TARGET · ${cipher.name.toUpperCase()} · ${cipher.block}` : 'NO TARGET SELECTED'}
        action={<>
          <MuiChip
            label={active ? 'TRAINING' : (paused ? 'PAUSED' : 'IDLE')}
            color={active ? 'accent' : (paused ? 'warn' : 'default')}
            size="small"
            icon={active ? <span className="live-dot" /> : null}
          />
          <MuiIconButton title="Logs"><MuiIcon name="article" /></MuiIconButton>
        </>}
      />
      <MuiCardContent>
        {/* Neural net visual */}
        <div style={{
          position: 'relative',
          borderRadius: 8,
          overflow: 'hidden',
          marginBottom: 14,
        }}>
          <NeuralNetCanvas active={active} intensity={intensity} cipherName={currentCipher || ''} />

          {/* Floating session HUD */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(0,0,0,0.55)',
            border: '1px solid rgba(10,245,176,0.25)',
            borderRadius: 8, padding: '8px 12px',
            backdropFilter: 'blur(4px)',
            display: 'grid', gridTemplateColumns: 'auto auto', gap: '4px 14px',
            fontFamily: "'Fira Code', monospace", fontSize: 11,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>session</span>
            <span style={{ color: '#0af5b0', textAlign: 'right' }}>{fmtTime(sessionSeconds)}</span>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>epoch</span>
            <span style={{ color: 'rgba(255,255,255,0.92)', textAlign: 'right' }}>
              {Math.floor(sessionSeconds / 60)}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.55)' }}>+pts/s</span>
            <span style={{ color: '#9ffce0', textAlign: 'right' }}>
              {active ? '×' + POINT_BASE.toFixed(2) : '—'}
            </span>
          </div>

          {/* Bottom stat strip */}
          <div style={{
            position: 'absolute', left: 12, bottom: 12, right: 12,
            display: 'flex', gap: 10, pointerEvents: 'none',
          }}>
            <HudStat label="SESSION PTS"   value={fmtNum(sessionPts)}     accent />
            <HudStat label="CURRENT BONUS" value={`+${currentBonus.toFixed(1)}%`} />
            <HudStat label="EPOCH"         value={`${epochProgress.toFixed(0)}%`} />
          </div>
        </div>

        {/* Epoch progress */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
            marginBottom: 6,
          }}>
            <span>Next epoch</span>
            <span style={{ color: '#0af5b0', fontFamily: "'Fira Code', monospace" }}>
              {Math.floor(epochSec - (sessionSeconds % epochSec))}s
            </span>
          </div>
          <MuiLinearProgress value={epochProgress} color={active ? 'accent' : 'warn'} height={6} />
        </div>

        {/* Target selector */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, alignItems: 'stretch',
        }}>
          <MuiSelect
            value={currentCipher}
            onChange={onPickCipher}
            placeholder="Select target cipher…"
            options={opts}
            minWidth={'100%'}
          />
          <MuiButton
            variant="outlined" color={paused ? 'primary' : 'neutral'}
            onClick={onToggle}
            startIcon={<MuiIcon name={active ? 'pause' : 'play_arrow'} size={18} />}
          >
            {active ? 'Pause' : 'Resume'}
          </MuiButton>
          <MuiButton
            variant="contained" color="primary"
            onClick={onCommit}
            disabled={sessionPts < 1}
            startIcon={<MuiIcon name="save" size={18} />}
          >
            Commit
          </MuiButton>
        </div>
      </MuiCardContent>
    </MuiCard>
  );
}

function HudStat({ label, value, accent }) {
  return (
    <div style={{
      flex: 1,
      padding: '8px 10px',
      background: 'rgba(0,0,0,0.55)',
      border: `1px solid ${accent ? 'rgba(10,245,176,0.35)' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 6,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        fontSize: 9, fontWeight: 600, letterSpacing: '0.18em',
        color: 'rgba(255,255,255,0.6)',
      }}>{label}</div>
      <div style={{
        fontFamily: "'Fira Code', monospace", fontWeight: 700, fontSize: 16, marginTop: 2,
        color: accent ? '#0af5b0' : 'rgba(255,255,255,0.92)',
        textShadow: accent ? '0 0 10px rgba(10,245,176,0.5)' : 'none',
      }}>{value}</div>
    </div>
  );
}

// ── Training Library ──────────────────────────────────────────────────────────
function TrainingLibrary({ rows, currentCipher, onSwitch, onReset }) {
  const sorted = [...rows].sort((a, b) => b.points - a.points);
  const maxPts = Math.max(1, ...sorted.map((r) => r.points));

  return (
    <MuiCard>
      <MuiCardHeader
        avatar={<MuiAvatar color="cyan"><MuiIcon name="dataset" size={22} /></MuiAvatar>}
        title="Training Library"
        subheader="ACCUMULATED PROGRESS PER CIPHER"
        action={<MuiChip label={`${rows.filter((r) => r.points > 0).length}/${CIPHERS.length} TRAINED`} size="small" color="cyan" variant="outlined" />}
      />
      <MuiCardContent dense={false} style={{ padding: 0 }}>
        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1.4fr 2fr 1fr 1.2fr 110px',
          gap: 12, padding: '10px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          fontSize: 10, fontWeight: 600, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
          fontFamily: "'Fira Code', monospace",
        }}>
          <span>Cipher</span>
          <span>Points</span>
          <span>Speed bonus</span>
          <span>Sessions</span>
          <span>Last trained</span>
          <span></span>
        </div>

        {sorted.map((r) => {
          const active = r.name === currentCipher;
          const bonus = bonusFromPoints(r.points);
          const fillPct = (Math.log10(r.points + 1) / Math.log10(maxPts + 1)) * 100;
          return (
            <div
              key={r.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1.4fr 2fr 1fr 1.2fr 110px',
                gap: 12, padding: '14px 20px', alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: active ? 'linear-gradient(90deg, rgba(10,245,176,0.10), rgba(10,245,176,0.0) 70%)' : 'transparent',
                position: 'relative',
              }}
            >
              {active && (
                <span style={{
                  position: 'absolute', left: 0, top: 6, bottom: 6, width: 3,
                  background: '#0af5b0', borderRadius: 2,
                  boxShadow: '0 0 8px rgba(10,245,176,0.7)',
                }} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <MuiAvatar color={active ? 'accent' : 'default'} size={32}>
                  <MuiIcon name="lock" size={16} />
                </MuiAvatar>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.92)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    {r.name}
                    {active && <span className="live-dot" style={{ width: 6, height: 6 }} />}
                  </div>
                  <div style={{
                    fontSize: 11, color: 'rgba(255,255,255,0.45)',
                    fontFamily: "'Fira Code', monospace",
                  }}>
                    C{CIPHERS.find((c) => c.name === r.name).complexity} · {CIPHERS.find((c) => c.name === r.name).block}
                  </div>
                </div>
              </div>

              <div style={{
                fontFamily: "'Fira Code', monospace", fontWeight: 600, fontSize: 14,
                color: r.points > 0 ? '#0af5b0' : 'rgba(255,255,255,0.4)',
              }}>
                {fmtNum(r.points)}
              </div>

              <div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 11, fontFamily: "'Fira Code', monospace",
                  color: 'rgba(255,255,255,0.6)', marginBottom: 4,
                }}>
                  <span style={{ color: bonus > 0 ? '#9ffce0' : 'rgba(255,255,255,0.4)' }}>
                    +{bonus.toFixed(1)}%
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{Math.round(fillPct)}%</span>
                </div>
                <div style={{
                  height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${fillPct}%`, height: '100%',
                    background: active
                      ? 'linear-gradient(90deg, #0af5b0, #9ffce0)'
                      : '#0af5b0',
                    boxShadow: active ? '0 0 8px rgba(10,245,176,0.6)' : 'none',
                  }} />
                </div>
              </div>

              <div style={{
                fontFamily: "'Fira Code', monospace", fontSize: 12,
                color: 'rgba(255,255,255,0.7)',
              }}>
                {r.sessions}
              </div>

              <div style={{
                fontFamily: "'Fira Code', monospace", fontSize: 12,
                color: 'rgba(255,255,255,0.55)',
              }}>
                {r.lastTrained || '—'}
              </div>

              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                {active ? (
                  <MuiChip label="ACTIVE" color="accent" size="small" variant="outlined" />
                ) : (
                  <MuiButton
                    variant="outlined" color="primary" size="small"
                    onClick={() => onSwitch(r.name)}
                    startIcon={<MuiIcon name="swap_horiz" size={14} />}
                  >
                    Train
                  </MuiButton>
                )}
                <MuiIconButton title="Reset progress" onClick={() => onReset(r.name)}>
                  <MuiIcon name="restart_alt" size={18} />
                </MuiIconButton>
              </div>
            </div>
          );
        })}
      </MuiCardContent>
    </MuiCard>
  );
}

// ── State hook ────────────────────────────────────────────────────────────────
function useNeuralNet(speed) {
  // Per-cipher saved progress. seconds = total prior training time.
  const [library, setLibrary] = React.useState(() => ({
    'CRC-32':   { seconds: 1200, sessions: 4, lastTrained: '4h ago' },
    'MD5':      { seconds: 900,  sessions: 3, lastTrained: '1d ago' },
    'SHA-1':    { seconds: 660,  sessions: 2, lastTrained: '2d ago' },
    'SHA-256':  { seconds: 380,  sessions: 2, lastTrained: '5d ago' },
    'AES-128':  { seconds: 180,  sessions: 1, lastTrained: '1w ago' },
    'RSA-2048': { seconds: 0,    sessions: 0, lastTrained: '' },
  }));
  const [currentCipher, setCurrentCipher] = React.useState('SHA-256');
  const [active, setActive] = React.useState(true);
  // sessionSeconds: time spent in the current uncommitted session
  const [sessionSeconds, setSessionSeconds] = React.useState(42);

  // tick
  React.useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setSessionSeconds((s) => s + 0.2 * speed);
    }, 200);
    return () => clearInterval(id);
  }, [active, speed]);

  // Switch cipher: commit current session into prev cipher, reset session, start fresh.
  const switchCipher = (next) => {
    if (next === currentCipher) return;
    if (sessionSeconds > 0) {
      setLibrary((lib) => ({
        ...lib,
        [currentCipher]: {
          ...lib[currentCipher],
          seconds: lib[currentCipher].seconds + sessionSeconds,
          sessions: lib[currentCipher].sessions + 1,
          lastTrained: 'just now',
        },
      }));
    }
    setSessionSeconds(0);
    setCurrentCipher(next);
  };

  const commitSession = () => {
    setLibrary((lib) => ({
      ...lib,
      [currentCipher]: {
        ...lib[currentCipher],
        seconds: lib[currentCipher].seconds + sessionSeconds,
        sessions: lib[currentCipher].sessions + 1,
        lastTrained: 'just now',
      },
    }));
    setSessionSeconds(0);
  };

  const resetCipher = (name) => {
    setLibrary((lib) => ({
      ...lib,
      [name]: { seconds: 0, sessions: 0, lastTrained: '' },
    }));
    if (name === currentCipher) setSessionSeconds(0);
  };

  // Compose rows
  const rows = CIPHERS.map((c) => {
    const base = library[c.name];
    const extraSec = c.name === currentCipher ? sessionSeconds : 0;
    const totalSec = base.seconds + extraSec;
    return {
      name: c.name,
      points: pointsAt(totalSec),
      seconds: totalSec,
      sessions: base.sessions + (c.name === currentCipher && extraSec > 0 ? 1 : 0),
      lastTrained: c.name === currentCipher ? 'now' : (base.lastTrained || '—'),
    };
  });

  const totalPts = rows.reduce((sum, r) => sum + r.points, 0);
  const trainedCount = rows.filter((r) => r.points > 0).length;
  const avgBonus =
    rows.filter((r) => r.points > 0)
      .reduce((s, r) => s + bonusFromPoints(r.points), 0) /
    Math.max(1, trainedCount);
  const modelLevel = Math.floor(Math.log2(totalPts + 1));

  return {
    library, currentCipher, active, sessionSeconds, rows,
    totals: { points: totalPts, trained: trainedCount, avgBonus },
    modelLevel,
    setActive, switchCipher, commitSession, resetCipher,
  };
}

// ── Root ──────────────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "scanlines": true,
  "speed": 1,
  "intensity": 1,
  "density": "comfortable"
}/*EDITMODE-END*/;

function NeuralNetPage() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const nn = useNeuralNet(tweaks.speed);

  React.useEffect(() => {
    document.body.classList.toggle('scanlines', !!tweaks.scanlines);
  }, [tweaks.scanlines]);

  const dense = tweaks.density === 'compact';
  const cipher = nn.rows.find((r) => r.name === nn.currentCipher);
  const sessionPts = cipher
    ? cipher.points - pointsAt(nn.library[nn.currentCipher].seconds)
    : 0;
  const currentBonus = cipher ? bonusFromPoints(cipher.points) : 0;

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
          {[
            ['terminal',         'default'],
            ['important_devices','default'],
            ['storage',          'default'],
            ['psychology',       'primary'],
            ['apartment',        'default'],
            ['router',           'default'],
            ['public',           'default'],
            ['share',            'default'],
          ].map(([ic, col]) => (
            <MuiIconButton key={ic} title={ic} color={col}>
              <MuiIcon name={ic} />
            </MuiIconButton>
          ))}
        </div>
      </div>

      <PageHeader totalPts={nn.totals.points} status={nn.active ? 'TRAINING' : 'PAUSED'} />

      {/* Top row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(0, 2fr)',
        gap: 20, marginBottom: 20,
      }}>
        <NetworkStatusCard active={nn.active} totals={nn.totals} modelLevel={nn.modelLevel} />
        <ActiveTrainingCard
          active={nn.active}
          paused={!nn.active}
          currentCipher={nn.currentCipher}
          sessionSeconds={nn.sessionSeconds}
          sessionPts={sessionPts}
          currentBonus={currentBonus}
          intensity={tweaks.intensity}
          onPickCipher={nn.switchCipher}
          onToggle={() => nn.setActive((a) => !a)}
          onCommit={nn.commitSession}
        />
      </div>

      <TrainingLibrary
        rows={nn.rows}
        currentCipher={nn.currentCipher}
        onSwitch={nn.switchCipher}
        onReset={nn.resetCipher}
      />

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
          <TweakSlider label="Synapse intensity" min={0.2} max={2.5} step={0.1} value={tweaks.intensity} onChange={(v) => setTweak('intensity', v)} format={(v) => `${v.toFixed(1)}×`} />
        </TweakSection>
        <TweakSection title="Simulation">
          <TweakSlider label="Training speed" min={0} max={4} step={0.1} value={tweaks.speed} onChange={(v) => setTweak('speed', v)} format={(v) => `${v.toFixed(1)}×`} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<NeuralNetPage />);

// Implicit setActive helper using updater func — needed since we used setActive((a) => !a)
// React's setter accepts updater functions natively; no change required.
