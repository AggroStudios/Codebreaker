/* global React, ReactDOM, PrestigeSkillTree, SKILLS, SKILL_BY_ID, BRANCHES, nodeStatus,
   MuiIcon, MuiAvatar, MuiCard, MuiCardHeader, MuiCardContent, MuiCardActions,
   MuiButton, MuiIconButton, MuiChip, MuiLinearProgress, MuiDefRow,
   TweaksPanel, useTweaks, TweakSection, TweakSlider, TweakToggle, TweakRadio */

// ── Numbers ───────────────────────────────────────────────────────────────────
const fmtNum = (n) => Math.floor(n).toLocaleString('en-US');
const fmtMoney = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Page Header ───────────────────────────────────────────────────────────────
function PageHeader({ canPrestige, level, requirement, available }) {
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
          <MuiIcon name="settings_backup_restore" size={16} />
          /home/operator/prestige
        </div>
        <h1 style={{
          margin: 0, fontSize: 38, fontWeight: 700, lineHeight: 1.1,
          letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.96)',
        }}>
          Prestige
        </h1>
        <div style={{
          marginTop: 8, fontSize: 14, color: 'rgba(255,255,255,0.55)', maxWidth: 620,
        }}>
          Hard-reset the run to bank permanent Prestige Points and reshape your operator’s skill tree.
          Each cycle compounds. Spend wisely — points refund any time.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <MuiChip
          label={<><span className="live-dot" style={{ marginRight: 6, background: canPrestige ? '#0af5b0' : '#ff9800', boxShadow: canPrestige ? '0 0 6px #0af5b0' : '0 0 6px #ff9800', animation: canPrestige ? undefined : 'none' }} />{canPrestige ? 'ARMED' : 'LOCKED'}</>}
          color={canPrestige ? 'accent' : 'warn'} variant="outlined"
        />
        <MuiChip label={`LEVEL ${level} / ${requirement}`} color="default" variant="outlined" icon={<MuiIcon name="military_tech" size={14} />} />
        <MuiChip label={`${available} PP AVAIL`} color="cyan" variant="outlined" icon={<MuiIcon name="diamond" size={14} />} />
      </div>
    </div>
  );
}

// ── Prestige Status card ──────────────────────────────────────────────────────
function PrestigeStatus({ level, requirement, xp, xpPerPoint, lifetimePrestiges, allocated, available, totalSpent }) {
  const levelPct = Math.min(100, (level / requirement) * 100);
  const xpToNextPt = xpPerPoint - (xp % xpPerPoint);
  const xpPct = ((xp % xpPerPoint) / xpPerPoint) * 100;
  const nextStipend = Math.floor(xp / xpPerPoint) + 1; // ordinal point being filled
  const allocatedCount = Object.values(allocated).filter(Boolean).length - 1; // exclude root
  return (
    <MuiCard>
      <MuiCardHeader
        avatar={<MuiAvatar color="cyan"><MuiIcon name="settings_backup_restore" size={22} /></MuiAvatar>}
        title="Prestige Status"
        subheader="OPERATOR PROFILE"
      />
      <MuiCardContent>
        <MuiDefRow icon="military_tech" label="Operator level"     value={`${level} / ${requirement}`} mono accent={level >= requirement} />
        <MuiDefRow icon="diamond"       label="Points available"   value={`${available}`} mono accent={available > 0} />
        <MuiDefRow icon="check_circle"  label="Points spent"       value={`${totalSpent}`} mono />
        <MuiDefRow icon="hub"           label="Skills allocated"   value={`${allocatedCount} / ${SKILLS.length - 1}`} mono />
        <MuiDefRow icon="loop"          label="Lifetime prestiges" value={`${lifetimePrestiges}`} mono accent={lifetimePrestiges > 0} />
        <MuiDefRow icon="bolt"          label="XP / point"         value={`${fmtNum(xpPerPoint)} XP`} mono />

        <div style={{ marginTop: 16 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
            marginBottom: 6,
          }}>
            <span>Level requirement</span>
            <span style={{ color: level >= requirement ? '#0af5b0' : '#ff9800', fontFamily: "'Fira Code', monospace" }}>
              {levelPct.toFixed(0)}%
            </span>
          </div>
          <MuiLinearProgress value={levelPct} color={level >= requirement ? 'accent' : 'warn'} height={6} />
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
            marginBottom: 6,
          }}>
            <span>PP #{nextStipend} progress</span>
            <span style={{ color: '#26c6da', fontFamily: "'Fira Code', monospace" }}>
              {fmtNum(xpToNextPt)} XP TO GO
            </span>
          </div>
          <MuiLinearProgress value={xpPct} color="cyan" height={6} />
        </div>
      </MuiCardContent>
    </MuiCard>
  );
}

