# Handoff: Neural Net Page (Codebreaker)

## Overview
The **Neural Net** page lets the player manage an AI model that trains against a
single target cipher. Training accumulates **training points** on an exponential
curve, which convert into a permanent **speed bonus** when breaking that cipher.
The player can swap the training target at any time without losing previously
accumulated progress on other ciphers; a Training Library lists every cipher's
banked progress.

The page lives alongside Station, Servers, Dark Web, etc. and reuses the same
MUI-flavored dark UI vocabulary and accent-green palette.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working
prototype showing intended look, motion, and behavior. They are **not**
production code to ship as-is. The task is to **recreate these designs inside
the Codebreaker codebase** using its existing component library, routing,
state management, and conventions. The HTML prototype uses inline-Babel React
+ hand-rolled MUI-flavored primitives only because the project's design system
is delivered as HTML mockups; the target app may use a different stack.

If the existing app is React, lift the structure directly. If not, treat the
JSX as pseudo-code that describes layout, props, and state transitions.

## Fidelity
**High-fidelity.** All colors, typography, spacing, animations, and
interactions are final. Recreate pixel-perfectly using the codebase's existing
design tokens. The neural-net canvas effect is also final — match the layered
architecture, traveling synapse pulses, scan sweep, and node glow described
below.

---

