/* global React */
// Material UI-flavored primitives, hand-rolled to match MUI dark theme defaults
// (paper rgba(25,25,25,0.80), border-radius 12px, MUI motion easing).
// Keeps the file footprint small while preserving MUI vocabulary in markup.

const muiEase = '225ms cubic-bezier(0, 0, 0.2, 1)';

function Icon({ name, size = 20, style, ...rest }) {
  return (
    <span
      className="msym"
      style={{ fontSize: size, ...style }}
      {...rest}
    >
      {name}
    </span>
  );
}

function Avatar({ children, color = 'default', size = 40, style }) {
  const palette = {
    default: { bg: 'rgba(255,255,255,0.12)', fg: 'rgba(255,255,255,0.87)' },
    accent:  { bg: 'rgba(10,245,176,0.15)', fg: '#0af5b0' },
    cyan:    { bg: 'rgba(38,198,218,0.15)', fg: '#26c6da' },
    warn:    { bg: 'rgba(255,152,0,0.15)',  fg: '#ff9800' },
    error:   { bg: 'rgba(244,67,54,0.15)',  fg: '#f44336' },
  }[color];
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: palette.bg, color: palette.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Card / CardHeader / CardContent / CardActions ─────────────────────────────
const MuiCard = React.forwardRef(function MuiCard(
  { children, className = '', style, elevation = 1, onClick },
  ref
) {
  const shadow = elevation === 0
    ? 'none'
    : elevation === 2
      ? '0 4px 24px rgba(0,0,0,0.7)'
      : '0 2px 12px rgba(0,0,0,0.6)';
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={className}
      style={{
        background: 'rgba(25,25,25,0.80)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        boxShadow: shadow,
        transition: `box-shadow ${muiEase}, border-color ${muiEase}, background ${muiEase}`,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
});

function CardHeader({ avatar, title, subheader, action, dense = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      padding: dense ? '12px 16px' : '16px 20px',
      gap: 12,
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {avatar && <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'center' }}>{avatar}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div style={{
            fontSize: 18, fontWeight: 600, lineHeight: 1.25,
            color: 'rgba(255,255,255,0.92)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{title}</div>
        )}
        {subheader && (
          <div style={{
            fontSize: 12, fontWeight: 500, marginTop: 2,
            color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em',
          }}>{subheader}</div>
        )}
      </div>
      {action && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{action}</div>}
    </div>
  );
}

function CardContent({ children, dense = false, style }) {
  return (
    <div style={{
      padding: dense ? '12px 16px' : '16px 20px',
      ...style,
    }}>
      {children}
    </div>
  );
}

function CardActions({ children, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 12px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Buttons ───────────────────────────────────────────────────────────────────
function Button({
  children, variant = 'text', color = 'primary', size = 'medium',
  startIcon, endIcon, fullWidth, disabled, onClick, style, type = 'button',
}) {
  const palettes = {
    primary: { fg: '#0af5b0', bg: '#0af5b0', hoverBg: '#3afac3' },
    cyan:    { fg: '#26c6da', bg: '#26c6da', hoverBg: '#4dd0e1' },
    error:   { fg: '#f44336', bg: '#f44336', hoverBg: '#ef5350' },
    neutral: { fg: 'rgba(255,255,255,0.87)', bg: 'rgba(255,255,255,0.10)', hoverBg: 'rgba(255,255,255,0.16)' },
  };
  const p = palettes[color] || palettes.primary;
  const [hover, setHover] = React.useState(false);

  const sizes = {
    small:  { padX: 12, padY: 6,  fs: 13 },
    medium: { padX: 16, padY: 8,  fs: 14 },
    large:  { padX: 22, padY: 10, fs: 15 },
  }[size];

  let bg, fg, border;
  if (variant === 'contained') {
    bg = disabled ? 'rgba(255,255,255,0.12)' : (hover ? p.hoverBg : p.bg);
    fg = color === 'neutral' ? p.fg : '#0a0f0d';
    border = '1px solid transparent';
  } else if (variant === 'outlined') {
    bg = hover ? `rgba(255,255,255,0.06)` : 'transparent';
    fg = disabled ? 'rgba(255,255,255,0.30)' : p.fg;
    border = `1px solid ${disabled ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.20)'}`;
  } else { // text
    bg = hover ? 'rgba(255,255,255,0.06)' : 'transparent';
    fg = disabled ? 'rgba(255,255,255,0.30)' : p.fg;
    border = '1px solid transparent';
  }

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        padding: `${sizes.padY}px ${sizes.padX}px`,
        font: `600 ${sizes.fs}px/1.5 'Inter', system-ui, sans-serif`,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: bg, color: fg, border,
        borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: `background ${muiEase}, color ${muiEase}, box-shadow ${muiEase}`,
        boxShadow: variant === 'contained' && !disabled ? '0 1px 3px rgba(0,0,0,0.4)' : 'none',
        width: fullWidth ? '100%' : undefined,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
}

function IconButton({ children, onClick, size = 'medium', color = 'default', disabled, title, style }) {
  const [hover, setHover] = React.useState(false);
  const dim = { small: 32, medium: 36, large: 40 }[size];
  const palette = {
    default: 'rgba(255,255,255,0.74)',
    primary: '#0af5b0',
    error:   '#f44336',
    cyan:    '#26c6da',
  }[color];
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={title}
      disabled={disabled}
      style={{
        width: dim, height: dim, borderRadius: '50%',
        background: hover && !disabled ? 'rgba(255,255,255,0.08)' : 'transparent',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'rgba(255,255,255,0.30)' : palette,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: `background ${muiEase}`,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── Chip ──────────────────────────────────────────────────────────────────────
function Chip({ label, icon, color = 'default', variant = 'filled', size = 'small', onDelete, style }) {
  const palettes = {
    default: { bg: 'rgba(255,255,255,0.10)', fg: 'rgba(255,255,255,0.87)', bd: 'rgba(255,255,255,0.16)' },
    accent:  { bg: 'rgba(10,245,176,0.14)', fg: '#0af5b0', bd: 'rgba(10,245,176,0.36)' },
    cyan:    { bg: 'rgba(38,198,218,0.14)', fg: '#26c6da', bd: 'rgba(38,198,218,0.36)' },
    warn:    { bg: 'rgba(255,152,0,0.14)',  fg: '#ff9800', bd: 'rgba(255,152,0,0.36)' },
    error:   { bg: 'rgba(244,67,54,0.14)',  fg: '#f44336', bd: 'rgba(244,67,54,0.36)' },
    success: { bg: 'rgba(10,245,176,0.14)', fg: '#0af5b0', bd: 'rgba(10,245,176,0.36)' },
  };
  const p = palettes[color] || palettes.default;
  const padY = size === 'small' ? 2 : 5;
  const padX = size === 'small' ? 9 : 12;
  const fs = size === 'small' ? 11 : 13;

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: `${padY}px ${padX}px`,
      borderRadius: 9999,
      background: variant === 'outlined' ? 'transparent' : p.bg,
      color: p.fg,
      border: `1px solid ${variant === 'outlined' ? p.bd : 'transparent'}`,
      fontSize: fs, fontWeight: 600, letterSpacing: '0.04em',
      lineHeight: 1, whiteSpace: 'nowrap',
      ...style,
    }}>
      {icon}
      {label}
      {onDelete && (
        <span onClick={onDelete} style={{ cursor: 'pointer', opacity: 0.7, marginLeft: 2 }}>
          <Icon name="close" size={14} />
        </span>
      )}
    </span>
  );
}

// ── LinearProgress ────────────────────────────────────────────────────────────
function LinearProgress({ value = 0, color = 'accent', height = 6, indeterminate = false }) {
  const palette = {
    accent:  { bar: '#0af5b0', track: 'rgba(10,245,176,0.15)' },
    cyan:    { bar: '#26c6da', track: 'rgba(38,198,218,0.15)' },
    warn:    { bar: '#ff9800', track: 'rgba(255,152,0,0.15)' },
    error:   { bar: '#f44336', track: 'rgba(244,67,54,0.15)' },
  }[color];
  return (
    <div style={{
      position: 'relative', width: '100%', height,
      background: palette.track, borderRadius: height / 2,
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: `${Math.max(0, Math.min(100, value))}%`,
        background: palette.bar, borderRadius: height / 2,
        transition: `width 250ms cubic-bezier(0,0,0.2,1)`,
        boxShadow: `0 0 8px ${palette.bar}66`,
      }}/>
      {/* shimmer */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        width: '30%',
        background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)`,
        animation: 'scanX 1.6s linear infinite',
        pointerEvents: 'none',
      }}/>
    </div>
  );
}

// ── Select (filled, MUI-style) ────────────────────────────────────────────────
function Select({ value, onChange, options, placeholder = 'Select', disabled, minWidth = 140 }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  return (
    <div ref={ref} style={{ position: 'relative', minWidth }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 10px 8px 12px',
          background: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderBottom: '1px solid rgba(10,245,176,0.5)',
          borderRadius: '6px 6px 0 0',
          color: disabled ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.87)',
          font: '500 13px/1.4 Inter, sans-serif',
          letterSpacing: '0.02em',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : <em style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'normal' }}>{placeholder}</em>}
        </span>
        <Icon name="arrow_drop_down" size={20} style={{ marginLeft: 4 }} />
      </button>
      {open && !disabled && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'rgba(35,35,35,0.98)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 6,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          zIndex: 20,
          padding: '4px 0',
          maxHeight: 280, overflowY: 'auto',
        }}>
          {options.map((o) => (
            <div
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                color: o.value === value ? '#0af5b0' : 'rgba(255,255,255,0.87)',
                background: o.value === value ? 'rgba(10,245,176,0.08)' : 'transparent',
                cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
              }}
              onMouseEnter={(e) => { if (o.value !== value) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { if (o.value !== value) e.currentTarget.style.background = 'transparent'; }}
            >
              <span>{o.label}</span>
              {o.meta && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'Fira Code, monospace' }}>{o.meta}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Checkbox ──────────────────────────────────────────────────────────────────
function Checkbox({ checked, onChange, disabled, label }) {
  return (
    <label style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      color: disabled ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.87)',
      fontSize: 13, userSelect: 'none',
    }}>
      <span style={{
        width: 18, height: 18, borderRadius: 4,
        border: `2px solid ${checked ? '#0af5b0' : 'rgba(255,255,255,0.40)'}`,
        background: checked ? '#0af5b0' : 'transparent',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: `background ${muiEase}, border-color ${muiEase}`,
      }}>
        {checked && <Icon name="check" size={14} style={{ color: '#0a0f0d', fontWeight: 700 }} />}
      </span>
      <input
        type="checkbox" checked={checked} disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
      {label}
    </label>
  );
}

// ── Definition row (MUI list item-ish) ────────────────────────────────────────
function DefRow({ label, value, mono, accent, icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
        {icon && <Icon name={icon} size={18} style={{ color: 'rgba(255,255,255,0.45)' }} />}
        {label}
      </div>
      <div style={{
        fontFamily: mono ? "'Fira Code', monospace" : 'Inter, sans-serif',
        fontSize: 13, fontWeight: mono ? 500 : 600,
        color: accent ? '#0af5b0' : 'rgba(255,255,255,0.92)',
        textAlign: 'right',
      }}>
        {value}
      </div>
    </div>
  );
}

window.muiEase = muiEase;
window.MuiIcon = Icon;
window.MuiAvatar = Avatar;
window.MuiCard = MuiCard;
window.MuiCardHeader = CardHeader;
window.MuiCardContent = CardContent;
window.MuiCardActions = CardActions;
window.MuiButton = Button;
window.MuiIconButton = IconButton;
window.MuiChip = Chip;
window.MuiLinearProgress = LinearProgress;
window.MuiSelect = Select;
window.MuiCheckbox = Checkbox;
window.MuiDefRow = DefRow;