// ── Mechanism Explainer + Prestige CTA card ───────────────────────────────────
function MechanismCard({ canPrestige, level, requirement, available, xp, xpPerPoint, onPrestige }) {
  return (
    <MuiCard>
      <MuiCardHeader
        avatar={<MuiAvatar color="accent"><MuiIcon name="auto_awesome_motion" size={22} /></MuiAvatar>}
        title="The Prestige Mechanism"
        subheader="WHAT YOU GAIN · WHAT RESETS"
        action={<MuiChip
          label={canPrestige ? 'READY' : `NEED L${requirement}`}
          color={canPrestige ? 'accent' : 'warn'}
          size="small"
          icon={canPrestige ? <span className="live-dot" /> : null}
        />}
      />
      <MuiCardContent>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14,
        }}>
          <MechRow icon="add_circle" tone="good" title="You keep" lines={[
            'All Prestige Points and allocated skills',
            'Permanent upgrades (Perm Upgrades)',
            'Neural Net training points',
            'Statistics & lifetime totals',
          ]} />
          <MechRow icon="restart_alt" tone="bad" title="You reset" lines={[
            'Operator level → 1',
            'Servers, racks, data centers, networks',
            'Cash on hand → $0.00',
            'Active cipher queue',
          ]} />
        </div>

        <div style={{
          padding: '14px 16px',
          background: 'linear-gradient(90deg, rgba(10,245,176,0.10), rgba(38,198,218,0.05))',
          border: '1px solid rgba(10,245,176,0.22)',
          borderRadius: 8,
          marginBottom: 14,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
          }}>
            <MuiIcon name="info" size={18} style={{ color: '#0af5b0' }} />
            <div style={{
              fontFamily: "'Fira Code', monospace", fontSize: 11,
              fontWeight: 700, letterSpacing: '0.16em', color: '#0af5b0',
              textTransform: 'uppercase',
            }}>How points are minted</div>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.55 }}>
            Reach <b style={{ color: '#fff' }}>Operator Level {requirement}</b> to unlock the Prestige action.
            For every <b style={{ color: '#fff' }}>{fmtNum(xpPerPoint)} XP</b> banked across your career, one
            extra Prestige Point is minted. Spend points on the skill tree below — they remain across all
            future prestiges, and can be refunded at any time.
          </div>
        </div>

        {/* Big CTA */}
        <PrestigeButton
          canPrestige={canPrestige}
          level={level}
          requirement={requirement}
          gain={Math.floor(xp / xpPerPoint) + 1}
          onPrestige={onPrestige}
        />
      </MuiCardContent>
    </MuiCard>
  );
}