## Page Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  brand strip (32px logo · CODEBREAKER · v3.4.1 · ────── · icon nav)      │
├──────────────────────────────────────────────────────────────────────────┤
│  Page header                                                             │
│    eyebrow: "/home/operator/neural-net"                                  │
│    h1: "Neural Net"                                                      │
│    sub: "Train your model on a target cipher to accumulate exponential   │
│         training points. Banked points convert into a permanent speed    │
│         bonus on that cipher."                                           │
│    chips (right): TRAINING/PAUSED · <total> TOTAL PTS                    │
├──────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────┐  ┌─────────────────────────────────────────────┐ │
│  │ Network Status     │  │ Active Training (hero)                      │ │
│  │  - architecture    │  │  ┌────────────────────────────────────────┐ │ │
│  │  - parameters      │  │  │  Neural-net canvas (320px tall)        │ │ │
│  │  - optimizer       │  │  │   - 5 layers (5,8,8,6,4)               │ │ │
│  │  - trained count   │  │  │   - traveling synapse pulses           │ │ │
│  │  - avg bonus       │  │  │   - HUD top-right + 3 stats bottom     │ │ │
│  │  - model level     │  │  └────────────────────────────────────────┘ │ │
│  │  - cumulative bar  │  │  Next epoch progress bar                    │ │
│  │                    │  │  [select cipher ▾] [Pause] [Commit]         │ │
│  └────────────────────┘  └─────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────┤
│  Training Library (table card)                                           │
│    columns: Cipher · Points · Speed bonus · Sessions · Last · Actions    │
│    rows: one per cipher (active row is highlighted)                      │
└──────────────────────────────────────────────────────────────────────────┘
```

- **Outer padding:** 32px 40px 80px (comfortable) / 20px 24px 80px (compact tweak)
- **Max width:** 1600px, centered
- **Card gap:** 20px
- **Top grid:** `minmax(320px, 1fr) minmax(0, 2fr)` columns
- **Background:** fixed full-bleed `neuralNet_bg.png` with a
  `linear-gradient(rgba(8,14,18,0.78), rgba(8,14,18,0.85))` overlay; scanline
  overlay (2px repeating linear gradient) optional via tweak.

---

## Screens / Views

### 1. Brand strip & Page header
- **Logo block**: 32×32, `border-radius: 6px`,
  `linear-gradient(180deg, #00e5bf, #003d35)`,
  `box-shadow: 0 0 12px rgba(10,245,176,0.4)`, terminal icon in `#0a0f0d`.
- **Wordmark**: "CODEBREAKER", 14px Inter 700, letter-spacing 0.08em.
- **Version**: "v3.4.1", 12px Fira Code, 40% white.
- **Icon nav** (right, 36×36 IconButtons): `terminal`, `important_devices`,
  `storage`, **`psychology` (active — primary color)**, `apartment`, `router`,
  `public`, `share`. The `psychology` icon is the Neural Net's nav target.
- **Eyebrow** ("/home/operator/neural-net"): 11px/0.18em Fira Code 600 in
  `rgba(10,245,176,0.85)` with a 16px `psychology` icon prefix.
- **H1**: 38px Inter 700, line-height 1.1, letter-spacing -0.01em,
  color `rgba(255,255,255,0.96)`.
- **Sub**: 14px, `rgba(255,255,255,0.55)`, max-width 620px.
- **Status chips** (right, outlined):
  - `TRAINING` (accent) with pulsing live-dot — or `PAUSED` (default) with grey dot.
  - `<total> TOTAL PTS` (cyan) with `memory` icon.

### 2. Network Status card
Card chrome: `rgba(25,25,25,0.80)` with 6px backdrop-blur, 1px
`rgba(255,255,255,0.08)` border, 12px radius, 0 2px 12px rgba(0,0,0,0.6).
Header: cyan avatar with `hub` icon, title "Network Status", subheader
"MODEL TELEMETRY" (12px/0.04em, 55% white), action chip "LIVE"/"IDLE".

Rows (DefRow component, 10px vertical, bottom border `rgba(255,255,255,0.06)`):
| Icon | Label | Value |
|---|---|---|
| `memory` | Architecture | `5 × 8 × 8 × 6 × 4 MLP` |
| `developer_board` | Parameters | `442,368` |
| `bolt` | Optimizer | `AdamW (β=0.9)` |
| `model_training` | Ciphers trained | `<n> / 6` *(accent)* |
| `trending_up` | Avg. bonus | `+<x.x>%` *(accent)* |
| `military_tech` | Model level | `L<n>` *(accent)* |

Values use Fira Code 13px/500 (or 600 for non-mono). Accent values are
`#0af5b0`.

**Cumulative training meter** (below rows):
- Caption row: "Cumulative training" (left, 11px/0.14em, 55% white) /
  `<total> pts` (right, accent, Fira Code).
- 8px LinearProgress, accent, value =
  `min(100, log10(totalPts + 1) * 14)`.

### 3. Active Training card (hero)
Header avatar: accent, `auto_awesome` icon. Title "Active Training". Subheader
`TARGET · <CIPHER> · <BLOCK SIZE>` or `NO TARGET SELECTED`. Action: state
chip (`TRAINING`/`PAUSED`/`IDLE`) + IconButton `article` ("Logs").

#### 3a. Neural-net canvas (the "cool visual effect")
Wrapped in a relative div, 320px tall, 8px radius, 1px
`rgba(255,255,255,0.06)` border, `rgba(0,0,0,0.55)` background, inset shadow
`0 0 40px rgba(0,0,0,0.7)`.

Network geometry: **5 layers, sizes [5, 8, 8, 6, 4]**, fully connected
between adjacent layers (= 5·8 + 8·8 + 8·6 + 6·4 = 152 edges, 31 nodes).
Layers are spaced evenly horizontally across `padX = W * 0.08`; nodes in a
layer are spaced evenly vertically across `padY = H * 0.12`.

Per-frame render pipeline (each `requestAnimationFrame`, with delta-time `dt`):
1. Clear, paint `rgba(10,30,40,0.18)` fill, then a faint grid in
   `rgba(10,245,176,0.04)` (24-px or W/40 step, whichever larger).
2. Update node activations: target =
   `0.5 + 0.5 * sin(t * (active ? 1.8 : 0.4) - layer*0.7 + nodePhase)`,
   scaled by per-node jitter [0.5, 1.0]. Lerp activation toward target by
   0.12. When inactive, target collapses to 0.08.
3. **Edges**: each draws a base line in
   `rgba(10,245,176, 0.08 + weight*0.10)` (×0.4 when inactive). When active,
   each edge spawns pulses at rate `0.18 * weight * intensity` pulses/sec.
   Each pulse travels from a→b at speed [0.7, 1.6]/s. Pulse render: 4× radius
   radial gradient halo (white-green core to transparent), 3.5px solid head
   in `#9ffce0`.
4. **Scan sweep** (active only): vertical strip sweeping 0→1 over the inner
   width at 0.18/sec, painted as a 48-px-wide soft accent gradient.
5. **Nodes**: outer glow (radial gradient, only when activation > 0.3), ring
   in `rgba(10,245,176, 0.35 + a*0.6)` 1.5px lineWidth, fill blending toward
   accent at high activation, dim grey when inactive.
6. **Layer labels** ("INPUT", "H1", "H2", "H3", "OUTPUT") at the bottom in
   Fira Code, 42% white.
7. **Cipher caption** top-left: `> training: <cipher_lowercase>` in accent
   when active, 40% white when paused.

All sizes scale with canvas. DPR-aware: `canvas.width = cssW * dpr`.

#### 3b. HUD overlays (over canvas)
- **Top-right HUD** (absolute 12px from edge, `rgba(0,0,0,0.55)` panel, 1px
  accent border, 8px radius, 4px backdrop blur, 8/12px padding):
  - 2-column grid, Fira Code 11px:
    - `session` → `<formatted time>` in accent
    - `epoch` → `<floor(seconds/60)>` in white
    - `+pts/s` → `×1.05` (accent variant `#9ffce0`) or `—` when paused
- **Bottom strip** (absolute 12px from sides, flex gap 10):
  - 3 HudStats: `SESSION PTS` *(accent)*, `CURRENT BONUS` (`+x.x%`),
    `EPOCH` (`<epoch progress %>`).
  - Each HudStat: 8/10 padding, dark/transparent bg, label 9px/0.18em/60% white,
    value 16px Fira Code 700. Accent variant uses `#0af5b0` value +
    `text-shadow: 0 0 10px rgba(10,245,176,0.5)`.

#### 3c. Next-epoch bar
Below the canvas: caption row "Next epoch" / `<remaining>s` (accent),
6px LinearProgress at `epochProgress = (sessionSeconds % 60) / 60 * 100`,
accent when training, warn (`#ff9800`) when paused.

#### 3d. Controls row
3-column grid `1fr auto auto`, gap 10:
1. **Cipher Select** (MUI-style filled, accent bottom-border): placeholder
   "Select target cipher…", options are the 6 ciphers with meta `C<complexity>`.
2. **Pause / Resume** outlined button (color primary when paused, neutral
   when training), icon `pause`/`play_arrow`.
3. **Commit** contained primary button, icon `save`, disabled when
   sessionPts < 1.

### 4. Training Library card
Header: cyan avatar with `dataset` icon, title "Training Library", subheader
"ACCUMULATED PROGRESS PER CIPHER", action chip `<n>/6 TRAINED` (cyan outlined).

**Body** uses CardContent with `padding: 0`. Header row + one row per cipher,
sorted **descending by points**.

Column grid: `1.6fr 1.4fr 2fr 1fr 1.2fr 110px`, gap 12, 14/20 row padding,
bottom border `rgba(255,255,255,0.05)`.

Header row (10/20 padding, 10px/0.18em Fira Code 600, 50% white):
`Cipher  Points  Speed bonus  Sessions  Last trained  ⠀`

Row anatomy:
- **Active-row treatment**:
  `background: linear-gradient(90deg, rgba(10,245,176,0.10), transparent 70%)`
  plus a 3px accent rail at the left (`left:0; top/bottom:6; box-shadow: 0 0
  8px rgba(10,245,176,0.7)`).
- **Cipher cell**: 32px Avatar (accent if active, default otherwise) with
  `lock` icon, then name (14px/600 white) followed by a 6×6 live-dot if
  active, with sub-line "C<complexity> · <block>" in 11px Fira Code/45% white.
- **Points cell**: 14px Fira Code 600, accent if >0 else 40% white. Use the
  `fmtNum` helper for K / M / B suffixes.
- **Speed bonus cell**: caption row "+x.x%" (`#9ffce0` if bonus > 0 else 40%
  white) and percentage of max ("<%>") on the right, then a 4px bar at
  `fillPct = log10(pts+1) / log10(maxPts+1) * 100`. Active row's bar uses
  `linear-gradient(90deg, #0af5b0, #9ffce0)` with accent glow.
- **Sessions**: 12px Fira Code, 70% white.
- **Last trained**: 12px Fira Code, 55% white. Active row shows "now".
- **Actions** (right-aligned):
  - Active row: outlined `ACTIVE` chip (accent).
  - Other rows: outlined primary "Train" button with `swap_horiz` icon.
  - Then an IconButton with `restart_alt` (reset progress).

---

## Interactions & Behavior

### Tick
A 200ms interval increments `sessionSeconds` by `0.2 * speed` while
`active === true`. Pausing freezes the canvas pulses, scan sweep, and counter
(activations also collapse to a dim baseline).

### Switching cipher (`switchCipher(name)`)
If `name === currentCipher`: no-op. Otherwise:
1. If `sessionSeconds > 0`, **bank the in-flight session into the prior
   cipher's library entry**:
   - `library[prev].seconds += sessionSeconds`
   - `library[prev].sessions += 1`
   - `library[prev].lastTrained = "just now"`
2. Reset `sessionSeconds` to 0.
3. Set `currentCipher = name`.

This is the contract that "switching does not lose progress."

### Commit (`commitSession`)
Same banking effect as a switch, without changing the target. Disabled when
session points are below 1.

### Reset (`resetCipher(name)`)
Zero out `library[name]`. If `name === currentCipher`, also reset
`sessionSeconds`.

### Toggle play/pause
Flips `active`. No data is lost; only the tick stops.

### Train button (per row)
Calls `switchCipher(rowName)` — banks the current session, switches target.

---

## State Management

```ts
type LibraryEntry = {
  seconds: number;        // cumulative banked seconds of training
  sessions: number;       // number of completed sessions
  lastTrained: string;    // human-readable timestamp ("just now", "4h ago")
};

type NeuralNetState = {
  library: Record<CipherName, LibraryEntry>;
  currentCipher: CipherName;   // 'SHA-256' by default in mock
  active: boolean;             // true = training, false = paused
  sessionSeconds: number;      // uncommitted training time on current cipher
};
```

### Derived values
- `pointsAt(seconds) = floor(1.05 ^ (seconds / 5) - 1)`
- `bonusFromPoints(pts) = round1(log10(pts + 1) * 8)` → percent speed bonus
- `totalPts = sum of pointsAt(library[c].seconds + (c===current ? session : 0))`
- `modelLevel = floor(log2(totalPts + 1))`
- `epochProgress = (sessionSeconds % 60) / 60 * 100`  (1 epoch = 60s of training)

### Mock seed values (high-fi prototype)
| Cipher    | seconds | sessions | lastTrained |
|-----------|--------:|---------:|-------------|
| CRC-32    |    1200 |        4 | 4h ago      |
| MD5       |     900 |        3 | 1d ago      |
| SHA-1     |     660 |        2 | 2d ago      |
| SHA-256   |     380 |        2 | 5d ago      |
| AES-128   |     180 |        1 | 1w ago      |
| RSA-2048  |       0 |        0 | —           |

`currentCipher = 'SHA-256'`, `active = true`, `sessionSeconds = 42` (so the
session HUD has something non-zero on first render).

### Persistence
Persist `library`, `currentCipher`, and `active` between sessions. Persist
`sessionSeconds` if you want sessions to survive reloads — otherwise zero it
on boot (the user's banked progress is in the library either way).

---

## Cipher catalogue

| Name      | Complexity | Block   |
|-----------|-----------:|---------|
| CRC-32    |          1 | 64 KB   |
| MD5       |          2 | 128 KB  |
| SHA-1     |          4 | 256 KB  |
| SHA-256   |          8 | 512 KB  |
| AES-128   |         12 | 1.0 MB  |
| RSA-2048  |         24 | 2.0 MB  |

These match the Station page; keep them in a shared module.

---

## Design Tokens

### Colors
| Token | Hex / RGBA | Use |
|---|---|---|
| Accent (primary) | `#0af5b0` | active training, totals, positive values |
| Accent soft | `#9ffce0` | pulse heads, secondary accent text |
| Cyan | `#26c6da` | secondary chips, telemetry avatars |
| Warn | `#ff9800` | paused state |
| Error | `#f44336` | reset/destructive |
| Success | `#0af5b0` | banking confirmations |
| Surface (card) | `rgba(25,25,25,0.80)` | card background |
| Surface raised | `rgba(35,35,35,0.98)` | select dropdown |
| Bg base | `#0d1318` | page bg below image |
| Border subtle | `rgba(255,255,255,0.08)` | card border |
| Border faint | `rgba(255,255,255,0.06)` | row dividers |
| Text high | `rgba(255,255,255,0.96)` | H1 |
| Text default | `rgba(255,255,255,0.87)` | body |
| Text muted | `rgba(255,255,255,0.55)` | labels |
| Text faint | `rgba(255,255,255,0.45)` | sub-labels |
| Accent eyebrow | `rgba(10,245,176,0.85)` | eyebrow text |

### Typography
- **Body / UI**: Inter (300/400/500/600/700), -webkit-font-smoothing: antialiased.
- **Mono / telemetry**: Fira Code (400/500/600).
- **Icons**: Material Symbols Rounded.
- Scale:
  - H1 38/700, letter-spacing -0.01em
  - Card title 18/600
  - Subheader 12/500, letter-spacing 0.04em
  - Eyebrow 11/600, letter-spacing 0.18em, uppercase
  - Body 14/500
  - Caption 11–13 mono
  - HUD value 16 mono 700
  - Stat (XL) 22 mono 700

### Spacing
4/8/10/12/14/16/20/24/32 scale (not a strict step system; values pulled
ad-hoc in the prototype — match what's specified per-component above).

### Radii
- Cards: 12px
- Inner panels / HUDs / progress bars: 6–8px
- Pills / chips: 9999px
- Buttons: 8px

### Shadows / glows
- Card: `0 2px 12px rgba(0,0,0,0.6)`
- Card raised: `0 4px 24px rgba(0,0,0,0.7)`
- Accent glow: `0 0 8–12px rgba(10,245,176,0.4–0.7)`
- Live dot: `0 0 6px #0af5b0` + pulse keyframes (1.6s ease-in-out infinite)

### Animations
- `statusPulse` 1.6s — live indicator dots
- `scanX` 1.6s linear infinite — progress-bar shimmer
- `neuralEdge` (optional) — card edge pulse on training
- Canvas RAF loop — see §3a

---

## Assets
- `neuralNet_bg.png` — fullscreen circuit-board / neural-mesh background.
  Apply with `linear-gradient(rgba(8,14,18,0.78), rgba(8,14,18,0.85))` overlay
  and `background-attachment: fixed`.
- All icons are Material Symbols Rounded (filled variant via `FILL,GRAD@24,400,0,0`).
- No bitmap icons — everything else is Material Symbols or canvas-drawn.

---

## Files in this bundle

| File | Purpose |
|---|---|
| `Neural Net.html` | Entry-point HTML — sets up React/Babel, fonts, global CSS, and mounts the page |
| `neuralnet-page.jsx` | Page composition, state hook (`useNeuralNet`), Active Training card, Training Library, Network Status, page header, tweaks |
| `neuralnet-net-canvas.jsx` | The neural-net canvas component (`NeuralNetCanvas`) — pulses, sweep, nodes, glow |
| `station-mui.jsx` | MUI-style primitives (`MuiCard`, `MuiButton`, `MuiChip`, `MuiSelect`, `MuiLinearProgress`, etc.). Shared across pages. |
| `tweaks-panel.jsx` | The Tweaks panel host (you can ignore this in production — it's only for design exploration) |
| `neuralNet_bg.png` | Background image asset |
| `_reference_Station v2.html` | Reference Station page in the same visual system — use to align typography, chrome, and grid behavior |

---

## Implementation tips

1. **Build the canvas first.** It carries the page's identity. Match the
   layered network and the pulse rendering before chrome.
2. **Compose with the codebase's existing card/button library** — the
   `station-mui.jsx` primitives are just there because the design system is
   delivered as HTML; they aren't prescriptive about implementation.
3. **The exponential math is deliberate.** Don't switch to a linear
   accumulation — the design relies on long-trained ciphers feeling
   meaningfully heavier than fresh ones (logarithmic bonus + base-1.05^t
   points produces the right curve over a play session).
4. **Banking on switch is the key data invariant.** Cover it with a test:
   switching from A → B mid-session must increase A's stored seconds by
   exactly the session length and zero the session.
5. **Pause must freeze the canvas.** Stop spawning pulses, stop the scan
   sweep, dim node activations. Don't unmount the canvas — node positions
   should persist.
