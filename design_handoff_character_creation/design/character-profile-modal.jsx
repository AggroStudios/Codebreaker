/* global React, MuiIcon, MuiButton, STAT_KEYS */

// ─────────────────────────────────────────────────────────────────────────────
// Profile dossier modal — opened from the character creation cards
// Patterned after servers-modals.jsx (frosted backdrop, accent-tinted glow)
// ─────────────────────────────────────────────────────────────────────────────

function ProfileModal({ open, profile, onClose, onSelect, isSelected }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !profile) return null;
  const p = profile;

  return (
    <div onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 800,
        background: 'rgba(0,0,0,0.62)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'mdlFadeIn 180ms ease-out',
      }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 880, maxHeight: 'calc(100vh - 40px)',
          background: 'rgba(22,22,22,0.96)',
          border: `1px solid ${p.accent}40`,
          borderRadius: 14,
          boxShadow: `0 24px 64px rgba(0,0,0,0.8), 0 0 32px ${p.accent}26`,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'mdlSlideUp 220ms cubic-bezier(0,0,0.2,1)',
        }}>

        {/* ── Hero header (portrait + identity) ────────────────────────── */}
        <div style={{
          position: 'relative',
          padding: '20px 24px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background:
            `linear-gradient(135deg, ${p.accent}18 0%, transparent 55%),` +
            `linear-gradient(180deg, ${p.accent}10, transparent)`,
          display: 'flex', gap: 18, alignItems: 'stretch',
        }}>
          {/* Portrait slot */}
          <DossierPortrait profile={p} />

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.20em',
              textTransform: 'uppercase', color: p.accent,
              fontFamily: "'Fira Code', monospace",
            }}>
              DOSSIER · {p.portraitId}
            </div>
            <div style={{
              marginTop: 4,
              fontSize: 30, fontWeight: 700, lineHeight: 1.05,
              color: 'rgba(255,255,255,0.96)',
              letterSpacing: '-0.01em',
            }}>
              {p.callsign}
            </div>
            <div style={{
              marginTop: 6,
              fontSize: 12, fontWeight: 600, letterSpacing: '0.10em',
              color: 'rgba(255,255,255,0.55)',
              fontFamily: "'Fira Code', monospace",
            }}>
              {p.classification}
            </div>
            <div style={{
              marginTop: 'auto', paddingTop: 12,
              display: 'flex', flexWrap: 'wrap', gap: 6,
            }}>
              <DifficultyChip rating={p.difficulty} accent={p.accent} />
              <MetaChip icon="badge" label={`AKA ${p.realName}`} />
              <MetaChip icon="schedule" label={`SIG · ${p.signature.cooldown} CD`} />
            </div>
          </div>

          {/* Close button */}
          <button type="button" onClick={onClose} title="Close"
            style={{
              position: 'absolute', top: 14, right: 14,
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
            <MuiIcon name="close" size={16} />
          </button>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>

          {/* Bio */}
          <SectionLabel accent={p.accent}>// BACKGROUND</SectionLabel>
          <p style={{
            margin: '0 0 18px',
            fontSize: 14, lineHeight: 1.65,
            color: 'rgba(255,255,255,0.80)',
          }}>{p.bio}</p>

          {/* Stats + Signature row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
            marginBottom: 18,
          }}>
            {/* Stat block */}
            <div style={{
              padding: 14, borderRadius: 10,
              background: 'rgba(0,0,0,0.30)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <SectionLabel accent={p.accent} dense>// ATTRIBUTES</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {STAT_KEYS.map((s) => (
                  <StatBar key={s.key}
                    label={s.label} icon={s.icon}
                    value={p.stats[s.key]} accent={p.accent} />
                ))}
              </div>
            </div>

            {/* Signature ability */}
            <div style={{
              padding: 14, borderRadius: 10,
              background: `linear-gradient(135deg, ${p.accent}14, transparent 70%)`,
              border: `1px solid ${p.accentEdge}`,
              display: 'flex', flexDirection: 'column',
            }}>
              <SectionLabel accent={p.accent} dense>// SIGNATURE ABILITY</SectionLabel>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                marginTop: 12, marginBottom: 10,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: p.accentSoft,
                  border: `1px solid ${p.accentEdge}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: p.accent,
                  boxShadow: `0 0 16px ${p.accent}33`,
                }}>
                  <MuiIcon name={p.signature.icon} size={26} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.96)',
                    letterSpacing: '0.02em',
                  }}>{p.signature.name}</div>
                  <div style={{
                    fontSize: 11, color: p.accent,
                    fontFamily: "'Fira Code', monospace",
                    letterSpacing: '0.10em', textTransform: 'uppercase',
                  }}>Cooldown · {p.signature.cooldown}</div>
                </div>
              </div>
              <div style={{
                fontSize: 13, lineHeight: 1.55,
                color: 'rgba(255,255,255,0.72)',
              }}>{p.signature.desc}</div>
            </div>
          </div>

          {/* Perks */}
          <SectionLabel accent={p.accent}>// CLASS PERKS</SectionLabel>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 8, marginBottom: 18,
          }}>
            {p.perks.map((perk) => (
              <PerkRow key={perk.label} perk={perk} accent={p.accent} accentSoft={p.accentSoft} />
            ))}
          </div>

          {/* Starting kit + recommended */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16,
          }}>
            <div>
              <SectionLabel accent={p.accent}>// STARTING KIT</SectionLabel>
              <div style={{
                background: 'rgba(0,0,0,0.30)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '2px 14px',
              }}>
                {p.startingKit.map((k, i) => (
                  <KitRow key={k.name} kit={k} accent={p.accent} last={i === p.startingKit.length - 1} />
                ))}
              </div>
            </div>
            <div>
              <SectionLabel accent={p.accent}>// RECOMMENDED FOR</SectionLabel>
              <div style={{
                background: 'rgba(0,0,0,0.30)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                {p.recommended.map((r) => (
                  <div key={r} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 13, color: 'rgba(255,255,255,0.80)',
                  }}>
                    <MuiIcon name="check_circle" size={16} style={{ color: p.accent }} />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div style={{
          padding: '14px 18px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.30)',
          display: 'flex', alignItems: 'center', gap: 10,
          justifyContent: 'space-between',
        }}>
          <div style={{
            fontSize: 11, fontFamily: "'Fira Code', monospace",
            color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em',
          }}>
            <MuiIcon name="info" size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: 'rgba(255,255,255,0.35)' }} />
            CLASS LOCKS IN AT PRESTIGE 0 · CAN BE RESPEC&apos;D
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <MuiButton variant="text" color="neutral" onClick={onClose}>Back</MuiButton>
            <button type="button"
              onClick={() => { onSelect(p.id); onClose(); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 22px',
                font: "700 14px/1.5 'Inter', system-ui, sans-serif",
                letterSpacing: '0.06em', textTransform: 'uppercase',
                background: isSelected ? 'rgba(255,255,255,0.10)' : p.accent,
                color: isSelected ? p.accent : '#0a0f0d',
                border: isSelected ? `1px solid ${p.accentEdge}` : '1px solid transparent',
                borderRadius: 8, cursor: 'pointer',
                boxShadow: isSelected ? 'none' : `0 0 24px ${p.accent}55`,
              }}>
              <MuiIcon name={isSelected ? 'check' : 'login'} size={16} />
              {isSelected ? 'Currently Selected' : 'Select This Operator'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Subcomponents ──────────────────────────────────────────────────────────

function DossierPortrait({ profile }) {
  const p = profile;
  return (
    <div style={{
      width: 168, height: 168, flexShrink: 0,
      borderRadius: 12,
      background:
        `linear-gradient(135deg, ${p.accent}22, rgba(0,0,0,0.5)),` +
        'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 4px)',
      border: `1px solid ${p.accentEdge}`,
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `inset 0 0 60px ${p.accent}1a, 0 8px 24px rgba(0,0,0,0.5)`,
    }}>
      <MuiIcon name={p.glyph} size={88} style={{
        color: p.accent, opacity: 0.85,
        filter: `drop-shadow(0 0 16px ${p.accent}66)`,
      }} />
      <div style={{
        position: 'absolute', left: 8, top: 8,
        fontSize: 9, fontFamily: "'Fira Code', monospace",
        color: p.accent, letterSpacing: '0.14em',
      }}>ID:{p.portraitId}</div>
      <div style={{
        position: 'absolute', left: 8, bottom: 8, right: 8,
        fontSize: 9, fontFamily: "'Fira Code', monospace",
        color: 'rgba(255,255,255,0.45)', letterSpacing: '0.10em',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>● REC</span>
        <span>{(Math.random() * 60 | 0).toString().padStart(2, '0')}:14:08</span>
      </div>
      {/* corner crops */}
      {['tl','tr','bl','br'].map((corner) => {
        const pos = {
          tl: { top: 6,  left: 6 },
          tr: { top: 6,  right: 6 },
          bl: { bottom: 6, left: 6 },
          br: { bottom: 6, right: 6 },
        }[corner];
        const borders = {
          tl: { borderTop: `2px solid ${p.accent}`, borderLeft: `2px solid ${p.accent}` },
          tr: { borderTop: `2px solid ${p.accent}`, borderRight: `2px solid ${p.accent}` },
          bl: { borderBottom: `2px solid ${p.accent}`, borderLeft: `2px solid ${p.accent}` },
          br: { borderBottom: `2px solid ${p.accent}`, borderRight: `2px solid ${p.accent}` },
        }[corner];
        return <span key={corner} style={{ position: 'absolute', width: 14, height: 14, ...pos, ...borders }} />;
      })}
    </div>
  );
}

function SectionLabel({ children, accent, dense }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: accent || 'rgba(255,255,255,0.55)',
      fontFamily: "'Fira Code', monospace",
      marginBottom: dense ? 0 : 10,
    }}>{children}</div>
  );
}

function StatBar({ label, icon, value, accent }) {
  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 4,
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.72)',
          fontFamily: "'Fira Code', monospace",
        }}>
          <MuiIcon name={icon} size={13} style={{ color: 'rgba(255,255,255,0.55)' }} />
          {label}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: accent,
          fontFamily: "'Fira Code', monospace",
          textShadow: `0 0 6px ${accent}66`,
        }}>{value}</span>
      </div>
      {/* Segmented bar */}
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: 20 }).map((_, i) => {
          const lit = i < Math.round(value / 5);
          return (
            <div key={i} style={{
              flex: 1, height: 6,
              borderRadius: 1,
              background: lit
                ? (i >= 16 ? accent : `${accent}cc`)
                : 'rgba(255,255,255,0.06)',
              boxShadow: lit ? `0 0 4px ${accent}66` : 'none',
            }} />
          );
        })}
      </div>
    </div>
  );
}

function PerkRow({ perk, accent, accentSoft }) {
  return (
    <div style={{
      display: 'flex', gap: 10,
      padding: 12,
      background: 'rgba(0,0,0,0.30)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 8,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 7, flexShrink: 0,
        background: accentSoft, color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <MuiIcon name={perk.icon} size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.94)',
          marginBottom: 2,
        }}>{perk.label}</div>
        <div style={{
          fontSize: 11.5, lineHeight: 1.45,
          color: 'rgba(255,255,255,0.55)',
        }}>{perk.desc}</div>
      </div>
    </div>
  );
}

function KitRow({ kit, accent, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0',
      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 6,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.10)',
        color: 'rgba(255,255,255,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <MuiIcon name={kit.icon} size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>{kit.name}</div>
        <div style={{
          fontSize: 10, color: 'rgba(255,255,255,0.50)',
          fontFamily: "'Fira Code', monospace", letterSpacing: '0.06em',
          textTransform: 'uppercase', marginTop: 1,
        }}>{kit.meta}</div>
      </div>
      <div style={{
        fontSize: 12, fontWeight: 700,
        fontFamily: "'Fira Code', monospace",
        color: accent,
      }}>{kit.qty}</div>
    </div>
  );
}

function DifficultyChip({ rating, accent }) {
  const labels = ['', 'NOVICE', 'EASY', 'MODERATE', 'HARD', 'BRUTAL'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '4px 10px',
      background: `${accent}1a`,
      border: `1px solid ${accent}40`,
      borderRadius: 9999,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
      color: accent, fontFamily: "'Fira Code', monospace",
    }}>
      <span style={{ display: 'inline-flex', gap: 2 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{
            width: 5, height: 5, borderRadius: 1,
            background: i < rating ? accent : 'rgba(255,255,255,0.18)',
            boxShadow: i < rating ? `0 0 4px ${accent}` : 'none',
          }} />
        ))}
      </span>
      {labels[rating]}
    </span>
  );
}

function MetaChip({ icon, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 9999,
      fontSize: 10, fontWeight: 600, letterSpacing: '0.10em',
      color: 'rgba(255,255,255,0.72)',
      fontFamily: "'Fira Code', monospace",
      textTransform: 'uppercase',
    }}>
      <MuiIcon name={icon} size={12} style={{ color: 'rgba(255,255,255,0.55)' }} />
      {label}
    </span>
  );
}

// Inject animations once (shared with servers-modals)
if (typeof document !== 'undefined' && !document.getElementById('mdl-anim')) {
  const s = document.createElement('style');
  s.id = 'mdl-anim';
  s.textContent = `
    @keyframes mdlFadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes mdlSlideUp { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
  `;
  document.head.appendChild(s);
}

window.ProfileModal = ProfileModal;
window.DossierPortrait = DossierPortrait;
window.StatBar = StatBar;
window.DifficultyChip = DifficultyChip;
