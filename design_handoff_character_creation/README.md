# Handoff: Character Creation Flow

A three-step onboarding flow that runs before `/station` on a fresh save: pick one of three hacker classes, forge an identity (callsign / avatar / origin / home base), then read a briefing and deploy. Includes a deep-dive **Profile Dossier modal** opened from the class cards.

---

## 1. About the design files

The files in `design/` are **HTML prototypes** built as React + inline Babel for a sandboxed preview environment. They are **reference material — not production code to drop in**. Your job is to recreate them in the existing Codebreaker codebase using its established patterns:

- React 19 + TypeScript + Vite
- MUI v9 (`@mui/material`, `@mui/icons-material`) with the `darkTheme` from `src/theme.ts`
- Zustand stores in `src/stores/`, persisted via `zustand/middleware`
- `react-router` v7 routes registered in `src/App.tsx`, lazy-loaded
- Page folders at `src/pages/<Name>/{index.tsx, style.scss}` (SCSS for layout, MUI `sx`/styled for components)
- `PageHeader` from `src/components/common/PageHeader`
- Material Symbols Rounded icons (already loaded by index.html via Google Fonts)
- Fira Code monospace + Inter UI font (already in `colors_and_type.css` / app shell)

Match those conventions — don't import Babel, don't replicate the `station-mui.jsx` hand-rolled primitives. Use real MUI components (`<Card>`, `<Button>`, `<Chip>`, `<LinearProgress>`, `<Dialog>`, `<TextField>`).

---

## 2. Fidelity

**High-fidelity.** Exact hex values, spacings, type sizes, animations, and copy in the prototype are the spec. Recreate pixel-perfectly using MUI primitives styled to match. The accent-tinted backdrops, segmented stat bars, terminal panel, dossier portrait frame, etc. are all intentional and should be preserved.

---

## 3. Where this lives in the app

Add a new route **`/character-creation`** to `src/App.tsx`, lazy-loaded the same way the others are:

```tsx
const CharacterCreationRoute = lazy(() => import('./pages/CharacterCreation'));
// …inside <Routes>, OUTSIDE the <Layout/> wrapper (this is a full-bleed pre-game screen,
// like /title and /login — no NavMenu/AppBar):
<Route path="character-creation" element={
  <Suspense fallback={null}><CharacterCreationRoute /></Suspense>
} />
```

Wire it into the **TitleScreen "New Game" flow** (`src/pages/TitleScreen/index.tsx` → `handleSelect('new')`): instead of `navigate('/station')`, route new saves through `/character-creation` first. On Deploy, persist the character to the player store and `navigate('/station')`. "Continue" should still go directly to `/station`.

```tsx
// In TitleScreen handleSelect:
case 'new':
  navigate('/character-creation');
  return;
case 'continue':
  navigate('/station');
  return;
```

---

## 4. Screens

### Screen A · `/character-creation` (3 steps in one route)

A single page that holds local step state (`1 | 2 | 3`). The chrome (brand strip + page header + stepper + bottom nav bar) is constant across steps; only the central content swaps. Keyboard `←` / `→` should move between steps when the current step is valid.

#### Common chrome

- **Background**: full-bleed `station_bg.png` with `linear-gradient(rgba(0,0,0,0.66), rgba(0,0,0,0.72))` overlay + `radial-gradient(ellipse at 50% 0%, rgba(10,245,176,0.06), transparent 55%)` glow on top. `background-attachment: fixed`.
- **Scanlines overlay** (toggleable): `repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.04) 2px 4px)` on a fixed `inset:0` element, `z-index: 9999`.
- **Max width**: `1480px`, `margin: 0 auto`, padding `32px 40px 60px` (or `20px 24px` in compact density).

#### BrandStrip (top)

`32×32` accent gradient tile with `<Terminal/>` icon → `CODEBREAKER` wordmark (`14px / 700 / 0.08em tracking`) → `v3.4.1` in Fira Code grey → flex spacer → small **`● ONBOARDING SECURE`** chip on the right (green-tinted pill with pulsing dot). Bottom-bordered `1px rgba(255,255,255,0.08)`, `margin-bottom: 22px`.

#### PageHeader

- Breadcrumb line (Fira Code 11px, profile-accent color, 0.18em tracking, uppercase):
  `<Icon> /home/operator/identity/<path> · STEP NN / 03 — STEP_LABEL`
- `<h1>` 42px / 700 / -0.02em tracking, white.
- 14px subtitle, `rgba(255,255,255,0.55)`, 640px max-width.
- **Stepper** (right side, on same baseline): pill container `rgba(25,25,25,0.80)` with three step chips. Active step = teal-tinted background + green dot. Completed step = green check + faint green track. Pending = dim.

#### Bottom NavBar (sticky-feeling)

Card: `rgba(25,25,25,0.88)` w/ `1px ${profile.accentEdge}` border, glow `0 0 24px ${profile.accent}22`, radius 14, `padding: 16px 22px`, `margin-top: 28px`. Layout:

