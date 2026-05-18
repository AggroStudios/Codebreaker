/* global React, ReactDOM,
   MuiIcon, MuiButton,
   TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle, TweakText, TweakSelect,
   HACKER_PROFILES, STAT_KEYS,
   ProfileModal, StatBar, DifficultyChip,
   CallsignStep, BriefingStep, STEP_ORIGINS, STEP_HOME_BASES */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "step": 1,
  "selectedId": "operator",
  "showModal": false,
  "callsign": "Null_Pointer",
  "avatarVariant": "a",
  "origin": "dropout",
  "homeBase": "tyo",
  "scanlines": true,
  "density": "comfortable"
}/*EDITMODE-END*/;

// ─────────────────────────────────────────────────────────────────────────────
// Page chrome
// ─────────────────────────────────────────────────────────────────────────────
function BrandStrip() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      marginBottom: 22, paddingBottom: 16,
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
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: "'Fira Code', monospace" }}>
        v3.4.1
      </div>
      <div style={{ flex: 1 }} />
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 10px', borderRadius: 9999,
        background: 'rgba(10,245,176,0.10)',
        border: '1px solid rgba(10,245,176,0.30)',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
        color: '#0af5b0', fontFamily: "'Fira Code', monospace",
      }}>
        <span className="live-dot" style={{ width: 6, height: 6 }} />
        ONBOARDING SECURE
      </div>
    </div>
  );
}

const STEP_DEFS = [
  { id: 1, label: 'Operator', path: 'choose-operator', icon: 'person_add', title: 'Choose Your Operator', sub: 'Your class determines starting gear, perks, and signature ability.' },
  { id: 2, label: 'Callsign', path: 'callsign',        icon: 'badge',      title: 'Forge an Identity',     sub: 'Pick a handle, an origin story, and where you rack your rig.' },
  { id: 3, label: 'Briefing', path: 'briefing',        icon: 'mark_email_unread', title: 'Final Briefing', sub: 'Your handler has a job ready. Burn after reading.' },
];

function PageHeader({ step, profile }) {
  const def = STEP_DEFS[step - 1];
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 11, fontWeight: 600, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: `${profile.accent}d9`,
        fontFamily: "'Fira Code', monospace", marginBottom: 8,
      }}>
        <MuiIcon name={def.icon} size={14} />
        <span>/home/operator/identity/{def.path}</span>
        <span style={{ color: 'rgba(255,255,255,0.30)' }}>·</span>
        <span style={{ color: 'rgba(255,255,255,0.55)' }}>
          STEP {String(step).padStart(2, '0')} / 03 — {def.label.toUpperCase()}
        </span>
      </div>
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{
            margin: 0, fontSize: 42, fontWeight: 700, lineHeight: 1.05,
            letterSpacing: '-0.02em', color: 'rgba(255,255,255,0.96)',
          }}>{def.title}</h1>
          <div style={{
            marginTop: 10, fontSize: 14, lineHeight: 1.5,
            color: 'rgba(255,255,255,0.55)', maxWidth: 640,
          }}>{def.sub}</div>
        </div>

        <Stepper step={step} />
      </div>
    </div>
  );
}