function MechRow({ icon, tone, title, lines }) {
  const col = tone === 'good' ? '#0af5b0' : '#ff7676';
  return (
    <div style={{
      padding: '12px 14px',
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${col}33`,
      borderRadius: 8,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: "'Fira Code', monospace", fontSize: 10,
        fontWeight: 700, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: col,
        marginBottom: 8,
      }}>
        <MuiIcon name={icon} size={14} /> {title}
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
        {lines.map((l, i) => (
          <li key={i} style={{
            fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4,
            paddingLeft: 14, position: 'relative',
          }}>
            <span style={{
              position: 'absolute', left: 0, top: 7, width: 6, height: 6,
              borderRadius: '50%', background: col, boxShadow: `0 0 6px ${col}88`,
            }} />
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PrestigeButton({ canPrestige, level, requirement, gain, onPrestige }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      disabled={!canPrestige}
      onClick={onPrestige}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={canPrestige ? 'armed-ring' : ''}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px',
        background: canPrestige
          ? `linear-gradient(90deg, ${hover ? '#3afac3' : '#0af5b0'}, ${hover ? '#9ffce0' : '#26c6da'})`
          : 'rgba(255,255,255,0.05)',
        color: canPrestige ? '#04221a' : 'rgba(255,255,255,0.4)',
        border: `1px solid ${canPrestige ? '#0af5b0' : 'rgba(255,255,255,0.10)'}`,
        borderRadius: 10,
        cursor: canPrestige ? 'pointer' : 'not-allowed',
        font: '700 14px/1 Inter, sans-serif',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        transition: 'background 200ms ease, color 200ms ease, transform 120ms ease',
        boxShadow: canPrestige ? '0 8px 24px rgba(10,245,176,0.25)' : 'none',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span className="msym" style={{ fontSize: 22 }}>settings_backup_restore</span>
        {canPrestige ? 'Initiate Prestige' : `Locked — Reach Level ${requirement}`}
      </span>
      <span style={{
        fontFamily: "'Fira Code', monospace", fontSize: 13, letterSpacing: '0.06em',
        textTransform: 'none', fontWeight: 700,
        background: canPrestige ? 'rgba(4,34,26,0.20)' : 'transparent',
        padding: '6px 10px', borderRadius: 6,
      }}>
        {canPrestige ? `+${gain} PP` : `${level} / ${requirement}`}
      </span>
    </button>
  );
}

// ── Skill tree card wrapper ───────────────────────────────────────────────────
function SkillTreeCard(props) {
  return (
    <MuiCard style={{ overflow: 'hidden' }}>
      <MuiCardHeader
        avatar={<MuiAvatar color="accent"><MuiIcon name="account_tree" size={22} /></MuiAvatar>}
        title="Prestige Skill Tree"
        subheader="DRAG · ZOOM · ALLOCATE"
        action={
          <>
            <MuiChip label={`${props.available} AVAIL`} color="cyan" size="small" variant="outlined" icon={<MuiIcon name="diamond" size={14} />} />
            <MuiChip label={`${props.totalSpent} SPENT`} color="accent" size="small" variant="outlined" icon={<MuiIcon name="check" size={14} />} />
            <MuiIconButton title="Refund all" onClick={props.onRefundAll}>
              <MuiIcon name="undo" />
            </MuiIconButton>
          </>
        }
      />
      <div style={{ position: 'relative', height: 680, background: 'rgba(0,0,0,0.30)' }}>
        <PrestigeSkillTree
          allocated={props.allocated}
          available={props.available}
          onAllocate={props.onAllocate}
          onRefund={props.onRefund}
        />
      </div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 16,
        padding: '12px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontFamily: "'Fira Code', monospace", fontSize: 11,
        color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em',
      }}>
        {[
          { c: BRANCHES.N.fg, t: 'THROUGHPUT' },
          { c: BRANCHES.E.fg, t: 'WEALTH' },
          { c: BRANCHES.S.fg, t: 'AUTOMATION' },
          { c: BRANCHES.W.fg, t: 'RECON' },
        ].map((s) => (
          <span key={s.t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: s.c, boxShadow: `0 0 6px ${s.c}aa` }} />
            {s.t}
          </span>
        ))}
        <span style={{ flex: 1 }} />
        <span>★ CAPSTONE — one per branch, 6 PT</span>
      </div>
    </MuiCard>
  );
}

// ── State hook ────────────────────────────────────────────────────────────────
function usePrestige({ levelRequirement, xpPerPoint, simSpeed }) {
  // Level + XP that tick up over time so the UI breathes.
  const [level, setLevel] = React.useState(47);
  const [xp, setXp] = React.useState(38400);
  const [lifetimePrestiges, setLifetimePrestiges] = React.useState(3);

  // Allocated skills — start with a believable cycle 3 spread.
  const [allocated, setAllocated] = React.useState({
    genesis: true,
    n1: true,
    n2: true,
    e1: true,
    e2: true,
    s1: true,
    w1: true,
  });

  // Tick level + xp
  React.useEffect(() => {
    const id = setInterval(() => {
      setXp((x) => x + 12 * simSpeed);
      // ~1 level per 6 sec at 1x sim speed
      setLevel((l) => l + 0.012 * simSpeed);
    }, 200);
    return () => clearInterval(id);
  }, [simSpeed]);

  const totalSpent = SKILLS.reduce(
    (sum, s) => sum + (allocated[s.id] ? s.cost : 0),
    0
  );

  // Available PP = mintedFromCareer + baseFromPrestiges - totalSpent.
  // We pretend career XP minted Math.floor(xp / xpPerPoint) points (visible to the user as "PP mint progress")
  // plus a 2-per-prestige stipend that scales lifetime.
  const minted = Math.floor(xp / xpPerPoint);
  const baseStipend = 5 + lifetimePrestiges * 2;
  const totalEarned = minted + baseStipend;
  const available = Math.max(0, totalEarned - totalSpent);

  const intLevel = Math.floor(level);
  const canPrestige = intLevel >= levelRequirement;

  // Actions
  const allocateSkill = (skill) => {
    if (allocated[skill.id]) return;
    if (nodeStatus(skill, allocated, available) !== 'available') return;
    setAllocated((a) => ({ ...a, [skill.id]: true }));
  };
  const refundSkill = (skill) => {
    if (!allocated[skill.id] || skill.id === 'genesis') return;
    // Refund chain: also refund any allocated descendants that would lose prereqs.
    const next = { ...allocated, [skill.id]: false };
    let changed = true;
    while (changed) {
      changed = false;
      SKILLS.forEach((s) => {
        if (!next[s.id]) return;
        const reqs = s.requires || [];
        if (reqs.length && !reqs.every((r) => next[r])) {
          next[s.id] = false;
          changed = true;
        }
      });
    }
    setAllocated(next);
  };
  const refundAll = () => setAllocated({ genesis: true });

  const initiatePrestige = () => {
    if (!canPrestige) return;
    // Bank minted points by absorbing them into the "lifetime" delta.
    setLifetimePrestiges((n) => n + 1);
    setLevel(1);
    setXp((x) => x); // (we keep career XP — minted points are permanent)
  };

  return {
    level: intLevel, xp, lifetimePrestiges,
    allocated, totalSpent, available, canPrestige, minted,
    allocateSkill, refundSkill, refundAll, initiatePrestige,
  };
}

// ── Root page ─────────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "scanlines": true,
  "simSpeed": 1,
  "levelRequirement": 50,
  "xpPerPoint": 25000
}/*EDITMODE-END*/;

function PrestigePage() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const p = usePrestige({
    levelRequirement: tweaks.levelRequirement,
    xpPerPoint: tweaks.xpPerPoint,
    simSpeed: tweaks.simSpeed,
  });

  React.useEffect(() => {
    document.body.classList.toggle('scanlines', !!tweaks.scanlines);
  }, [tweaks.scanlines]);

  const dense = tweaks.density === 'compact';

  return (
    <div style={{
      minHeight: '100%',
      padding: dense ? '20px 24px 80px' : '32px 40px 80px',
      maxWidth: 1600, margin: '0 auto',
    }}>
      {/* Brand strip — matches Station v2 */}
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
            ['terminal',                'default'],
            ['important_devices',       'default'],
            ['storage',                 'default'],
            ['apartment',               'default'],
            ['router',                  'default'],
            ['public',                  'default'],
            ['share',                   'default'],
            ['publish',                 'default'],
            ['settings_backup_restore', 'primary'],
          ].map(([ic, col]) => (
            <MuiIconButton key={ic} title={ic} color={col}>
              <MuiIcon name={ic} />
            </MuiIconButton>
          ))}
        </div>
      </div>

      <PageHeader
        canPrestige={p.canPrestige}
        level={p.level}
        requirement={tweaks.levelRequirement}
        available={p.available}
      />

      {/* Top row: status + mechanism */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(0, 1.6fr)',
        gap: 20, marginBottom: 20,
      }}>
        <PrestigeStatus
          level={p.level}
          requirement={tweaks.levelRequirement}
          xp={p.xp}
          xpPerPoint={tweaks.xpPerPoint}
          lifetimePrestiges={p.lifetimePrestiges}
          allocated={p.allocated}
          available={p.available}
          totalSpent={p.totalSpent}
        />
        <MechanismCard
          canPrestige={p.canPrestige}
          level={p.level}
          requirement={tweaks.levelRequirement}
          available={p.available}
          xp={p.xp}
          xpPerPoint={tweaks.xpPerPoint}
          onPrestige={p.initiatePrestige}
        />
      </div>

      <SkillTreeCard
        allocated={p.allocated}
        available={p.available}
        totalSpent={p.totalSpent}
        onAllocate={p.allocateSkill}
        onRefund={p.refundSkill}
        onRefundAll={p.refundAll}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection title="Layout">
          <TweakRadio
            label="Density"
            value={tweaks.density}
            options={[{ label: 'Comfortable', value: 'comfortable' }, { label: 'Compact', value: 'compact' }]}
            onChange={(v) => setTweak('density', v)}
          />
          <TweakToggle label="Scanlines" checked={tweaks.scanlines} onChange={(v) => setTweak('scanlines', v)} />
        </TweakSection>
        <TweakSection title="Mechanism (to be tuned later)">
          <TweakSlider
            label="Level requirement"
            min={10} max={150} step={5}
            value={tweaks.levelRequirement}
            onChange={(v) => setTweak('levelRequirement', v)}
            format={(v) => `L${v}`}
          />
          <TweakSlider
            label="XP per Prestige Point"
            min={1000} max={100000} step={1000}
            value={tweaks.xpPerPoint}
            onChange={(v) => setTweak('xpPerPoint', v)}
            format={(v) => fmtNum(v) + ' XP'}
          />
        </TweakSection>
        <TweakSection title="Simulation">
          <TweakSlider label="Speed" min={0} max={5} step={0.1} value={tweaks.simSpeed} onChange={(v) => setTweak('simSpeed', v)} format={(v) => `${v.toFixed(1)}×`} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<PrestigePage />);
