/* global React, MuiIcon, MuiButton, HACKER_PROFILES, STAT_KEYS, MiniPortrait, DossierPortrait, StatBar, DifficultyChip */

// ─────────────────────────────────────────────────────────────────────────────
// Shared lookup data for the callsign + briefing steps
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_VARIANTS = [
  { id: 'a', label: 'Standard',   tint:   0, frame: 'solid'  },
  { id: 'b', label: 'Negative',   tint: -22, frame: 'solid'  },
  { id: 'c', label: 'Recon',      tint:  18, frame: 'dashed' },
  { id: 'd', label: 'Redacted',   tint:  44, frame: 'redact' },
];

const ORIGINS = [
  {
    id: 'basement',
    name: 'Basement Prodigy',
    sub: 'Self-taught · age 14',
    bonus: { stat: 'stealth', amt: 5 },
    icon: 'shelves',
    blurb: 'Years on shared hosting and bootleg compilers. Knows how to keep quiet.',
  },
  {
    id: 'dropout',
    name: 'MIT Dropout',
    sub: 'Comp Sci · ABD',
    bonus: { stat: 'cryptography', amt: 5 },
    icon: 'school',
    blurb: 'Wrote a thesis the department refused to publish. Took the math with you.',
  },
  {
    id: 'sysadmin',
    name: 'Ex-Corporate Sysadmin',
    sub: '12y · F500 backend',
    bonus: { stat: 'networking', amt: 5 },
    icon: 'business',
    blurb: 'Spent a decade keeping VPNs alive. Now you know exactly where they leak.',
  },
];