1. Selected operator mini-tile (`40×40` accent glyph) + label `SELECTED · <CALLSIGN>` (eyebrow) + class subtitle.
2. Vertical divider.
3. Status line (Fira Code 12px) — green check + "Step N ready" when valid; amber warning + reason ("Pick a valid callsign", "Pick an origin", etc.) when not.
4. Right: optional `View Dossier` button (Step 1 only), `Back` text button, primary CTA. Step 1–2 CTA = `Continue` (arrow_forward icon). Step 3 CTA = bigger `Deploy` (rocket_launch icon, 16px text). CTA is disabled (no glow, `rgba(255,255,255,0.10)` bg) when `canAdvance === false`.

---

### Step 1 · Choose Operator

Three-column grid (`repeat(3, minmax(0,1fr))`, `gap: 18px`). Each card:

- Surface `rgba(25,25,25,0.82)` + blur(6px). Border `1px rgba(255,255,255,0.08)`. Radius 14. Shadow `0 2px 12px rgba(0,0,0,0.6)`.
- **Selected state**: border = `${profile.accentEdge}`, background = `linear-gradient(180deg, ${accent}10, rgba(25,25,25,0.92))`, extra glow ring `0 0 0 1px ${accent}40 inset, 0 0 32px ${accent}22`, lifts `translateY(-4px)`.
- Hover: lifts and deepens shadow (no border change).
- Top accent rail `3px` solid accent + 12px glow when selected.
- **SELECTED ribbon** top-right when active (`accent` pill, dark text, check icon).

Card body, top to bottom:

1. **Header row** — 96×96 mini portrait (see "Portrait spec" below) + identity stack:
   - Eyebrow `CLASS · <ID>` (Fira Code 9 / 0.20em / accent color)
   - Title (callsign, 22 / 700 / -0.01em, white)
   - Subtitle (classification, Fira Code 11 / 600 / 0.06em, rgba(255,255,255,0.55))
   - Difficulty chip (bottom of stack) — accent-tinted pill with 5 segmented pips (filled = accent w/ glow, empty = `rgba(255,255,255,0.18)`) and a label (`NOVICE`/`EASY`/`MODERATE`/`HARD`/`BRUTAL`).
2. **Tagline** — italic, `rgba(255,255,255,0.78)`, padding `14px 20px 4px`, wrapped in smart quotes.
3. **Stats list** — 4 rows (Cryptography / Hardware / Stealth / Networking). Each row: label (Fira Code 10 / 0.12em / icon prefix) + value (Fira Code 11 / 700 / accent + accent text-shadow) above a **20-segment bar** (each segment is `flex:1; height:6px; gap:2px`). Segments < `round(value/5)` are lit (`accent` or `accent`cc for the topmost 4). Lit segments get `0 0 4px ${accent}66` shadow. This bar is the signature "punch-card" stat visual and should be used identically in the modal — factor it as a `<StatBar>` component.
4. **Top Perks block** — separator + `// TOP PERKS` eyebrow + first 2 perks (icon + label) + `+ N more · N-item starting kit` summary.
5. **Footer actions** — two equal-width buttons: outlined `View Dossier` (opens modal) and primary `Select`. When selected: secondary button label becomes `Selected`, outlined style, no glow.

#### Portrait spec (used in card mini, modal hero, ID badge preview)

- Square, rounded 10–12px depending on context (10 for 96px mini, 12 for 168px hero, fluid 1:1 for ID badge).
- Background: `linear-gradient(135deg, ${accent}26, rgba(0,0,0,0.55))` + horizontal scanline pattern `repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 4px)`.
- Border: `1px solid ${accentEdge}`.
- Inner box-shadow `inset 0 0 32px ${accent}1f`.
- Centered class glyph at ~60% of the frame, accent color, opacity 0.85–0.9, with `drop-shadow(0 0 10–18px ${accent}55–66)`.
- 4 L-shaped accent corner brackets (2px solid accent, 10–14px legs).
- Mini variants overlay portrait ID in Fira Code 8/9 at bottom-left.

**Portraits are placeholders** in the prototype (Material Symbols glyphs). When character art exists, replace with `<img>` while keeping the frame, accent border, and corner brackets.

---

### Step 2 · Forge an Identity

Two-column grid: `minmax(0, 320px) minmax(0, 1fr)`, gap 22.

#### LEFT (sticky) · Operator ID badge preview

A vertical card (`rgba(25,25,25,0.82)`, `1px ${accent}33`, radius 14) that updates live as the user edits the right side. Position `sticky; top: 20px` so it stays visible while the right column scrolls.