function Stepper({ step }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      padding: '6px 8px',
      background: 'rgba(25,25,25,0.80)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 9999,
      flexShrink: 0,
    }}>
      {STEP_DEFS.map((s, i) => {
        const active = step === s.id;
        const done = step > s.id;
        return (
          <React.Fragment key={s.id}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 9999,
              background: active ? 'rgba(10,245,176,0.14)' : 'transparent',
              color: active ? '#0af5b0' : done ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.45)',
              fontSize: 12, fontWeight: 700, letterSpacing: '0.10em',
              fontFamily: "'Fira Code', monospace",
              transition: 'color 200ms, background 200ms',
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                background: active ? '#0af5b0' : done ? 'rgba(10,245,176,0.28)' : 'rgba(255,255,255,0.10)',
                color: active ? '#0a0f0d' : done ? '#0af5b0' : 'rgba(255,255,255,0.55)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800,
              }}>{done ? <MuiIcon name="check" size={12} /> : s.id}</span>
              {s.label.toUpperCase()}
            </div>
            {i < STEP_DEFS.length - 1 && (
              <span style={{
                width: 14, height: 1,
                background: step > s.id ? 'rgba(10,245,176,0.40)' : 'rgba(255,255,255,0.12)',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Operator selection (3 cards)
// ─────────────────────────────────────────────────────────────────────────────
function OperatorStep({ selectedId, onSelect, onView }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: 18,
    }}>
      {HACKER_PROFILES.map((p) => (
        <ProfileCard
          key={p.id}
          profile={p}
          selected={selectedId === p.id}
          onSelect={onSelect}
          onView={onView}
        />
      ))}
    </div>
  );
}

function ProfileCard({ profile, selected, onSelect, onView }) {
  const p = profile;
  const [hover, setHover] = React.useState(false);
  const lift = selected || hover;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onSelect(p.id)}
      style={{
        position: 'relative', cursor: 'pointer',
        background: selected
          ? `linear-gradient(180deg, ${p.accent}10, rgba(25,25,25,0.92))`
          : 'rgba(25,25,25,0.82)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: `1px solid ${selected ? p.accentEdge : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 14,
        boxShadow: selected
          ? `0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px ${p.accent}40 inset, 0 0 32px ${p.accent}22`
          : (hover ? `0 12px 32px rgba(0,0,0,0.55)` : '0 2px 12px rgba(0,0,0,0.6)'),
        transform: lift ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 225ms cubic-bezier(0,0,0.2,1), box-shadow 225ms, border-color 225ms, background 225ms',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: selected ? p.accent : 'transparent',
        boxShadow: selected ? `0 0 12px ${p.accent}` : 'none',
      }} />
      {selected && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 9999,
          background: p.accent, color: '#0a0f0d',
          fontSize: 10, fontWeight: 800, letterSpacing: '0.14em',
          fontFamily: "'Fira Code', monospace",
          boxShadow: `0 0 16px ${p.accent}77`, zIndex: 2,
        }}>
          <MuiIcon name="check" size={12} />
          SELECTED
        </div>
      )}

      <div style={{
        padding: '20px 20px 16px',
        display: 'flex', gap: 14, alignItems: 'stretch',
        background: `linear-gradient(135deg, ${p.accent}14 0%, transparent 60%)`,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <MiniPortrait profile={p} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.20em',
            textTransform: 'uppercase', color: p.accent,
            fontFamily: "'Fira Code', monospace",
          }}>CLASS · {p.id.toUpperCase()}</div>
          <div style={{
            marginTop: 4, fontSize: 22, fontWeight: 700, lineHeight: 1.1,
            color: 'rgba(255,255,255,0.96)', letterSpacing: '-0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{p.callsign}</div>
          <div style={{
            marginTop: 4, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
            color: 'rgba(255,255,255,0.55)',
            fontFamily: "'Fira Code', monospace",
          }}>{p.classification}</div>
          <div style={{ marginTop: 'auto', paddingTop: 8 }}>
            <DifficultyChip rating={p.difficulty} accent={p.accent} />
          </div>
        </div>
      </div>

      <div style={{
        padding: '14px 20px 4px', fontSize: 13, lineHeight: 1.5,
        color: 'rgba(255,255,255,0.78)', fontStyle: 'italic',
      }}>&ldquo;{p.tagline}&rdquo;</div>

      <div style={{
        padding: '12px 20px 16px',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {STAT_KEYS.map((s) => (
          <StatBar key={s.key} label={s.label} icon={s.icon}
            value={p.stats[s.key]} accent={p.accent} />
        ))}
      </div>

      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.18)',
      }}>
        <div style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.50)',
          fontFamily: "'Fira Code', monospace", marginBottom: 8,
        }}>// TOP PERKS</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {p.perks.slice(0, 2).map((perk) => (
            <div key={perk.label} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 12, color: 'rgba(255,255,255,0.85)',
            }}>
              <MuiIcon name={perk.icon} size={14} style={{ color: p.accent }} />
              <span style={{
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{perk.label}</span>
            </div>
          ))}
          <div style={{
            fontSize: 11, color: 'rgba(255,255,255,0.45)',
            fontFamily: "'Fira Code', monospace", letterSpacing: '0.04em',
            marginTop: 2,
          }}>+ {p.perks.length - 2} more · {p.startingKit.length}-item starting kit</div>
        </div>
      </div>

      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.30)',
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <button type="button"
          onClick={(e) => { e.stopPropagation(); onView(p.id); }}
          style={{
            flex: 1,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px 12px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.88)',
            fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}>
          <MuiIcon name="folder_open" size={14} />
          View Dossier
        </button>
        <button type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(p.id); }}
          style={{
            flex: 1,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px 12px',
            background: selected ? 'rgba(255,255,255,0.08)' : p.accent,
            color: selected ? p.accent : '#0a0f0d',
            border: selected ? `1px solid ${p.accentEdge}` : '1px solid transparent',
            borderRadius: 8,
            fontSize: 12, fontWeight: 800, letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: 'pointer',
            boxShadow: selected ? 'none' : `0 0 16px ${p.accent}55`,
          }}>
          <MuiIcon name={selected ? 'check' : 'add'} size={14} />
          {selected ? 'Selected' : 'Select'}
        </button>
      </div>
    </div>
  );
}