const HOME_BASES = [
  { id: 'tyo', city: 'Tokyo',     name: 'Free Port',   meta: 'JP · 32 Tbps', color: '#26c6da' },
  { id: 'rkv', city: 'Reykjavik', name: 'Cold Site',   meta: 'IS · −4°C',    color: '#61dafb' },
  { id: 'gru', city: 'São Paulo', name: 'Grid Sub-7',  meta: 'BR · Mesh',    color: '#ff9800' },
  { id: 'lgs', city: 'Lagos',     name: 'Sandbox',     meta: 'NG · Tier-A',  color: '#0af5b0' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Generic helpers (also used by the operator step)
// ─────────────────────────────────────────────────────────────────────────────

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

function Panel({ children, accent, style }) {
  return (
    <div style={{
      background: 'rgba(25,25,25,0.82)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      border: `1px solid ${accent ? accent + '33' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: 14,
      boxShadow: '0 2px 12px rgba(0,0,0,0.6)',
      ...style,
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — CALLSIGN
// ─────────────────────────────────────────────────────────────────────────────

function CallsignStep({ profile, identity, setIdentity }) {
  const p = profile;
  const callsign = identity.callsign || '';
  const valid = callsign.trim().length >= 3 && /^[A-Za-z0-9_.-]+$/.test(callsign.trim());
  const taken = valid && ['admin', 'phantom', 'h4x0r'].includes(callsign.trim().toLowerCase());
  const ok = valid && !taken;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 320px) minmax(0, 1fr)',
      gap: 22, alignItems: 'start',
    }}>
      {/* ── LEFT: Live ID badge preview ─────────────────────────────────── */}
      <IdBadgePreview profile={p} identity={identity} />

      {/* ── RIGHT: Form ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>

        {/* Callsign input */}
        <Panel accent={p.accent} style={{ padding: 20 }}>
          <SectionLabel accent={p.accent}>// CALLSIGN</SectionLabel>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px', marginTop: 4,
            background: 'rgba(0,0,0,0.40)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderBottom: `2px solid ${ok ? p.accent : taken ? '#f44336' : 'rgba(255,255,255,0.24)'}`,
            borderRadius: '8px 8px 0 0',
          }}>
            <span style={{
              fontFamily: "'Fira Code', monospace", fontSize: 18,
              color: p.accent, letterSpacing: '0.06em',
            }}>$&nbsp;</span>
            <input
              type="text" value={callsign}
              maxLength={20}
              placeholder="enter_handle"
              onChange={(e) => setIdentity({ callsign: e.target.value })}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'rgba(255,255,255,0.96)',
                fontSize: 22, fontWeight: 700,
                fontFamily: "'Fira Code', monospace",
                letterSpacing: '0.04em', minWidth: 0,
              }}
            />
            <span style={{
              fontSize: 11, fontFamily: "'Fira Code', monospace",
              color: 'rgba(255,255,255,0.40)', letterSpacing: '0.04em',
              flexShrink: 0,
            }}>{callsign.length}/20</span>
            <button type="button" title="Random"
              onClick={() => {
                const pool = ['Null_Pointer', 'PARITY_X', 'h3xenburg', 'glitchwitch',
                  'kernel.panic', 'rootkit_jane', '0xCascade', 'SNOWLEOPARD'];
                setIdentity({ callsign: pool[Math.floor(Math.random() * pool.length)] });
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 6,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: 'rgba(255,255,255,0.78)',
                fontSize: 10, fontWeight: 700, letterSpacing: '0.10em',
                fontFamily: "'Fira Code', monospace",
                cursor: 'pointer', textTransform: 'uppercase',
              }}>
              <MuiIcon name="shuffle" size={12} />
              Random
            </button>
          </div>

          {/* Availability strip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px',
            background: ok ? 'rgba(10,245,176,0.08)' : taken ? 'rgba(244,67,54,0.08)' : 'rgba(0,0,0,0.30)',
            border: '1px solid ' + (ok ? 'rgba(10,245,176,0.30)' : taken ? 'rgba(244,67,54,0.30)' : 'rgba(255,255,255,0.10)'),
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            fontSize: 12, fontFamily: "'Fira Code', monospace",
            color: ok ? '#0af5b0' : taken ? '#ff6464' : 'rgba(255,255,255,0.55)',
            letterSpacing: '0.04em',
          }}>
            <MuiIcon
              name={ok ? 'check_circle' : taken ? 'cancel' : valid ? 'sync' : 'edit'}
              size={14} />
            {ok && <span>AVAILABLE · routing to leaderboard…</span>}
            {taken && <span>HANDLE TAKEN · pick another</span>}
            {!valid && callsign.length === 0 && (
              <span>3–20 chars · letters, numbers, &amp; <code style={{ color: 'rgba(255,255,255,0.78)' }}>. _ -</code></span>
            )}
            {!valid && callsign.length > 0 && callsign.length < 3 && <span>TOO SHORT · 3 char min</span>}
            {!valid && callsign.length >= 3 && <span>INVALID CHARACTER</span>}
          </div>
        </Panel>

        {/* Avatar variant + Home base — 2 col */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18,
        }}>
          {/* Avatar variant */}
          <Panel style={{ padding: 18 }}>
            <SectionLabel accent={p.accent}>// AVATAR VARIANT</SectionLabel>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8, marginTop: 4,
            }}>
              {AVATAR_VARIANTS.map((v) => {
                const active = identity.avatarVariant === v.id;
                return (
                  <button key={v.id} type="button"
                    onClick={() => setIdentity({ avatarVariant: v.id })}
                    title={v.label}
                    style={{
                      padding: 6, borderRadius: 10,
                      background: active ? `${p.accent}1c` : 'rgba(0,0,0,0.30)',
                      border: '1px solid ' + (active ? p.accentEdge : 'rgba(255,255,255,0.08)'),
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center',
                    }}>
                    <VariantThumb profile={p} variant={v} active={active} />
                    <div style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.10em',
                      color: active ? p.accent : 'rgba(255,255,255,0.60)',
                      fontFamily: "'Fira Code', monospace",
                      textTransform: 'uppercase',
                    }}>{v.label}</div>
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* Home base */}
          <Panel style={{ padding: 18 }}>
            <SectionLabel accent={p.accent}>// HOME BASE</SectionLabel>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 6, marginTop: 4,
            }}>
              {HOME_BASES.map((b) => {
                const active = identity.homeBase === b.id;
                return (
                  <button key={b.id} type="button"
                    onClick={() => setIdentity({ homeBase: b.id })}
                    style={{
                      textAlign: 'left',
                      padding: '8px 10px',
                      background: active ? `${b.color}1c` : 'rgba(0,0,0,0.30)',
                      border: '1px solid ' + (active ? `${b.color}55` : 'rgba(255,255,255,0.08)'),
                      borderRadius: 8, cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', gap: 2,
                    }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 12, fontWeight: 700,
                      color: active ? b.color : 'rgba(255,255,255,0.92)',
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: 1,
                        background: b.color,
                        boxShadow: `0 0 6px ${b.color}`,
                      }} />
                      {b.city}
                    </div>
                    <div style={{
                      fontSize: 10, color: 'rgba(255,255,255,0.55)',
                      fontFamily: "'Fira Code', monospace", letterSpacing: '0.06em',
                    }}>{b.name} · {b.meta}</div>
                  </button>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* Origin story */}
        <Panel style={{ padding: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10, gap: 12,
          }}>
            <SectionLabel accent={p.accent} dense>// ORIGIN STORY</SectionLabel>
            <span style={{
              fontSize: 10, color: 'rgba(255,255,255,0.45)',
              fontFamily: "'Fira Code', monospace", letterSpacing: '0.08em',
            }}>+5 starting attribute · cosmetic flavor</span>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10, marginTop: 6,
          }}>
            {ORIGINS.map((o) => (
              <OriginCard key={o.id}
                origin={o} accent={p.accent} accentEdge={p.accentEdge}
                active={identity.origin === o.id}
                onSelect={() => setIdentity({ origin: o.id })} />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function VariantThumb({ profile, variant, active }) {
  const p = profile;
  const hueShift = `hue-rotate(${variant.tint}deg)`;
  const redact = variant.frame === 'redact';
  return (
    <div style={{
      width: '100%', aspectRatio: '1 / 1',
      borderRadius: 8,
      background:
        `linear-gradient(135deg, ${p.accent}33, rgba(0,0,0,0.5)),` +
        'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 4px)',
      border: variant.frame === 'dashed'
        ? `1px dashed ${p.accentEdge}`
        : `1px solid ${p.accentEdge}`,
      filter: active ? hueShift : `${hueShift} saturate(0.7) brightness(0.85)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <MuiIcon name={p.glyph} size={36} style={{
        color: p.accent, opacity: 0.92,
        filter: `drop-shadow(0 0 6px ${p.accent}66)`,
      }} />
      {redact && (
        <span style={{
          position: 'absolute', left: '12%', right: '12%',
          top: '52%', height: 6,
          background: '#000', border: '1px solid rgba(255,255,255,0.4)',
        }} />
      )}
    </div>
  );
}

function OriginCard({ origin, accent, accentEdge, active, onSelect }) {
  const o = origin;
  const statLabel = STAT_KEYS.find((s) => s.key === o.bonus.stat).label;
  const statIcon = STAT_KEYS.find((s) => s.key === o.bonus.stat).icon;
  return (
    <button type="button" onClick={onSelect}
      style={{
        textAlign: 'left',
        padding: 14,
        background: active ? `${accent}10` : 'rgba(0,0,0,0.30)',
        border: '1px solid ' + (active ? accentEdge : 'rgba(255,255,255,0.10)'),
        borderRadius: 10, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 8,
        boxShadow: active ? `0 0 24px ${accent}22` : 'none',
        transition: 'background 200ms, border-color 200ms',
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: active ? `${accent}1c` : 'rgba(255,255,255,0.06)',
          border: '1px solid ' + (active ? accentEdge : 'rgba(255,255,255,0.10)'),
          color: active ? accent : 'rgba(255,255,255,0.78)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <MuiIcon name={o.icon} size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.96)',
          }}>{o.name}</div>
          <div style={{
            fontSize: 10, color: 'rgba(255,255,255,0.55)',
            fontFamily: "'Fira Code', monospace", letterSpacing: '0.06em',
            textTransform: 'uppercase', marginTop: 1,
          }}>{o.sub}</div>
        </div>
      </div>
      <div style={{
        fontSize: 12, lineHeight: 1.5, color: 'rgba(255,255,255,0.70)',
        flex: 1,
      }}>{o.blurb}</div>
      <div style={{
        display: 'inline-flex', alignSelf: 'flex-start',
        alignItems: 'center', gap: 6,
        padding: '4px 8px', borderRadius: 9999,
        background: active ? accent : `${accent}1c`,
        color: active ? '#0a0f0d' : accent,
        fontSize: 10, fontWeight: 800, letterSpacing: '0.10em',
        fontFamily: "'Fira Code', monospace",
        textTransform: 'uppercase',
      }}>
        <MuiIcon name={statIcon} size={12} />
        +{o.bonus.amt} {statLabel}
      </div>
    </button>
  );
}

// ID badge preview (left column of Step 2)
function IdBadgePreview({ profile, identity }) {
  const p = profile;
  const origin = ORIGINS.find((o) => o.id === identity.origin);
  const base = HOME_BASES.find((b) => b.id === identity.homeBase);
  const variant = AVATAR_VARIANTS.find((v) => v.id === identity.avatarVariant) || AVATAR_VARIANTS[0];
  const cs = identity.callsign && identity.callsign.trim().length >= 3 ? identity.callsign : '— unset —';

  return (
    <Panel accent={p.accent} style={{
      padding: 0, overflow: 'hidden',
      position: 'sticky', top: 20,
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: `${p.accent}1a`,
        borderBottom: `1px solid ${p.accentEdge}`,
      }}>
        <div style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '0.20em',
          color: p.accent, fontFamily: "'Fira Code', monospace",
        }}>OPERATOR ID · PREVIEW</div>
        <div style={{
          fontSize: 9, fontFamily: "'Fira Code', monospace",
          color: 'rgba(255,255,255,0.55)', letterSpacing: '0.10em',
        }}>{p.portraitId}-{(identity.avatarVariant || 'a').toUpperCase()}</div>
      </div>

      {/* Portrait */}
      <div style={{ padding: 18, paddingBottom: 14 }}>
        <div style={{
          width: '100%', aspectRatio: '1 / 1',
          borderRadius: 12,
          background:
            `linear-gradient(135deg, ${p.accent}33, rgba(0,0,0,0.55)),` +
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 4px)',
          border: variant.frame === 'dashed'
            ? `2px dashed ${p.accentEdge}`
            : `1px solid ${p.accentEdge}`,
          filter: `hue-rotate(${variant.tint}deg)`,
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `inset 0 0 60px ${p.accent}1a`,
        }}>
          <MuiIcon name={p.glyph} size={120} style={{
            color: p.accent, opacity: 0.9,
            filter: `drop-shadow(0 0 18px ${p.accent}66)`,
          }} />
          {variant.frame === 'redact' && (
            <span style={{
              position: 'absolute', left: '12%', right: '12%',
              top: '54%', height: 14,
              background: '#000', border: '1px solid rgba(255,255,255,0.4)',
            }} />
          )}
          {/* corner crops */}
          {['tl','tr','bl','br'].map((corner) => {
            const pos = {
              tl: { top: 6,  left: 6 }, tr: { top: 6,  right: 6 },
              bl: { bottom: 6, left: 6 }, br: { bottom: 6, right: 6 },
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
      </div>

      {/* Identity rows */}
      <div style={{ padding: '0 18px 18px' }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
          color: p.accent, fontFamily: "'Fira Code', monospace",
        }}>$ HANDLE</div>
        <div style={{
          marginTop: 2,
          fontSize: 22, fontWeight: 700,
          color: 'rgba(255,255,255,0.96)',
          fontFamily: "'Fira Code', monospace",
          letterSpacing: '0.02em',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{cs}</div>

        <div style={{
          marginTop: 4,
          fontSize: 11, color: 'rgba(255,255,255,0.55)',
          fontFamily: "'Fira Code', monospace", letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>{p.callsign} · {p.classification.split(' · ')[0]}</div>

        {/* meta strip */}
        <div style={{
          marginTop: 14, paddingTop: 12,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        }}>
          <MetaTile label="ORIGIN"
            value={origin ? origin.name : '—'}
            sub={origin ? `+${origin.bonus.amt} ${STAT_KEYS.find((s) => s.key === origin.bonus.stat).label}` : 'select one'}
            accent={origin ? p.accent : 'rgba(255,255,255,0.45)'} />
          <MetaTile label="BASE"
            value={base ? base.city : '—'}
            sub={base ? base.name : 'select one'}
            accent={base ? base.color : 'rgba(255,255,255,0.45)'} />
        </div>
      </div>
    </Panel>
  );
}

function MetaTile({ label, value, sub, accent }) {
  return (
    <div>
      <div style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.16em',
        color: 'rgba(255,255,255,0.50)',
        fontFamily: "'Fira Code', monospace",
      }}>{label}</div>
      <div style={{
        marginTop: 2,
        fontSize: 13, fontWeight: 700,
        color: 'rgba(255,255,255,0.94)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{value}</div>
      <div style={{
        fontSize: 10, color: accent,
        fontFamily: "'Fira Code', monospace", letterSpacing: '0.06em',
        marginTop: 1,
      }}>{sub}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — BRIEFING
// ─────────────────────────────────────────────────────────────────────────────

function BriefingStep({ profile, identity }) {
  const p = profile;
  const origin = ORIGINS.find((o) => o.id === identity.origin);
  const base = HOME_BASES.find((b) => b.id === identity.homeBase);
  const cs = identity.callsign && identity.callsign.trim().length >= 3 ? identity.callsign : 'operator';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
      gap: 22, alignItems: 'start',
    }}>
      {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
        {/* Transmission terminal */}
        <Panel accent={p.accent} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'rgba(0,0,0,0.50)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="live-dot" />
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.18em',
                color: p.accent, fontFamily: "'Fira Code', monospace",
              }}>INCOMING TRANSMISSION</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
            </div>
          </div>
          <div style={{
            padding: 18,
            background: '#000',
            fontFamily: "'Fira Code', monospace",
            fontSize: 12.5, lineHeight: 1.7,
            color: 'rgba(255,255,255,0.86)',
            minHeight: 220,
          }}>
            <div style={{ color: 'rgba(255,255,255,0.45)' }}>$ ssh handler@cb-station.onion</div>
            <div style={{ color: 'rgba(255,255,255,0.55)' }}>[ OK ] tunnel established · 2048-bit</div>
            <div style={{ color: '#26c6da' }}>[ OK ] handshake verified · welcome, <span style={{ color: p.accent, textShadow: `0 0 8px ${p.accent}` }}>{cs}</span></div>
            <div style={{ color: 'rgba(255,255,255,0.45)' }}>—</div>
            <div style={{ color: 'rgba(255,255,255,0.92)' }}>
              We saw your work in the {origin ? origin.name.toLowerCase() : 'underground'}. You&apos;re registered
              under <span style={{ color: p.accent }}>{p.callsign.toLowerCase()}</span> class · permits issued.
            </div>
            <div style={{ color: 'rgba(255,255,255,0.92)' }}>
              Your rig is racked at <span style={{ color: base ? base.color : '#0af5b0', textShadow: `0 0 6px ${base ? base.color : '#0af5b0'}` }}>{base ? `${base.city.toUpperCase()} · ${base.name}` : 'BASE'}</span>.
              Power is on. Workload queue is empty.
            </div>
            <div style={{ color: 'rgba(255,255,255,0.92)' }}>
              First contract attached. Burn it after reading.
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>—</div>
            <div style={{ color: p.accent }}>
              [ ✓ ] Briefing complete · awaiting <span style={{
                background: p.accent, color: '#0a0f0d', padding: '0 4px', borderRadius: 2,
              }}>DEPLOY</span>
              <span style={{
                display: 'inline-block', width: 8, height: 14, marginLeft: 4,
                background: p.accent, verticalAlign: 'middle',
                animation: 'cursorBlink 1s steps(1) infinite',
              }} />
            </div>
          </div>
        </Panel>

        {/* First contract preview */}
        <Panel style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '12px 18px',
            background: 'rgba(0,0,0,0.30)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <MuiIcon name="assignment" size={16} style={{ color: p.accent }} />
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.78)',
              fontFamily: "'Fira Code', monospace",
            }}>First Contract</div>
            <div style={{ flex: 1 }} />
            <div style={{
              padding: '2px 8px', borderRadius: 4,
              background: 'rgba(40,255,40,0.12)',
              border: '1px solid rgba(40,255,40,0.30)',
              color: '#28ff28', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.12em', fontFamily: "'Fira Code', monospace",
            }}>RISK · LOW</div>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '56px 1fr auto',
            gap: 14, padding: 18, alignItems: 'center',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 10,
              background: `radial-gradient(closest-side, ${p.accent}33, transparent 75%)`,
              border: `1px solid ${p.accentEdge}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: p.accent,
            }}>
              <MuiIcon name="tag" size={28} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.96)',
              }}>Crack a CRC-32 checksum</div>
              <div style={{
                marginTop: 3,
                fontSize: 11, color: 'rgba(255,255,255,0.55)',
                fontFamily: "'Fira Code', monospace", letterSpacing: '0.06em',
              }}>JOB-0001 · ~45s · payout in fiat · no heat</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: 18, fontWeight: 700, color: '#28ff28',
                fontFamily: "'Fira Code', monospace",
                textShadow: '0 0 10px rgba(40,255,40,0.4)',
              }}>+ $250</div>
              <div style={{
                fontSize: 10, color: 'rgba(255,255,255,0.45)',
                fontFamily: "'Fira Code', monospace", letterSpacing: '0.08em',
                marginTop: 2,
              }}>+25 XP</div>
            </div>
          </div>
        </Panel>
      </div>

      {/* ── RIGHT COLUMN: Recap + checklist ────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minWidth: 0 }}>
        {/* Identity recap */}
        <Panel accent={p.accent} style={{ padding: 18 }}>
          <SectionLabel accent={p.accent}>// IDENTITY DOSSIER</SectionLabel>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14, marginTop: 6,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 10, flexShrink: 0,
              background:
                `linear-gradient(135deg, ${p.accent}33, rgba(0,0,0,0.5)),` +
                'repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 4px)',
              border: `1px solid ${p.accentEdge}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: p.accent,
              filter: `hue-rotate(${(AVATAR_VARIANTS.find(v => v.id === identity.avatarVariant) || AVATAR_VARIANTS[0]).tint}deg)`,
            }}>
              <MuiIcon name={p.glyph} size={38} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.96)',
                fontFamily: "'Fira Code', monospace", letterSpacing: '0.02em',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{cs}</div>
              <div style={{
                fontSize: 11, color: p.accent,
                fontFamily: "'Fira Code', monospace", letterSpacing: '0.10em',
                textTransform: 'uppercase', marginTop: 2,
              }}>{p.callsign}</div>
            </div>
          </div>

          <div style={{
            marginTop: 14, paddingTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            <DossierRow icon="badge"     label="Class"   value={p.callsign} accent={p.accent} />
            <DossierRow icon={origin ? origin.icon : 'help'} label="Origin"
              value={origin ? origin.name : '— pending —'}
              accent={origin ? p.accent : 'rgba(255,255,255,0.45)'} />
            <DossierRow icon="location_on" label="Base"
              value={base ? `${base.city} · ${base.name}` : '— pending —'}
              accent={base ? base.color : 'rgba(255,255,255,0.45)'} />
            <DossierRow icon="trending_up" label="Bonus"
              value={origin ? `+${origin.bonus.amt} ${STAT_KEYS.find(s => s.key === origin.bonus.stat).label}` : '—'}
              accent={'#28ff28'} mono />
            <DossierRow icon={p.signature.icon} label="Signature"
              value={`${p.signature.name} · ${p.signature.cooldown} CD`}
              accent={p.accent} />
          </div>
        </Panel>

        {/* Pre-flight checklist */}
        <Panel style={{ padding: 18 }}>
          <SectionLabel accent={p.accent}>// PRE-FLIGHT</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 6 }}>
            <ChecklistRow ok label="Operator class assigned" />
            <ChecklistRow ok label="Callsign reserved" />
            <ChecklistRow ok label="Starting kit transferred" sub={`${profile.startingKit.length} items + seed wallet`} />
            <ChecklistRow ok label="Tunnel encrypted" sub="ed25519 · 2048-bit" />
            <ChecklistRow warn label="Tutorial mission queued" sub="can be skipped from Settings" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function DossierRow({ icon, label, value, accent, mono }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 0', gap: 12,
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        color: 'rgba(255,255,255,0.55)', fontSize: 12,
        fontFamily: "'Fira Code', monospace", letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        <MuiIcon name={icon} size={14} style={{ color: 'rgba(255,255,255,0.45)' }} />
        {label}
      </div>
      <div style={{
        fontSize: 12, fontWeight: 600,
        color: accent,
        fontFamily: mono ? "'Fira Code', monospace" : 'Inter, sans-serif',
        textShadow: mono ? `0 0 8px ${accent}66` : 'none',
        textAlign: 'right', maxWidth: '60%',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{value}</div>
    </div>
  );
}

function ChecklistRow({ ok, warn, label, sub }) {
  const color = ok ? '#0af5b0' : warn ? '#ff9800' : '#f44336';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{
        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
        background: `${color}1c`,
        border: `1px solid ${color}66`,
        color: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 1,
      }}>
        <MuiIcon name={warn ? 'priority_high' : 'check'} size={12} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.94)' }}>{label}</div>
        {sub && <div style={{
          fontSize: 11, color: 'rgba(255,255,255,0.50)',
          fontFamily: "'Fira Code', monospace", letterSpacing: '0.04em', marginTop: 1,
        }}>{sub}</div>}
      </div>
    </div>
  );
}

// Inject cursor blink keyframes
if (typeof document !== 'undefined' && !document.getElementById('cb-cursor-anim')) {
  const s = document.createElement('style');
  s.id = 'cb-cursor-anim';
  s.textContent = `
    @keyframes cursorBlink { 0%, 50% { opacity: 1 } 50.01%, 100% { opacity: 0 } }
  `;
  document.head.appendChild(s);
}

window.CallsignStep = CallsignStep;
window.BriefingStep = BriefingStep;
window.STEP_ORIGINS = ORIGINS;
window.STEP_HOME_BASES = HOME_BASES;
window.STEP_AVATAR_VARIANTS = AVATAR_VARIANTS;