- Header bar — `OPERATOR ID · PREVIEW` eyebrow (Fira Code, accent) + portrait ID + variant suffix (e.g. `OP-04-A`). Background `${accent}1a` with bottom-border.
- Big square portrait (full-width, aspect 1/1) using the same portrait spec, hue-rotated to match the selected avatar variant (see Variants below). If variant === 'redact', overlay a black redaction bar across the eye line.
- Below portrait:
  - `$ HANDLE` (Fira Code 10 / 0.18em / accent)
  - User's callsign, big (22 / Fira Code / white), or `— unset —` muted if invalid.
  - `<class callsign> · <classification first segment>` subtitle.
  - 2-column meta grid: `ORIGIN` tile (name + bonus subtitle), `BASE` tile (city + station name, colored to the base's accent).

#### RIGHT · Form

Stacked panels with consistent eyebrow style `// SECTION NAME` (Fira Code 10 / 700 / 0.18em / `rgba(255,255,255,0.55)`).

**Panel 1 · Callsign**

- Big monospace input. Container: `rgba(0,0,0,0.40)`, `1px rgba(255,255,255,0.10)`, **bottom border 2px** (this is the focus indicator) — green when valid, red when taken, neutral when empty.
  - `$ ` prompt prefix in accent color, Fira Code 18.
  - `<input>` Fira Code 22 / 700, transparent, no outline.
  - Right side: char counter `N/20` (Fira Code 11, dim) + outlined `SHUFFLE Random` button.
- **Availability strip** directly below (border-top removed so it reads as connected):
  - Empty (`length === 0`): muted hint `3–20 chars · letters, numbers, & . _ -`
  - Length < 3: amber `TOO SHORT · 3 char min`
  - Invalid chars: amber `INVALID CHARACTER`
  - Reserved (case-insensitive: `admin`, `phantom`, `h4x0r`, plus whatever you decide server-side): red `HANDLE TAKEN · pick another`
  - Valid + free: green `AVAILABLE · routing to leaderboard…` with check icon

  Strip uses `${color}08` background, `${color}30` border to match state.

**Panel 2-row** · two side-by-side panels (`grid-template-columns: 1fr 1fr; gap: 18px`):

- **Avatar Variant** — 4-column grid of square thumbnails. Each thumbnail uses the same portrait spec, with the same class glyph, but a different hue rotation (Standard 0°, Negative -22°, Recon +18° dashed frame, Redacted +44° with a black redaction bar). Active thumbnail = full saturation, accent-tinted background `${accent}1c` + accent border. Inactive thumbnails are filtered `saturate(0.7) brightness(0.85)`.
- **Home Base** — 4-cell grid (2×2). Each cell shows a 6px square indicator dot in the base's color + city name (13/700 + accent when active) + secondary line (Fira Code 10 / 0.06em / `NAME · META`). Active cell: `${baseColor}1c` background, `${baseColor}55` border. Hover: subtle background.

**Panel 3 · Origin Story** — 3-column grid of larger cards. Each card:

- Icon tile (36×36, accent-tinted when active) + name (13/700/white) + sub line (Fira Code 10 / 0.06em).
- 12px paragraph blurb (rgba(255,255,255,0.70), 1.5 line-height).
- Bottom-left stat-bump pill: `+5 <STAT_LABEL>` with stat icon. Pill background = `${accent}1c` (inactive) → solid accent + dark text (active).
- Active card: `${accent}10` background, accent-edge border, `0 0 24px ${accent}22` glow.

The eyebrow row of this panel also has a faded subtitle on the right: `+5 starting attribute · cosmetic flavor`.

---

### Step 3 · Final Briefing

Two-column grid: `minmax(0, 1.4fr) minmax(0, 1fr)`, gap 22.

#### LEFT column

**Panel A · Incoming Transmission** — Terminal card.

- Header bar: green pulsing dot + `INCOMING TRANSMISSION` (Fira Code 10 / 0.18em / accent) on the left; three macOS-style traffic-light dots `8×8` on the right (red `#ff5f57`, yellow `#febc2e`, green `#28c840`).
- Body on **pure black** (`#000`), Fira Code 12.5 / 1.7 line-height. Min height 220px. Inline-color the script:
  - `rgba(255,255,255,0.45)` for shell prompts (`$ ssh handler@cb-station.onion`) and `—` separators
  - `rgba(255,255,255,0.55)` for `[ OK ]` system lines
  - Cyan `#26c6da` for handshake lines, with the player's **callsign inlined in `${profile.accent}` + accent text-shadow**
  - White `rgba(255,255,255,0.92)` for narrative paragraphs, with origin name, class callsign (lowercase), and home base woven in
  - Final line: accent-color `[ ✓ ] Briefing complete · awaiting [DEPLOY]` where `DEPLOY` is rendered as an inverted accent chip (`background: accent; color: #0a0f0d; padding: 0 4px; border-radius: 2`).
  - Blinking caret: `8×14` accent block with `cursorBlink 1s steps(1) infinite` keyframe (`@keyframes cursorBlink { 0%, 50% { opacity:1 } 50.01%, 100% { opacity:0 } }`).

Use the player's actual identity fields (callsign, origin, base) when assembling the script.

**Panel B · First Contract**

- Mini header `<Assignment icon> First Contract` + right-aligned green `RISK · LOW` chip (`rgba(40,255,40,0.12)` bg, green border, Fira Code 10).
- Body: 3-column grid `56px 1fr auto`:
  - Mission icon tile (56×56, radial-gradient accent backdrop, `<Tag>` icon, accent color).
  - Title `Crack a CRC-32 checksum` (15/700) + Fira Code subtitle `JOB-0001 · ~45s · payout in fiat · no heat`.
  - Right-aligned `+ $250` (18/700/#28ff28 + green glow) + `+25 XP` (Fira Code 10 dim).

#### RIGHT column

**Panel C · Identity Dossier (recap)**

- Header: `// IDENTITY DOSSIER` eyebrow.
- Top row: 64×64 mini-portrait (same spec, hue-rotated to chosen avatar variant) + callsign (18/700/Fira Code) + class callsign eyebrow (Fira Code 11 / accent).
- Separator + DefRows (matched to `DefRow` pattern in `station-mui.jsx`):
  - `Class` → operator callsign
  - `Origin` → origin name (icon = origin.icon)
  - `Base` → `City · StationName`, value-colored in the base's accent
  - `Bonus` → `+5 <STAT>` in Fira Code, **green with green text-shadow** (positive)
  - `Signature` → `<Sig name> · <CD> CD`, value-colored in profile accent

**Panel D · Pre-flight checklist**

- 5 rows. Each row: 18×18 status badge (`${color}1c` bg, `${color}66` border, color icon: check for ok, priority_high for warn) + label (13/600/white) + optional Fira Code sub-line (11/dim).
- 4 green `ok` rows: `Operator class assigned` · `Callsign reserved` · `Starting kit transferred` (sub: `${N} items + seed wallet`) · `Tunnel encrypted` (sub: `ed25519 · 2048-bit`).
- 1 amber `warn` row: `Tutorial mission queued` (sub: `can be skipped from Settings`).

---

### Screen B · Profile Dossier modal

Opens from Step 1 cards' **View Dossier** button (also from the bottom NavBar on Step 1). Triggered via `setOpen(true)` + Esc-to-close + click-backdrop-to-close + `document.body.style.overflow = 'hidden'` while open.

- **Backdrop**: `rgba(0,0,0,0.62)` + `backdrop-filter: blur(6px)`. `mdlFadeIn 180ms ease-out` keyframe.
- **Dialog**: max-width 880, max-height `calc(100vh - 40px)`, radius 14, border `1px ${accentEdge}`, shadow `0 24px 64px rgba(0,0,0,0.8), 0 0 32px ${accent}26`. `mdlSlideUp 220ms cubic-bezier(0,0,0.2,1)` keyframe.
- **Animations** (inject once, shared with other modals): `mdlFadeIn` (opacity 0→1), `mdlSlideUp` (translateY 12→0 + scale 0.98→1 + opacity).

#### Modal layout

**Hero header** (top, 20–24 padding) — diagonal accent wash `linear-gradient(135deg, ${accent}18 0%, transparent 55%)` over `linear-gradient(180deg, ${accent}10, transparent)`. Bottom-bordered.

- Left: **168×168 dossier portrait** with the full portrait spec (corner brackets, scanlines, big glyph). Add two overlay text bits:
  - Top-left: `ID:<portraitId>` (Fira Code 9, accent, 0.14em)
  - Bottom: `● REC` (left) + `<random>:14:08` timer (right), Fira Code 9 dim.
- Right: identity stack (eyebrow `DOSSIER · <portraitId>`, big 30/700 callsign, 12/600 classification, then a row of meta chips: **DifficultyChip** + `AKA <realName>` + `SIG · <cooldown> CD`).
- Absolute-positioned close button (32×32, top-right, rounded 8, dark surface).

**Body** (scrollable, padding 20 24):

1. `// BACKGROUND` eyebrow + bio paragraph (14 / 1.65 / `rgba(255,255,255,0.80)`).
2. Two-column row, gap 16:
   - **Attributes panel** — same 20-segment `<StatBar>` rows as the card, inside a `rgba(0,0,0,0.30)` panel.
   - **Signature Ability panel** — accent-washed background. 48×48 icon tile, name (17/700), cooldown eyebrow, description (13/1.55 dim).
3. `// CLASS PERKS` eyebrow + 2-column grid of perk rows. Each row: 32×32 accent-tinted icon tile + label (13/600) + description (11.5/1.45 dim).
4. Two-column row `1.4fr 1fr`:
   - **Starting Kit** — DefRow-style list. Each row: 26×26 neutral icon tile + name + Fira Code meta uppercase + quantity (Fira Code, accent).
   - **Recommended For** — small panel with 3 check-circle bullets in accent color.

**Footer**:

- Left: info icon + small Fira Code legal-style line `CLASS LOCKS IN AT PRESTIGE 0 · CAN BE RESPEC'D`.
- Right: outlined `Back` + primary `Select This Operator` (or `Currently Selected` outlined when already chosen). Primary uses `0 0 24px ${accent}55` glow.

---

## 5. Data: classes, origins, bases, ciphers

All literal data lives in `design/character-data.jsx` and `design/character-steps.jsx`. Port it to TypeScript:

### Suggested locations

- `src/data/hackerClasses.ts` — the 3 class definitions (immutable, like `src/data/servers.ts`)
- `src/data/origins.ts` — 3 origin stories
- `src/data/homeBases.ts` — 4 cities
- `src/data/avatarVariants.ts` — 4 hue/frame variants
- `src/includes/Character.interface.ts` — interfaces below

### Interfaces

```ts
export type HackerClassId = 'cipherwright' | 'operator' | 'phantom';
export type StatKey = 'cryptography' | 'hardware' | 'stealth' | 'networking';
export type OriginId = 'basement' | 'dropout' | 'sysadmin';
export type HomeBaseId = 'tyo' | 'rkv' | 'gru' | 'lgs';
export type AvatarVariantId = 'a' | 'b' | 'c' | 'd';

export interface HackerClass {
  id: HackerClassId;
  callsign: string;          // e.g. 'CIPHERWRIGHT'
  realName: string;
  classification: string;    // 'CRYPTOLOGIST · CLASS-A'
  glyph: string;             // Material Symbols name
  portraitId: string;        // 'CW-01'
  accent: string;            // primary hex
  accentSoft: string;        // rgba w/ ~0.14 alpha
  accentEdge: string;        // rgba w/ ~0.36 alpha
  difficulty: 1 | 2 | 3 | 4 | 5;
  tagline: string;
  bio: string;
  stats: Record<StatKey, number>;   // 0–100
  perks: { icon: string; label: string; desc: string }[];
  startingKit: { icon: string; name: string; qty: string; meta: string }[];
  signature: { name: string; cooldown: string; desc: string; icon: string };
  recommended: string[];
}

export interface Origin {
  id: OriginId;
  name: string;
  sub: string;
  bonus: { stat: StatKey; amt: number };
  icon: string;
  blurb: string;
}

export interface HomeBase {
  id: HomeBaseId;
  city: string;
  name: string;
  meta: string;
  color: string;
}

export interface AvatarVariant {
  id: AvatarVariantId;
  label: string;
  tint: number;             // hue-rotate degrees, can be negative
  frame: 'solid' | 'dashed' | 'redact';
}

/** Persisted on the player. */
export interface CharacterIdentity {
  classId: HackerClassId;
  callsign: string;
  avatarVariant: AvatarVariantId;
  origin: OriginId;
  homeBase: HomeBaseId;
  createdAt: number;        // Date.now() at Deploy
}
```

### Exact class data

Pulled verbatim from `design/character-data.jsx`. **Use these values.**

#### CIPHERWRIGHT (id: `cipherwright`)
- Real name: `Dr. M. Vance`
- Classification: `CRYPTOLOGIST · CLASS-A`
- Glyph: `function` · Portrait ID: `CW-01`
- Colors: accent `#0af5b0`, soft `rgba(10,245,176,0.14)`, edge `rgba(10,245,176,0.36)`
- Difficulty: 2 (`EASY`)
- Tagline: `Reads block ciphers like sheet music.`
- Stats: crypto 92 / hw 48 / stealth 55 / net 60
- Perks:
  - `speed` — `+25% Cipher Cycle Speed` — Workloads on SHA-2 and stronger complete faster.
  - `school` — `+50% Neural Net XP` — Training runs gain bonus experience per epoch.
  - `auto_fix_high` — `Free re-roll on first 3 cracks` — Restart a stalled cipher cycle without penalty.
  - `workspaces` — `Starts with Tier-2 SKU access` — Marketplace unlocks Cipher Engine SKUs from day one.
- Starting kit:
  - `memory` · `AX-220 Cipher Engine` · `×1` · `T2 · 16c/32t`
  - `account_balance_wallet` · `Seed Wallet` · `$8,400` · `fiat balance`
  - `token` · `Lattice Reference Set` · `×3` · `consumable hints`
  - `menu_book` · `Academic Backchannel` · `unlock` · `rare cipher feed`
- Signature: `Eureka` · `6h` CD · icon `lightbulb` · "Instantly resolves one active cipher cycle of complexity ≤ 12 and refunds 50% of its power cost."
- Recommended: `Idle / long sessions`, `Neural Net builds`, `Solo prestige runs`
- Bio: see `character-data.jsx` (3-sentence paragraph)

#### THE OPERATOR (id: `operator`)
- Real name: `K. Sato`
- Classification: `INFRASTRUCTURE · CLASS-B`
- Glyph: `developer_board` · Portrait ID: `OP-04`
- Colors: accent `#26c6da`, soft `rgba(38,198,218,0.14)`, edge `rgba(38,198,218,0.36)`
- Difficulty: 1 (`NOVICE`) — easiest, recommended default for new players
- Tagline: `Owns more rack space than most ISPs.`
- Stats: crypto 50 / hw 94 / stealth 40 / net 72
- Perks:
  - `sell` — `−15% Marketplace Prices` — All Tier 1–3 servers cost less to acquire.
  - `storage` — `+4 Free Rack Slots` — Begin with a 28-slot rack instead of 24.
  - `bolt` — `−20% Power Draw` — Every owned node consumes less wattage.
  - `autorenew` — `Free Daily Restart` — One node per day can be restarted with zero downtime.
- Starting kit:
  - `memory` · `R210-II Rack Unit` · `×2` · `T1 · 8c/16t each`
  - `account_balance_wallet` · `Seed Wallet` · `$12,200` · `fiat balance`
  - `inventory_2` · `Spare Parts Bin` · `×6` · `consumable repairs`
  - `handyman` · `Workshop License` · `unlock` · `crafting bench`
- Signature: `Cold Boot` · `4h` CD · icon `flash_on` · "Brings every offline node back to 100% utilization for 5 minutes with zero power penalty."
- Recommended: `Beginners`, `Active play`, `Marketplace flips`

#### PHANTOM (id: `phantom`)
- Real name: `unknown`
- Classification: `SOCIAL ENGINEER · CLASS-S`
- Glyph: `visibility_off` · Portrait ID: `PH-??`
- Colors: accent `#ff9800`, soft `rgba(255,152,0,0.14)`, edge `rgba(255,152,0,0.40)`
- Difficulty: 4 (`HARD`)
- Tagline: `Has been everyone. Has never been caught.`
- Stats: crypto 55 / hw 45 / stealth 96 / net 80
- Perks:
  - `storefront` — `Dark Web Insider Pricing` — −25% on black-market listings, +15% on resales.
  - `visibility_off` — `−40% Heat Generation` — Stealth missions raise far less suspicion.
  - `travel_explore` — `+2 Daily Bounty Slots` — Extra contract slots in the Dark Web feed.
  - `psychology` — `Social Engineering Tree` — Unique perk tree unlocked at Prestige 1.
- Starting kit:
  - `usb` · `Burner Rig (Onion-7)` · `×1` · `T1 · stealth-tuned`
  - `account_balance_wallet` · `Crypto Wallet` · `$5,800` · `untraceable`
  - `qr_code_2` · `False Identity Pack` · `×5` · `consumable disguises`
  - `forum` · `Encrypted Backchannel` · `unlock` · `private contracts`
- Signature: `Ghostwalk` · `8h` CD · icon `dark_mode` · "Run any single mission with 0% heat and double payout. Cannot be detected, logged, or replayed."
- Recommended: `Advanced players`, `High-risk runs`, `Dark Web mains`

### Origins (each grants +5 to one stat)

| id | name | sub | bonus | icon | blurb |
|---|---|---|---|---|---|
| `basement` | Basement Prodigy | Self-taught · age 14 | +5 stealth | `shelves` | Years on shared hosting and bootleg compilers. Knows how to keep quiet. |
| `dropout` | MIT Dropout | Comp Sci · ABD | +5 cryptography | `school` | Wrote a thesis the department refused to publish. Took the math with you. |
| `sysadmin` | Ex-Corporate Sysadmin | 12y · F500 backend | +5 networking | `business` | Spent a decade keeping VPNs alive. Now you know exactly where they leak. |

### Home bases

| id | city | name | meta | color |
|---|---|---|---|---|
| `tyo` | Tokyo | Free Port | JP · 32 Tbps | `#26c6da` |
| `rkv` | Reykjavik | Cold Site | IS · −4°C | `#61dafb` |
| `gru` | São Paulo | Grid Sub-7 | BR · Mesh | `#ff9800` |
| `lgs` | Lagos | Sandbox | NG · Tier-A | `#0af5b0` |

### Avatar variants

| id | label | tint (hue-rotate °) | frame |
|---|---|---|---|
| `a` | Standard | 0 | solid |
| `b` | Negative | -22 | solid |
| `c` | Recon | +18 | dashed |
| `d` | Redacted | +44 | redact (overlay black bar) |

### Random callsign pool (for "Shuffle" button)

```ts
['Null_Pointer', 'PARITY_X', 'h3xenburg', 'glitchwitch',
 'kernel.panic', 'rootkit_jane', '0xCascade', 'SNOWLEOPARD',
 'midnight.fox', 'EBP_RAIDER', 'sk1d_marrow', 'BLUEBIRD']
```

### Stat key map (icons / labels)

```ts
const STAT_KEYS: { key: StatKey; label: string; icon: string }[] = [
  { key: 'cryptography', label: 'CRYPTOGRAPHY', icon: 'function' },
  { key: 'hardware',     label: 'HARDWARE',     icon: 'developer_board' },
  { key: 'stealth',      label: 'STEALTH',      icon: 'visibility_off' },
  { key: 'networking',   label: 'NETWORKING',   icon: 'lan' },
];
```

---

## 6. Interactions & validation

### Step gate logic (lift from `character-creation-page.jsx` `CharacterCreationPage`)

- **Step 1 → Step 2**: requires `selectedClassId` (always satisfied — page starts with a default).
- **Step 2 → Step 3**: requires all of:
  - `callsign` trimmed length ≥ 3 and ≤ 20
  - matches regex `/^[A-Za-z0-9_.-]+$/`
  - **not** reserved (case-insensitive in the prototype set: `admin`, `phantom`, `h4x0r` — in production, hit your server-side reservation check)
  - `origin` is set
  - `homeBase` is set
- **Step 3 → Deploy**: always allowed once you've arrived (Step 2 already gated everything).

`canAdvance: boolean` drives the CTA enabled state. `blockReason: string` drives the amber message in the NavBar status line ("Pick a valid callsign", "Pick an origin", etc.).

### Callsign field behavior

- Trim before validating.
- `maxLength={20}` on the input.
- Random button pulls from the pool above, replaces the current value.
- Availability strip is purely **client-side** in the prototype; back this with a debounced (`~300ms`) lookup against the leaderboard / save system if you have one.
- The Step 2 `OPERATOR ID PREVIEW` card on the left reads from the same source — both update on every keystroke.

### Navigation

- Bottom `Continue` advances. Bottom `Back` decrements, or routes to `/` (TitleScreen) when at step 1.
- The Stepper chips themselves should be **non-clickable for steps you haven't unlocked yet** — clickable to jump back to completed steps. Use `pointer-events: none; opacity:1` discipline; don't fade them, just don't accept clicks.
- The Profile Dossier modal's "Select This Operator" button **does not advance the step** — it sets the class and closes the modal.

### On Deploy (step 3 CTA)

1. Build a `CharacterIdentity` from the wizard state.
2. Persist to the player store (see §7).
3. `navigate('/station')`.

### Animation timings

- Card hover lift: `transform 225ms cubic-bezier(0,0,0.2,1)`. Translates `Y(-4px)` on hover or selected.
- Card box-shadow / border / background transitions: `225ms` on the same easing (MUI default).
- Modal: `mdlFadeIn 180ms ease-out` backdrop, `mdlSlideUp 220ms cubic-bezier(0,0,0.2,1)` panel.
- Live dot pulse: `statusPulse 1.6s ease-in-out infinite` (opacity 1↔0.55 + spreading box-shadow ring).
- Terminal caret: `cursorBlink 1s steps(1) infinite`.
- Stepper transitions: `200ms` on color/background.

---

## 7. State management

### New Zustand slice — `src/stores/character.ts`

Persist with `zustand/middleware`/`persist` (same pattern as `player.ts`). Keep it on its own key so the player store doesn't bloat.

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CharacterIdentity, HackerClassId, AvatarVariantId, OriginId, HomeBaseId } from '../includes/Character.interface';

interface CharacterStore {
  identity: CharacterIdentity | null;   // null until first deploy
  // Wizard scratch state (only used while /character-creation is mounted):
  draft: {
    step: 1 | 2 | 3;
    classId: HackerClassId;
    callsign: string;
    avatarVariant: AvatarVariantId;
    origin: OriginId | null;
    homeBase: HomeBaseId | null;
  };
  setStep: (step: 1 | 2 | 3) => void;
  setDraft: (patch: Partial<CharacterStore['draft']>) => void;
  deploy: () => void;       // commits draft → identity, stamps createdAt
  reset: () => void;        // on save reset / new game
}
```

- `deploy()` should validate one last time, build `CharacterIdentity`, and set `identity`.
- The wizard reads/writes `draft.*`. The rest of the game reads from `identity` (e.g., AppBar can show callsign; Servers can apply the `-15% market prices` perk for Operator; etc.).
- On the title screen's "New Game" flow, call `character.reset()` before navigating to `/character-creation` so a previously-deployed identity doesn't bleed in.

### Wiring class perks into existing systems

Don't try to do all of these on the first PR. Tag the easy ones as follow-ups:

- **Servers store**: read `identity.classId` to apply `−15%` price for Operator; pre-grant T2 SKU visibility for Cipherwright.
- **Player store / starting wallet**: when `deploy()` fires for the first time, seed `money` with the class's wallet (Cipherwright $8,400, Operator $12,200, Phantom $5,800) **plus** the origin's stat bonus.
- **Racks**: Operator's `+4 Free Rack Slots` → bump default capacity from 24 → 28 when `classId === 'operator'`.
- **Neural Net**: Cipherwright `+50% XP` multiplier.
- **Dark Web**: Phantom pricing + heat modifiers (TODO — defer until the dark-web economy is finalized).
- **Signature ability**: not wired in v1. Surface it visually on the Station/Terminal but leave the action behind a feature flag until the cooldown system exists.

---

## 8. Design tokens

All tokens already live in `colors_and_type.css` (already loaded into the app). Use the CSS vars where SCSS, fall back to the literals for MUI `sx` / `styled`.

### Colors

| Token | Hex / rgba | Use |
|---|---|---|
| `--color-accent` | `#0af5b0` | Cipherwright accent, primary CTA, "live" dots, default highlight |
| `--color-accent-cyan` | `#26c6da` | Operator accent, secondary accent |
| `--color-warning` | `#ff9800` | Phantom accent, validation warnings, restart progress |
| `--color-error` | `#f44336` | Reserved-callsign error, sell confirmation |
| `--color-income` | `#28ff28` | "+$" money labels, AVAILABLE state, signature green glow |
| `--color-bg` | `#242424` | Root background under scene image |
| `--color-bg-card` | `rgba(25,25,25,0.80)` | Card/panel surface |
| `--color-bg-nav` | `rgba(50,50,50,0.85)` | Elevated surfaces |
| `--color-fg` | `rgba(255,255,255,0.87)` | Primary text |
| `--color-fg-secondary` | `rgba(255,255,255,0.60)` | Secondary text |
| `--color-fg-disabled` | `rgba(255,255,255,0.38)` | Muted text |
| `--color-border` | `rgba(255,255,255,0.12)` | Standard 1px border |

Class-accent tinted derivatives are computed as `${accent}<alpha-hex>`:
- `${accent}10` ≈ 6% (`linear-gradient`) · `${accent}1a` ≈ 10% (header wash) · `${accent}26` ≈ 15% (portrait bg)
- `${accent}40` ≈ 25% (border) · `${accent}55` ≈ 33% (CTA glow) · `${accent}77` ≈ 47% (CTA strong glow)

### Spacing

`--space-1: 4` · `--space-2: 8` · `--space-3: 12` · `--space-4: 16` · `--space-5: 20` · `--space-6: 24` · `--space-8: 32` · `--space-10: 40` · `--space-12: 48`.

### Radii

`--radius-sm: 4` · `--radius-md: 8` (most controls) · `--radius-lg: 12` (cards) · `--radius-xl: 16` (modal) · `--radius-pill: 9999`.

### Shadows / glows

- Card: `0 2px 12px rgba(0,0,0,0.6)`
- Elevated: `0 4px 24px rgba(0,0,0,0.8)`
- Modal: `0 24px 64px rgba(0,0,0,0.8), 0 0 32px ${accent}26`
- CTA primary: `0 0 24px ${accent}77`
- Mini accent glow (stat segment): `0 0 4px ${accent}66`
- Portrait inner: `inset 0 0 32–60px ${accent}1a–1f`

### Typography

- **UI**: Inter — 300/400/500/600/700/800. System fallback stack `Inter, system-ui, …`.
- **Code/HUD**: Fira Code — 400/500/600/700.
- **Terminal**: IBM VGA (`@font-face` already in `colors_and_type.css`) — **only** used inside the transmission terminal panel if you want extra flavor; the prototype uses Fira Code there for legibility.

Type scale (already in tokens):

| Use | Size | Weight | Tracking | Notes |
|---|---|---|---|---|
| Hero H1 (PageHeader) | 42 | 700 | -0.02em | white |
| Modal hero title | 30 | 700 | -0.01em | white |
| Card title (callsign) | 22 | 700 | -0.01em | white |
| Section title | 20 | 700 | normal | white |
| Body / paragraph | 14 | 400 | normal | `rgba(255,255,255,0.80)`, line-height 1.5–1.65 |
| Stat value | 11 | 700 | normal | Fira Code, accent + accent text-shadow |
| Eyebrow | 10 | 700 | 0.18em | Fira Code, accent or `rgba(255,255,255,0.55)` |
| Tiny label / ID | 9 | 700 | 0.18–0.20em | Fira Code |

### Backdrop / overlays

- All translucent panels use `backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px)`.
- Scanlines (toggleable via `body.scanlines::after`): `repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.04) 2px 4px)`.
- Scene bg: `url(station_bg.png)` with `linear-gradient(rgba(0,0,0,0.66), rgba(0,0,0,0.72))` overlay + `radial-gradient(ellipse at 50% 0%, rgba(10,245,176,0.06), transparent 55%)` glow.

---

## 9. Assets

- **Background image**: `src/assets/backgrounds/station_bg.png` (already exists in the codebase). Use the same one TitleScreen uses.
- **Icons**: Material Symbols Rounded via `@mui/icons-material` — the prototype names match the MUI export names (snake_case in the prototype → PascalCase in MUI: `developer_board` → `<DeveloperBoardOutlined />`, `visibility_off` → `<VisibilityOff />`, `auto_fix_high` → `<AutoFixHighOutlined />`, etc.).
- **Class portraits**: **none yet**. Frame is built; drop an `<img>` into the portrait frame component when art lands. Until then the class glyph is the placeholder.
- **Fonts**: Inter, Fira Code, Material Symbols Rounded — all loaded already by the app shell.

---

## 10. Files in this bundle

```
design/
  Character Creation.html        — entrypoint; load order shows what depends on what
  character-data.jsx             — class catalog, stat key list
  character-creation-page.jsx    — root page: chrome, stepper, NavBar, modal sync, step routing
  character-steps.jsx            — Step 2 (CallsignStep) + Step 3 (BriefingStep) + ORIGINS/HOME_BASES/AVATAR_VARIANTS literals
  character-profile-modal.jsx    — ProfileModal + StatBar + DifficultyChip + DossierPortrait
  station-mui.jsx                — hand-rolled MUI-flavor primitives. DO NOT COPY. Reference for component vocabulary only; use real MUI.
  tweaks-panel-servers.jsx       — tooling for the prototype's design-time tweak panel. NOT for production.
  colors_and_type.css            — design tokens (this IS production-ready, already in the app)
  station_bg.png                 — scene background (use the codebase's copy)
```

### What's worth lifting verbatim

- **Class / origin / base / variant data** — copy into TS files in `src/data/`.
- **StatBar component** — small enough to reproduce as a React component (`<StatBar value icon label accent />`).
- **DifficultyChip component** — same.
- **Portrait frame component** — extract once, reuse in 3 places (card mini, modal hero, ID badge preview, recap mini). Hue-rotate filter is driven by avatar variant.
- **Modal animation keyframes** — `mdlFadeIn`, `mdlSlideUp`, `cursorBlink`, `statusPulse`. Add to `src/index.css` or a SCSS partial.

### What to skip

- The Tweaks panel and `useTweaks` hook — design-time only.
- `station-mui.jsx` — hand-rolled MUI emulation, exists only because the sandbox can't run real MUI. The real app already has MUI v9.
- The `EDITMODE-BEGIN`/`END` JSON blob in the page file — that's design-tool persistence, not state management.

---

## 11. Suggested PR breakdown

1. **Scaffolding** — Add `src/pages/CharacterCreation/{index.tsx, style.scss}`, register the route, wire TitleScreen "New Game" through it. Render placeholder content. Add `src/stores/character.ts` + `src/includes/Character.interface.ts` with the wizard `draft` and stub `deploy()`.
2. **Data + shared components** — Port the class/origin/base/variant data. Build `<StatBar>`, `<DifficultyChip>`, `<ClassPortrait>` (frame + glyph + corner brackets + variant hue/frame).
3. **Step 1** — Operator cards + selection state.
4. **Profile Dossier modal** — Hero header, attributes panel, signature panel, perks grid, kit list, recommended list, footer actions. Open from card "View Dossier".
5. **Step 2** — Callsign field + validation, avatar variants, home base, origin cards, sticky ID-badge preview on the left.
6. **Step 3** — Transmission terminal, first contract card, identity recap, pre-flight checklist.
7. **Deploy wiring** — `deploy()` writes identity, seeds wallet + origin bonus, applies the obvious class perks (Operator rack slot count, Cipherwright T2 visibility), navigates to `/station`. Tag the more complex perks as follow-ups.