function MiniPortrait({ profile }) {
  const p = profile;
  return (
    <div style={{
      width: 96, height: 96, flexShrink: 0,
      borderRadius: 10,
      background:
        `linear-gradient(135deg, ${p.accent}26, rgba(0,0,0,0.55)),` +
        'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 4px)',
      border: `1px solid ${p.accentEdge}`,
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `inset 0 0 32px ${p.accent}1f`,
    }}>
      <MuiIcon name={p.glyph} size={56} style={{
        color: p.accent, opacity: 0.85,
        filter: `drop-shadow(0 0 10px ${p.accent}55)`,
      }} />
      {['tl','tr','bl','br'].map((corner) => {
        const pos = {
          tl: { top: 4, left: 4 }, tr: { top: 4, right: 4 },
          bl: { bottom: 4, left: 4 }, br: { bottom: 4, right: 4 },
        }[corner];
        const borders = {
          tl: { borderTop: `2px solid ${p.accent}`, borderLeft: `2px solid ${p.accent}` },
          tr: { borderTop: `2px solid ${p.accent}`, borderRight: `2px solid ${p.accent}` },
          bl: { borderBottom: `2px solid ${p.accent}`, borderLeft: `2px solid ${p.accent}` },
          br: { borderBottom: `2px solid ${p.accent}`, borderRight: `2px solid ${p.accent}` },
        }[corner];
        return <span key={corner} style={{ position: 'absolute', width: 10, height: 10, ...pos, ...borders }} />;
      })}
      <div style={{
        position: 'absolute', bottom: 4, left: 6,
        fontSize: 8, color: p.accent, opacity: 0.8,
        fontFamily: "'Fira Code', monospace", letterSpacing: '0.12em',
      }}>{p.portraitId}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bottom nav bar — step-aware
// ─────────────────────────────────────────────────────────────────────────────
function NavBar({ step, profile, canAdvance, blockReason, onBack, onNext, onOpenDossier }) {
  const isFinal = step === 3;
  return (
    <div style={{
      marginTop: 28, padding: '16px 22px',
      background: 'rgba(25,25,25,0.88)',
      border: `1px solid ${profile.accentEdge}`,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 24px ${profile.accent}22`,
      borderRadius: 14,
      display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, minWidth: 220,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 9,
          background: profile.accentSoft,
          border: `1px solid ${profile.accentEdge}`,
          color: profile.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 16px ${profile.accent}33`,
        }}>
          <MuiIcon name={profile.glyph} size={20} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
            color: profile.accent, fontFamily: "'Fira Code', monospace",
          }}>SELECTED · {profile.callsign}</div>
          <div style={{
            fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.94)',
            marginTop: 2,
          }}>{profile.classification.split(' · ')[0]}</div>
        </div>
      </div>

      <div style={{
        width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,0.10)',
      }} />

      {/* Status line */}
      <div style={{
        flex: 1, minWidth: 200,
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 12, fontFamily: "'Fira Code', monospace",
        color: canAdvance ? 'rgba(255,255,255,0.65)' : '#ff9800',
        letterSpacing: '0.04em',
      }}>
        <MuiIcon
          name={canAdvance ? 'check_circle' : 'warning'}
          size={16}
          style={{ color: canAdvance ? '#0af5b0' : '#ff9800' }} />
        {canAdvance
          ? (isFinal
              ? 'Pre-flight complete — ready to deploy.'
              : `Step ${step} ready — continue when you're set.`)
          : blockReason || 'Complete this step to continue.'}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {step === 1 && (
          <MuiButton variant="outlined" color="neutral"
            startIcon={<MuiIcon name="folder_open" size={16} />}
            onClick={onOpenDossier}>
            View Dossier
          </MuiButton>
        )}
        <MuiButton variant="text" color="neutral"
          startIcon={<MuiIcon name="arrow_back" size={16} />}
          onClick={onBack}>
          {step === 1 ? 'Title Screen' : 'Back'}
        </MuiButton>
        <button type="button"
          onClick={canAdvance ? onNext : undefined}
          disabled={!canAdvance}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: isFinal ? '14px 32px' : '12px 26px',
            font: `800 ${isFinal ? 16 : 14}px/1 'Inter', system-ui, sans-serif`,
            letterSpacing: '0.10em', textTransform: 'uppercase',
            background: !canAdvance
              ? 'rgba(255,255,255,0.10)'
              : profile.accent,
            color: !canAdvance ? 'rgba(255,255,255,0.40)' : '#0a0f0d',
            border: 'none', borderRadius: 8,
            cursor: !canAdvance ? 'not-allowed' : 'pointer',
            boxShadow: !canAdvance ? 'none' : `0 0 24px ${profile.accent}77`,
          }}>
          {isFinal ? 'Deploy' : 'Continue'}
          <MuiIcon name={isFinal ? 'rocket_launch' : 'arrow_forward'} size={isFinal ? 20 : 18} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root page
