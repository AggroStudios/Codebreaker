# Handoff: Prestige Page

## Overview

The Prestige page is a new top-level route in **Codebreaker** (AGGRO Studios' browser-based idle/incremental hacking game). It serves three purposes:

1. **Explain the prestige mechanism** — what the player keeps and what resets on a hard reset.
2. **Surface the player's progress toward eligibility** — current operator level vs. requirement, and XP banked toward the next Prestige Point (PP).
3. **Let the player spend Prestige Points** on a draggable / zoomable skill tree that persists across all future prestige cycles.

It is implemented in the existing Codebreaker codebase (React + TypeScript + Vite + MUI v6 dark theme) as a sibling route to **Station**, **Servers**, **Neural Net**, **Perm Upgrades**, etc. The existing AppBar and NavMenu already reserve a `SettingsBackupRestoreTwoTone` slot for "Prestige" — this delivery fills it.

## About the Design Files

The files in this bundle are **design references created in HTML** — a working prototype that demonstrates the intended look, structure, and behavior. They are **not** production code and **not** intended to be dropped into the codebase as-is.

The task is to **recreate this design inside the existing Codebreaker codebase** (React + TypeScript + Vite + MUI v6 dark theme), using its existing patterns, components, and state-management conventions. Use the HTML/JSX in this bundle as a visual and behavioral spec — not a literal source.

To preview the design, open `Prestige.html` directly in a browser. All four .jsx files are loaded via Babel from the HTML; no build step is required to view.

## Fidelity

**High-fidelity (hifi).** This is a pixel-fidelity mockup of the final layout, typography, spacing, color, and interaction. All visual values (hex codes, font sizes, spacing, radii, shadows, easing) match the existing Codebreaker design system documented in the repo's `README.md` / `colors_and_type.css`. The MUI primitives used in the prototype (`MuiCard`, `MuiCardHeader`, `MuiCardContent`, `MuiCardActions`, `MuiButton`, `MuiIconButton`, `MuiChip`, `MuiLinearProgress`, `MuiAvatar`, `MuiDefRow`) are hand-rolled mirrors of the real MUI dark theme defaults — in the production implementation, use the **actual** `@mui/material` components, not these mirrors.

The skill tree node/edge styling and the pan/zoom controller logic should be ported faithfully (1:1 visuals, identical interaction model).

---

## Screens / Views

There is **one screen**: `/prestige`. Page width: `max-width: 1600px`, centered. Page padding: `32px 40px 80px` (comfortable) or `20px 24px 80px` (compact).

The screen consists of five vertically stacked regions:

### 1. Brand Strip (shared chrome)
Already implemented elsewhere — match the strip used by the Station v2 page (CODEBREAKER wordmark + version + icon nav with `settings_backup_restore` set to primary color). Reuse the existing AppBar / NavMenu in the real codebase; this is shown in the prototype only for context.

### 2. Page Header
- **Eyebrow** (Fira Code, 11px, 600 weight, `0.18em` letter-spacing, uppercase, color `rgba(10,245,176,0.85)`): `[settings_backup_restore icon] /home/operator/prestige`
- **Title**: `Prestige` — Inter, 38px, 700, line-height 1.1, `-0.01em` letter-spacing, color `rgba(255,255,255,0.96)`
- **Subtitle** (14px, `rgba(255,255,255,0.55)`, max-width 620px):
  > "Hard-reset the run to bank permanent Prestige Points and reshape your operator's skill tree. Each cycle compounds. Spend wisely — points refund any time."
- **Right side**: three MUI Chips (outlined):
  1. `ARMED` (accent, with live-dot) **or** `LOCKED` (warn, with non-pulsing orange dot) — depending on whether the operator meets the level requirement.
  2. `LEVEL {n} / {requirement}` (default, `military_tech` icon)
  3. `{n} PP AVAIL` (cyan, `diamond` icon)

### 3. Top Row — Two-card grid
`grid-template-columns: minmax(320px, 1fr) minmax(0, 1.6fr)`, `gap: 20px`.

#### 3a. Prestige Status card (left)
Standard MUI Card. Header: cyan avatar with `settings_backup_restore` icon, title "Prestige Status", subheader "OPERATOR PROFILE".

Body: a stack of `MuiDefRow` definition rows (label-on-left, monospace-value-on-right), with these rows in order:

| Icon | Label | Value | Accent when |
|---|---|---|---|
| `military_tech` | Operator level | `{level} / {requirement}` | level ≥ requirement |
| `diamond` | Points available | `{n}` | n > 0 |
| `check_circle` | Points spent | `{n}` | — |
| `hub` | Skills allocated | `{n} / 20` | — |
| `loop` | Lifetime prestiges | `{n}` | n > 0 |
| `bolt` | XP / point | `{xpPerPoint} XP` (formatted with thousands separator) | — |

Below the def rows, two stacked `MuiLinearProgress` bars:
- "Level requirement" — `accent` when at-cap, `warn` when below. Format the % on the right in Fira Code, accent or warn color.
- "PP #{N} progress" — cyan-colored bar. Right label shows `{xpRemaining} XP TO GO`.

#### 3b. Mechanism Explainer card (right)
Header: accent avatar with `auto_awesome_motion` icon, title "The Prestige Mechanism", subheader "WHAT YOU GAIN · WHAT RESETS". Header action chip: `READY` (accent + live-dot) or `NEED L{req}` (warn).

Body sections, in order:

1. **Keep/Reset grid** — 2-column, 10px gap. Each column is a panel:
   - **You keep** — `#0af5b0` (accent) titled panel, 1px border at 33% opacity of accent. Bulleted list items, each with a 6×6 dot in accent color and an accent glow.
     - All Prestige Points and allocated skills
     - Permanent upgrades (Perm Upgrades)
     - Neural Net training points
     - Statistics & lifetime totals
   - **You reset** — `#ff7676` (red-pink) titled panel, same shape, red bullets.
     - Operator level → 1
     - Servers, racks, data centers, networks
     - Cash on hand → $0.00
     - Active cipher queue

2. **"How points are minted" callout** — accent-tinted panel (linear-gradient from `rgba(10,245,176,0.10)` to `rgba(38,198,218,0.05)`, 1px border `rgba(10,245,176,0.22)`).
   - Title (Fira Code, accent, uppercase): "How points are minted" with leading `info` icon.
   - Body copy (13px, `rgba(255,255,255,0.75)`, line-height 1.55):
     > Reach **Operator Level {requirement}** to unlock the Prestige action. For every **{xpPerPoint} XP** banked across your career, one extra Prestige Point is minted. Spend points on the skill tree below — they remain across all future prestiges, and can be refunded at any time.

3. **Prestige CTA button** — full-width, 14px 18px padding, border-radius 10px.
   - **When armed** (`canPrestige === true`): gradient background `linear-gradient(90deg, #0af5b0, #26c6da)` (hover: `#3afac3` → `#9ffce0`), text color `#04221a`, box-shadow `0 8px 24px rgba(10,245,176,0.25)`, AND a pulsing ring animation (`armed-ring` keyframes, 1.8s ease-in-out infinite — see Animation section).
   - **When locked**: bg `rgba(255,255,255,0.05)`, text `rgba(255,255,255,0.4)`, cursor not-allowed, no animation.
   - **Left side**: `settings_backup_restore` icon (22px) + label "Initiate Prestige" / "Locked — Reach Level {req}". Letter-spacing `0.18em`, uppercase, 700.
   - **Right side**: a small chip showing `+{n} PP` (when armed) or `{level} / {req}` (when locked). Chip bg `rgba(4,34,26,0.20)` when armed.

### 4. Skill Tree card
MUI Card with overflow hidden. Header: accent avatar `account_tree` icon, title "Prestige Skill Tree", subheader "DRAG · ZOOM · ALLOCATE". Header action: `{n} AVAIL` (cyan chip), `{n} SPENT` (accent chip), and a `MuiIconButton` titled "Refund all" with `undo` icon.

Body: 680px tall canvas region (`background: rgba(0,0,0,0.30)`) containing the interactive skill tree (see **Skill Tree Component** section below).

Footer: thin row of branch legend chips + a right-aligned hint "★ CAPSTONE — one per branch, 6 PT". Each legend item is a 10×10 colored dot (boxShadow `0 0 6px {color}aa`) + Fira Code label.

### 5. Tweaks Panel
Floating tweaks panel (existing pattern — uses `TweaksPanel` / `useTweaks` from the design system). Surfaces:
- **Layout**: density (Comfortable / Compact), scanlines toggle
- **Mechanism (to be tuned later)**: `levelRequirement` slider (10–150, step 5, default 50), `xpPerPoint` slider (1000–100000, step 1000, default 25000)
- **Simulation**: sim speed slider (0–5, step 0.1, default 1) — for the prototype only; can be omitted from the production page.

---

## Skill Tree Component

This is the centerpiece. It is a draggable, zoomable canvas of 21 skill nodes arranged radially from a central "Genesis" root, with 4 branches: **Throughput** (north, cyan), **Wealth** (east, accent-green), **Automation** (south, purple), **Recon** (west, orange).

### World coordinates
The tree is laid out in a **virtual world** of 1600×1200 px. A `transform: translate(x, y) scale(z)` is applied to a `position: absolute` inner div containing all nodes and the SVG edge layer.

### Pan & zoom controller
| Input | Action |
|---|---|
| Mouse drag on empty space | Pan (capture `mousedown` only when `e.target.closest('[data-node]')` is null) |
| Mouse wheel | Zoom centered on cursor. Factor: `1.12` per tick. Zoom range: `0.3` to `2.4`. |
| 1-finger touch drag | Pan |
| 2-finger pinch | Zoom (zoom level scales by `currentDistance / initialDistance` relative to pinch-start zoom) |
| Resize | Re-fit (see fit-to-screen below) |

**Fit-to-screen** on mount + on container resize (use `ResizeObserver`):
```
z = min(containerW / WORLD_W, containerH / WORLD_H) * 0.92
x = (containerW - WORLD_W * z) / 2
y = (containerH - WORLD_H * z) / 2
```

**Zoom around cursor** math (when wheel):
```
factor = wheelUp ? 1.12 : 1/1.12
z' = clamp(z * factor, 0.3, 2.4)
k = z' / z
x' = mouseX - (mouseX - x) * k
y' = mouseY - (mouseY - y) * k
```

### Floating overlays (NOT scaled — fixed to container)
- **Node Inspector** — top-left, 280–300px wide. Sticky empty state when nothing is hovered. On hover: branch-tinted card showing icon + branch label + skill name + short tagline + description + cost / status mini-stats + Allocate / Refund button. Detailed styling: see "Node Inspector" section below.
- **Zoom controls** — bottom-right. Vertical stack of 3 icon buttons: `add` (zoom in 1.2×), `remove` (zoom out 1/1.2×), `filter_center_focus` (recenter / fit-to-screen). Below that, a `ZOOM {pct}%` readout (Fira Code 10px, `rgba(255,255,255,0.5)`, `0.1em` letter-spacing). Both have `rgba(10,16,20,0.85)` backdrop, 1px subtle border, 8px radius, 4px padding.
- **Hint strip** — bottom-left, single line: `DRAG TO PAN · SCROLL TO ZOOM · CLICK TO ALLOCATE` (Fira Code 10px, `rgba(255,255,255,0.45)`, uppercase, `0.14em` letter-spacing).

### Background
Two layers:
1. Static radial gradient on the container: `radial-gradient(circle at 50% 50%, rgba(10,245,176,0.06), transparent 55%)` over `radial-gradient(circle at 50% 50%, rgba(0,0,0,0.65), rgba(0,0,0,0.85))`.
2. Dot grid that pans with the world (NOT scaled): 40px×40px grid of 1px dots (`radial-gradient(circle at 1px 1px, rgba(255,255,255,0.10) 1px, transparent 1px)`), with `background-size = 40px * z` and `background-position` offset to give the impression the grid moves with the world.

### Branch sector labels
Inside the scaled world, four text labels mark each cardinal:
- `THROUGHPUT` @ (800, 30) — cyan `#26c6da`
- `WEALTH` @ (1410, 600) — accent `#0af5b0`
- `AUTOMATION` @ (800, 1170) — purple `#b39ddb`
- `RECON` @ (190, 600) — orange `#ff9800`

Font: Fira Code, 600, 14px, `0.3em` letter-spacing, `text-shadow: 0 0 12px {color}80`, opacity 0.85.

### Edges (connections)
Drawn as SVG `<line>` elements in a full-world SVG layer behind the nodes. For each skill, iterate over its `requires[]` and draw a line from each requirement node's `(x, y)` to the skill's `(x, y)`.

Edge style depends on state:
- **Both allocated**: solid-feel branch color, 3px wide, `stroke-dasharray: 6 6`, animated dash flow (`edge-active` class, `animation: edgeFlow 1.6s linear infinite` — keyframes: `to { stroke-dashoffset: -24 }`), drop-shadow glow `0 0 6px {color}aa`.
- **Only origin allocated** (reachable): branch color at `88` alpha, 2px, `stroke-dasharray: 4 6`, no animation.
- **Neither allocated** (locked): `rgba(255,255,255,0.12)`, 2px, `stroke-dasharray: 2 6`.

There is also a single `<circle cx="800" cy="600" r="240">` filled with a `radialGradient` (accent `0.45` → `0.06` → `0`) sitting behind everything else — the "core glow".

### Skill Nodes

| State | Visual |
|---|---|
| `allocated` | Solid branch-color border, radial inner glow in branch color (`radial-gradient(circle at 50% 35%, {col}33, {col}10 70%)`), box-shadow `0 0 20px {col}55, 0 0 38px {col}28`. Cost badge replaced with `✓`. |
| `available` (prereqs met, can afford, can be clicked) | Solid 2px branch border, `boxShadow: 0 0 12px {col}30`. Pulses (`node-ready` class, `transform: scale(1.06)` at 50%, 1.8s ease-in-out infinite). |
| `unaffordable` (prereqs met, not enough PP) | Dashed branch border at `80` alpha, no glow. Cost badge in branch color at `aa` alpha. |
| `locked` (prereqs not met) | Dashed `rgba(255,255,255,0.18)` border, dim background `rgba(14,18,22,0.85)`, text at `rgba(255,255,255,0.32)`. cursor: not-allowed. |

**Sizes** (square, centered on `(x, y)`):
- Root (`genesis`): 96px, border-radius 24px (square-ish corners)
- Capstone: 82px, border-radius 20px (square-ish corners)
- Regular: 68px, border-radius 50% (circle)

**Inner layout** (flex column, centered):
- Material Symbol icon (root 36px, capstone 30px, regular 26px)
- Skill name below it (Fira Code, root 10px / others 9px, 700 weight, uppercase, `0.08em` letter-spacing, line-height 1.1, max-width = size - 8)

**Cost badge** (non-root only): pill at bottom-right corner `(-8, -8)`. 22px min-width, 22px height, 11px radius. Background `rgba(10,16,20,0.95)` (or branch color if allocated). Border `{col}66` (or solid `{col}` if allocated). Contains either the cost number (Fira Code 11px 700) or a `✓` glyph (when allocated, on a `{col}` background with `0 0 8px {col}` glow).

**Capstone notch** (capstone only): label at top, centered, `(-10, 50%)`. Text "★ CAPSTONE" (Fira Code 9px, `0.2em` letter-spacing, branch color, dark bg with branch-color border, 3px radius).

**Click behavior**:
- Plain click → `allocate(skill)` (no-op if `status !== 'available'`)
- Shift-click OR Alt-click OR Right-click (contextmenu) → `refund(skill)`

### Node Inspector overlay

Top-left, 280–300px wide, dark frosted card with branch-tinted header bar.

**Empty state** (nothing hovered):
- Eyebrow: `NODE INSPECTOR` (Fira Code 10px, accent, `0.18em`)
- Body (12px, `rgba(255,255,255,0.55)`): "Hover a skill to inspect it. Click to allocate. Shift-click (or right-click) to refund."

**Hover state**:
- **Header strip** (10px 14px padding): linear-gradient `${col}22 → transparent`, 1px bottom border `${col}44`. Contains:
  - 36×36 icon tile (`${col}1f` bg, `${col}66` border, branch-color icon)
  - Branch label (Fira Code 9px `0.2em` uppercase branch color) — e.g. `THROUGHPUT` or `THROUGHPUT · CAPSTONE`
  - Skill name (14px, 700, `rgba(255,255,255,0.95)`)
- **Body** (12px 14px padding):
  - Short tagline (Fira Code 10px, branch color, `0.12em` letter-spacing)
  - Description paragraph (13px, `rgba(255,255,255,0.75)`, line-height 1.5)
  - 2-column mini-stat grid: COST and STATUS. Stat panels: `rgba(255,255,255,0.04)` bg, 1px `rgba(255,255,255,0.06)` border, 6px radius, 8px 10px padding. Label = 9px 600 `0.18em` uppercase `rgba(255,255,255,0.5)`. Value = Fira Code 13px 700 branch color.
  - Action button (full-width, small size): "Allocate" (primary contained, `add` icon, disabled unless `status === 'available'`) **or** "Refund" (neutral outlined, `undo` icon) when allocated.

### Skill Catalog (the actual data)

21 skills total. Branch coordinates form a radial pattern around the root at (800, 600).

```js
const BRANCHES = {
  root: { color: '#0af5b0', label: 'CORE'        },
  N:    { color: '#26c6da', label: 'THROUGHPUT'  },
  E:    { color: '#0af5b0', label: 'WEALTH'      },
  S:    { color: '#b39ddb', label: 'AUTOMATION' },
  W:    { color: '#ff9800', label: 'RECON'       },
};
```

| id | branch | x, y | cost | name | icon | short | requires | desc |
|---|---|---|---|---|---|---|---|---|
| `genesis` | root | 800, 600 | 0 | Genesis | `autorenew` | CORE | — | Every prestige cycle awards this node automatically. Anchor for all skill paths. |
| `n1` | N | 800, 460 | 1 | Quick Break | `bolt` | +10% CIPHER SPEED | `[genesis]` | Permanently accelerate every cipher break by 10%. |
| `n2` | N | 680, 320 | 2 | Parallel Streams | `splitscreen` | +1 CONCURRENT | `[n1]` | Unlocks one additional cipher slot on the Station. |
| `n3` | N | 920, 320 | 2 | Burst Mode | `flash_on` | 5× ON FIRST BREAK | `[n1]` | The first cipher each session runs at 5× speed. |
| `n4` | N | 800, 200 | 4 | Quantum Pipelines | `rocket_launch` | +20% SPEED | `[n2, n3]` | Compounds with Quick Break for total +30% throughput. |
| `n5` | N (capstone) | 800, 70 | 6 | Singularity | `all_inclusive` | CAPSTONE — NEVER FAIL | `[n4]` | Ciphers can no longer fail. Cancellation refunds full payout. |
| `e1` | E | 940, 600 | 1 | Compound Returns | `trending_up` | +15% PAYOUT | `[genesis]` | All cipher payouts increased by 15%. |
| `e2` | E | 1080, 480 | 2 | Risk Tolerance | `verified` | +50% ON RSA-2048 | `[e1]` | The hardest ciphers pay out an extra 50%. |
| `e3` | E | 1080, 720 | 2 | Insider Trading | `attach_money` | 2× XP / FIRST HOUR | `[e1]` | Double XP for the first hour of every session. |
| `e4` | E | 1200, 600 | 4 | Black Swan | `casino` | RANDOM JACKPOTS | `[e2, e3]` | 1% chance of a 100× payout on any cipher break. |
| `e5` | E (capstone) | 1330, 600 | 6 | Midas Protocol | `workspace_premium` | CAPSTONE — 2× ALL | `[e4]` | All cipher payouts permanently doubled. |
| `s1` | S | 800, 740 | 1 | Auto-Restart | `restart_alt` | AUTO-QUEUE | `[genesis]` | Completed ciphers automatically restart with the same target. |
| `s2` | S | 680, 880 | 2 | Daemon | `computer` | OFFLINE EARNINGS | `[s1]` | Continues earning at 50% rate while the tab is closed. |
| `s3` | S | 920, 880 | 2 | Smart Queue | `auto_fix_high` | OPTIMAL CIPHER | `[s1]` | Auto-Restart picks the highest-EV cipher available. |
| `s4` | S | 800, 1000 | 4 | Hivemind | `hub` | +100% OFFLINE | `[s2, s3]` | Offline earnings rate raised to 100% of online rate. |
| `s5` | S (capstone) | 800, 1130 | 6 | Ghost in the Machine | `smart_toy` | CAPSTONE — FULL AUTO | `[s4]` | Full autoplay: purchases, upgrades, and prestige decisions can be automated. |
| `w1` | W | 660, 600 | 1 | Recon | `visibility` | EARLY DARK WEB | `[genesis]` | Reveals one additional dark-web cipher per cycle. |
| `w2` | W | 520, 480 | 2 | Mapper | `explore` | SEE HIDDEN NODES | `[w1]` | Reveals hidden upgrades and unlocks in advance. |
| `w3` | W | 520, 720 | 2 | Backdoor | `vpn_key` | -1 LVL REQ | `[w1]` | Reduces prestige level requirement by 1 every cycle. |
| `w4` | W | 400, 600 | 4 | Stealth | `shield` | NO DETECTION | `[w2, w3]` | Threat events ignored. No detection penalties on dark web ops. |
| `w5` | W (capstone) | 270, 600 | 6 | Phantom Override | `remove_red_eye` | CAPSTONE — GHOST OP | `[w4]` | Bypass any access gate. Instantly complete one cipher per cycle. |

**Total tree cost if you allocate everything**: `4 × (1+2+2+4+6) = 60 PP`.

---

## Interactions & Behavior

### Allocate a skill
- Preconditions: `!allocated[skill.id]` AND all `requires[]` are allocated AND `cost <= available`.
- Effect: set `allocated[skill.id] = true`. `availablePoints` decreases by `skill.cost`. Edges adjacent to the node and any newly-eligible neighbors should re-render (state-driven).

### Refund a skill
- Preconditions: `allocated[skill.id]` AND `skill.id !== 'genesis'`.
- Effect: set `allocated[skill.id] = false`, then **cascade refund** — walk the graph and unset any descendant skill that no longer has all its prereqs allocated. Repeat until stable. All refunded points return to `availablePoints`.
- Triggers: shift-click, alt-click, right-click on a node; or "Refund" button in the inspector; or the "Refund all" header icon button on the card (which resets to `{ genesis: true }`).

### Initiate Prestige
- Precondition: operator level ≥ requirement.
- Effect: hard-reset of the run state (operator level → 1, cash → $0, server/rack/center/network purchases reset, active cipher queue cleared). PP balance, allocated skills, Perm Upgrades, Neural Net points, statistics, and lifetime totals are **preserved**. `lifetimePrestiges` increments by 1.
- The HTML prototype simulates this with a `setLifetimePrestiges(n+1); setLevel(1)` call. In the real codebase, wire to the existing prestige reset reducer/saga.

### Hover
- Hovering a node updates the inspector. No tooltips needed on the nodes themselves (the inspector covers it).
- Edges do not need hover affordance.

### Animations & transitions

All easing matches existing MUI default: `225ms cubic-bezier(0, 0, 0.2, 1)` for most state changes.

| Element | Animation |
|---|---|
| Available skill node | `nodeReadyPulse` — `transform: scale(1) → 1.06 → 1`, 1.8s ease-in-out infinite |
| Active edge (both endpoints allocated) | `edgeFlow` — `stroke-dashoffset: 0 → -24`, 1.6s linear infinite |
| Armed Prestige CTA | `armedRing` — outer box-shadow ring expands `0 → 10px` while inner glow oscillates, 1.8s ease-in-out infinite |
| Live status dots (existing pattern) | `statusPulse` — 1.6s ease-in-out infinite (already in the design system) |
| Scanlines overlay (existing pattern) | Static `repeating-linear-gradient` overlay; toggleable |

Keyframes (canonical):

```css
@keyframes nodeReadyPulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.06); }
}
@keyframes edgeFlow {
  to { stroke-dashoffset: -24; }
}
@keyframes armedRing {
  0%, 100% { box-shadow: 0 0 0 0 rgba(10,245,176,0.5), 0 0 18px rgba(10,245,176,0.35) inset; }
  50%      { box-shadow: 0 0 0 10px rgba(10,245,176,0), 0 0 24px rgba(10,245,176,0.55) inset; }
}
```

---

## State Management

The prototype keeps everything in local React state via a `usePrestige` hook. In the production codebase, these likely map onto the existing Redux / Zustand / Context store. Required state:

| Field | Type | Source |
|---|---|---|
| `level` | number | Existing operator level — already tracked in game state |
| `xp` | number | Career XP — already tracked |
| `lifetimePrestiges` | number | Already tracked or to be added |
| `allocated` | `Record<SkillId, boolean>` | **New** — persist alongside save data |
| `levelRequirement` | number | Game config (currently set to 50, will be tuned) |
| `xpPerPoint` | number | Game config (currently set to 25,000, will be tuned) |

Derived selectors:

| Field | Formula |
|---|---|
| `mintedFromXp` | `Math.floor(xp / xpPerPoint)` |
| `baseStipend` | `5 + lifetimePrestiges * 2` (prototype value — confirm with design) |
| `totalEarnedPP` | `mintedFromXp + baseStipend` |
| `totalSpentPP` | `Σ skill.cost where allocated[skill.id]` |
| `availablePP` | `max(0, totalEarnedPP - totalSpentPP)` |
| `canPrestige` | `floor(level) >= levelRequirement` |

**Persistence note**: `allocated` MUST be preserved across the prestige reset action — it is the whole point of the system.

**Skill effect application**: each allocated skill's gameplay effect (e.g. `n1` → "+10% cipher speed") must be applied as a permanent global multiplier/flag. The actual numeric balance is **out of scope** for this design handoff; the catalog above is the design intent for each node but final balance numbers should be confirmed by the game-design owner before shipping.

---

## Design Tokens

All values mirror the existing Codebreaker design system (see repo `README.md` § "Visual Foundations" and `colors_and_type.css`). Listed here only for Prestige-specific values that aren't already tokens.

### Branch colors
```
Root / Wealth: #0af5b0   (accent — existing token)
Throughput:    #26c6da   (cyan — existing token)
Automation:    #b39ddb   (purple — new; add to palette)
Recon:         #ff9800   (warn — existing token)
Bullet-bad:    #ff7676   (reset/loss — new; or reuse #f44336 error)
```

### Surfaces
```
Tree canvas bg:    rgba(0, 0, 0, 0.30)
Tree core glow:    radial-gradient at center, accent 0.45 → 0.06 → 0, r=240 in world coords
Overlay panel bg:  rgba(10, 16, 20, 0.85)  (with backdrop-filter: blur(6px))
Mini-stat bg:      rgba(255, 255, 255, 0.04)
Mini-stat border:  rgba(255, 255, 255, 0.06)
```

### Skill node sizes
```
Root:     96 × 96 px, radius 24 px
Capstone: 82 × 82 px, radius 20 px
Regular:  68 × 68 px, radius 50%
Cost badge: ≥22 × 22 px pill, offset (-8, -8) from bottom-right
```

### Pan/zoom
```
World:     1600 × 1200 px
Zoom min:  0.30
Zoom max:  2.40
Wheel step: 1.12 (zoom in) / 1/1.12 (zoom out)
Fit pad:   0.92 (use 92% of available container space)
```

### Typography
All uses the existing tokens — Inter for UI, Fira Code for monospace meta. No new font sizes.

---

## Assets

Only one image asset is used: `neuralNet_bg.png`, the existing background photo from `ui_kits/codebreaker/`. This is bundled into the handoff folder for reference, but in production, just reuse the existing asset. Apply the same overlay treatment as the Neural Net page:

```css
background:
  linear-gradient(rgba(8,14,18,0.82), rgba(8,14,18,0.88)),
  url('./neuralNet_bg.png');
background-size: cover;
background-position: center;
background-attachment: fixed;
```

All icons are **Material Symbols Rounded** (used in the prototype) — in the production codebase, swap each one for its `@mui/icons-material` **TwoTone** equivalent to match the rest of the app:

| Prototype symbol | MUI TwoTone equivalent |
|---|---|
| `settings_backup_restore` | `SettingsBackupRestoreTwoTone` |
| `auto_awesome_motion` | `AutoAwesomeMotionTwoTone` |
| `account_tree` | `AccountTreeTwoTone` |
| `diamond` | `DiamondTwoTone` |
| `military_tech` | `MilitaryTechTwoTone` |
| `autorenew` | `AutorenewTwoTone` |
| `bolt` | `BoltTwoTone` |
| `splitscreen` | `SplitscreenTwoTone` |
| `flash_on` | `FlashOnTwoTone` |
| `rocket_launch` | `RocketLaunchTwoTone` |
| `all_inclusive` | `AllInclusiveTwoTone` |
| `trending_up` | `TrendingUpTwoTone` |
| `verified` | `VerifiedTwoTone` |
| `attach_money` | `AttachMoneyTwoTone` |
| `casino` | `CasinoTwoTone` |
| `workspace_premium` | `WorkspacePremiumTwoTone` |
| `restart_alt` | `RestartAltTwoTone` |
| `computer` | `ComputerTwoTone` |
| `auto_fix_high` | `AutoFixHighTwoTone` |
| `hub` | `HubTwoTone` |
| `smart_toy` | `SmartToyTwoTone` |
| `visibility` | `VisibilityTwoTone` |
| `explore` | `ExploreTwoTone` |
| `vpn_key` | `VpnKeyTwoTone` |
| `shield` | `ShieldTwoTone` |
| `remove_red_eye` | `RemoveRedEyeTwoTone` |

---

## Files

The bundle contains:

| File | Role |
|---|---|
| `README.md` | This document. |
| `Prestige.html` | Open in a browser to preview the design. Provides scene background, fonts, scanline overlay, and loads the four .jsx files via Babel. |
| `prestige-page.jsx` | Page-level React composition: brand strip, header, top-row two-card grid, skill tree card, tweaks panel. Includes the `usePrestige` state hook with derived selectors. |
| `prestige-tree.jsx` | The interactive skill tree component: `PrestigeSkillTree`, `SkillNode`, `NodeInspector`, `BackgroundGrid`, `BranchLabels`, the `SKILLS` data, and the pan/zoom controller. |
| `station-mui.jsx` | Hand-rolled MUI primitives used by the prototype (`MuiCard`, `MuiButton`, `MuiChip`, `MuiLinearProgress`, `MuiAvatar`, `MuiDefRow`, etc.). **In production, use the real `@mui/material` components instead.** |
| `tweaks-panel.jsx` | The existing TweaksPanel design-system component, included so the prototype runs standalone. Not needed in production unless you want the in-page tuning controls. |
| `neuralNet_bg.png` | Background photo reused from the Neural Net page. |

---

## Open questions for the implementer / game designer

1. **Final balance numbers** — the costs (1/2/4/6 PP) and gameplay effects in the catalog are design intent. Confirm with the game-design owner before shipping.
2. **Confirmation modal on Initiate Prestige** — the design currently jumps straight from the CTA into the reset. Consider adding a confirm dialog with a summary of "you will gain N PP" and "you will lose X servers, Y data centers, $Z cash" before committing.
3. **Refund cost** — the prototype refunds at 100% with no penalty. Confirm whether the production design wants a cooldown, partial refund, or a "free first refund per prestige cycle" rule.
4. **Per-skill effect plumbing** — each allocated skill needs a hook into the existing systems (cipher speed multiplier, payout multiplier, offline-earnings, etc.). Several of these (e.g. `s2` Daemon offline-earnings, `s5` Ghost in the Machine full autoplay) are substantial features in their own right and may need their own design pass.