// ─────────────────────────────────────────────────────────────────────────────
function CharacterCreationPage() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const step = tweaks.step;
  const selectedId = tweaks.selectedId;
  const profile = HACKER_PROFILES.find((p) => p.id === selectedId) || HACKER_PROFILES[0];

  const identity = {
    callsign:      tweaks.callsign,
    avatarVariant: tweaks.avatarVariant,
    origin:        tweaks.origin,
    homeBase:      tweaks.homeBase,
  };
  const setIdentity = (patch) => {
    Object.entries(patch).forEach(([k, v]) => setTweak(k, v));
  };

  // modal sync
  const [modalId, setModalId] = React.useState(null);
  React.useEffect(() => {
    if (tweaks.showModal && !modalId) setModalId(selectedId);
    if (!tweaks.showModal && modalId) setModalId(null);
  }, [tweaks.showModal]);
  const openModal = (id) => { setModalId(id); setTweak('showModal', true); };
  const closeModal = () => { setModalId(null); setTweak('showModal', false); };

  React.useEffect(() => {
    document.body.classList.toggle('scanlines', !!tweaks.scanlines);
  }, [tweaks.scanlines]);

  // Step gate logic
  const csTrim = (tweaks.callsign || '').trim();
  const csValid = csTrim.length >= 3 && /^[A-Za-z0-9_.-]+$/.test(csTrim);
  const csTaken = csValid && ['admin', 'phantom', 'h4x0r'].includes(csTrim.toLowerCase());
  const step2Ready = csValid && !csTaken && !!tweaks.origin && !!tweaks.homeBase;

  let canAdvance = true, blockReason = '';
  if (step === 1) canAdvance = !!selectedId;
  if (step === 2) {
    canAdvance = step2Ready;
    if (!csValid) blockReason = 'Pick a valid callsign (3+ chars).';
    else if (csTaken) blockReason = 'Callsign is taken — try another.';
    else if (!tweaks.origin) blockReason = 'Pick an origin story.';
    else if (!tweaks.homeBase) blockReason = 'Pick a home base.';
  }

  const setStep = (n) => setTweak('step', Math.max(1, Math.min(3, n)));
  const onNext = () => {
    if (step < 3) setStep(step + 1);
    else alert(`Deploying as ${tweaks.callsign} (${profile.callsign})…`);
  };
  const onBack = () => {
    if (step > 1) setStep(step - 1);
    else alert('Returned to title screen.');
  };

  const dense = tweaks.density === 'compact';

  return (
    <div style={{
      minHeight: '100%',
      padding: dense ? '20px 24px 60px' : '32px 40px 60px',
      maxWidth: 1480, margin: '0 auto',
    }}>
      <BrandStrip />
      <PageHeader step={step} profile={profile} />

      {/* Step content */}
      {step === 1 && (
        <OperatorStep
          selectedId={selectedId}
          onSelect={(id) => setTweak('selectedId', id)}
          onView={openModal}
        />
      )}
      {step === 2 && (
        <CallsignStep
          profile={profile}
          identity={identity}
          setIdentity={setIdentity}
        />
      )}
      {step === 3 && (
        <BriefingStep profile={profile} identity={identity} />
      )}

      {/* Step-aware nav */}
      <NavBar
        step={step}
        profile={profile}
        canAdvance={canAdvance}
        blockReason={blockReason}
        onBack={onBack}
        onNext={onNext}
        onOpenDossier={() => openModal(selectedId)}
      />

      {/* Profile modal */}
      <ProfileModal
        open={!!modalId}
        profile={HACKER_PROFILES.find((p) => p.id === modalId)}
        isSelected={!!modalId && modalId === selectedId}
        onClose={closeModal}
        onSelect={(id) => setTweak('selectedId', id)}
      />

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Flow">
          <TweakRadio label="Step" value={tweaks.step}
            options={[{ label: 'Operator', value: 1 }, { label: 'Callsign', value: 2 }, { label: 'Briefing', value: 3 }]}
            onChange={(v) => setTweak('step', v)} />
          <TweakToggle label="Show Dossier Modal" checked={tweaks.showModal}
            onChange={(v) => setTweak('showModal', v)} />
        </TweakSection>
        <TweakSection title="Operator">
          <TweakRadio label="Class" value={tweaks.selectedId}
            options={HACKER_PROFILES.map((p) => ({ label: p.callsign.split(' ')[0], value: p.id }))}
            onChange={(v) => setTweak('selectedId', v)} />
        </TweakSection>
        <TweakSection title="Identity">
          <TweakText label="Callsign" value={tweaks.callsign}
            onChange={(v) => setTweak('callsign', v)} />
          <TweakRadio label="Avatar" value={tweaks.avatarVariant}
            options={[
              { label: 'Std',     value: 'a' },
              { label: 'Neg',     value: 'b' },
              { label: 'Recon',   value: 'c' },
              { label: 'Redact',  value: 'd' },
            ]}
            onChange={(v) => setTweak('avatarVariant', v)} />
          <TweakSelect label="Origin" value={tweaks.origin}
            options={STEP_ORIGINS.map((o) => ({ label: o.name, value: o.id }))}
            onChange={(v) => setTweak('origin', v)} />
          <TweakSelect label="Home Base" value={tweaks.homeBase}
            options={STEP_HOME_BASES.map((b) => ({ label: `${b.city} · ${b.name}`, value: b.id }))}
            onChange={(v) => setTweak('homeBase', v)} />
        </TweakSection>
        <TweakSection title="Visual">
          <TweakRadio label="Density" value={tweaks.density}
            options={[{ label: 'Roomy', value: 'comfortable' }, { label: 'Compact', value: 'compact' }]}
            onChange={(v) => setTweak('density', v)} />
          <TweakToggle label="Scanlines" checked={tweaks.scanlines}
            onChange={(v) => setTweak('scanlines', v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

window.MiniPortrait = MiniPortrait;
ReactDOM.createRoot(document.getElementById('root')).render(<CharacterCreationPage />);
