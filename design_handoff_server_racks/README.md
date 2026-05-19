# Handoff: Server Racks Page (Codebreaker)

## Overview

The **Server Racks** page is a section of the Codebreaker game where the player manages physical infrastructure for their code-breaking empire:

- **Buy racks** to install previously-purchased servers into
- **Drag & drop** servers from an inventory panel into rack U-slots
- **Reorganize** installed servers by dragging them within or between racks
- **Wire racks through switches** to a network uplink
- **Monitor uplink status** (Up / Degraded / Down) from a header indicator
- **Switch between data centers** (multiple geographic regions)

The page is a sibling of the existing **Station V2** page and reuses its visual language (dark MUI cards, accent green `#0af5b0`, Fira Code monospace, scanlines overlay, background-image scene).

## About the Design Files

The files bundled here are **design references created in HTML/React-via-Babel** — high-fidelity prototypes showing the intended look, layout, and interactions. They are **not production code**.

Your task is to **recreate this design in the target codebase's existing environment** (likely React/MUI, given how Codebreaker is structured). Use the codebase's established patterns: real MUI components instead of the hand-rolled `MuiCard`/`MuiButton`/etc. primitives, your real router, your real state store, etc. The bespoke `Mui*` shims in `station-mui.jsx` exist only because the prototype runs as a single Babel-transpiled HTML file with no build step — they mimic MUI dark-theme defaults so the visual result matches what real `@mui/material` components will look like.

The drag-and-drop in the prototype uses raw HTML5 DnD. In production, prefer a tested library (`@dnd-kit/core` recommended — it composes well with React and supports keyboard accessibility).

## Fidelity

**High-fidelity (hifi).** Colors, typography, spacing, and interactions are final. Recreate pixel-perfectly using the real MUI components and the design tokens listed below.

## Screens / Views

There is **one screen**: the Server Racks page. It is composed of seven top-level regions stacked vertically inside a centered container.

### Page container

- `max-width: 1700px`, `margin: 0 auto`
- Padding: `32px 40px 100px` (comfortable) / `20px 24px 100px` (compact, density tweak)
- Background: full-bleed fixed scene image `racks_bg.png` with a `linear-gradient(rgba(0,0,0,0.70), rgba(0,0,0,0.78))` overlay
- Optional scanlines overlay: 2px-period repeating-linear-gradient at 4% opacity, `z-index: 9999`, `pointer-events: none`

### 1. Brand strip

Top-of-page chrome shared across Station / Servers / Racks pages.

- 32×32 rounded-square logo tile (6px radius) with `linear-gradient(180deg, #00e5bf, #003d35)` and a `terminal` Material Symbol glyph
- "CODEBREAKER" wordmark, 14px / 700 weight / `0.08em` tracking
- Version string `v3.4.1` in Fira Code 12px, muted
- Right-side icon-button row: `terminal · important_devices · storage · apartment · router · public · share` — the `apartment` button is the active (primary-colored) one on this page
- 1px bottom divider, `rgba(255,255,255,0.08)`
- 20px bottom margin

### 2. Page header

Flex row, items `flex-end`, `space-between`, wraps on narrow widths.

**Left column:**
- Breadcrumb-style overline: `<apartment icon> /home/operator/datacenter/{dc.id}/racks` — Fira Code 11px, accent color `rgba(10,245,176,0.85)`, uppercase, `0.18em` tracking
- H1 title "Server Racks" — Inter 38px / 700 / `-0.01em` tracking
- Subtitle paragraph (max 640px): "Install your servers, wire racks through switches, and manage the uplink to keep your code-breaking floor online."
- **DataCenterPicker** dropdown directly below subtitle (see below)

**Right column (status chips, top-right of header):**
- `UPLINK UP|DEGRADED|DOWN` chip — outlined, color matches status (accent / warn / error), with pulsing live-dot
- Bandwidth + latency chip — `10 Gbps · 4 ms`, outlined, `public` icon
- Optional warn chip: `N SWITCH ALERTS` if any switch is non-UP

### 3. DataCenterPicker

Custom dropdown component.

**Trigger button:**
- 240px min-width, 8px padding, `rgba(25,25,25,0.85)` background, 1px border `rgba(10,245,176,0.30)`, 8px radius
- Flag emoji (22px font) + label block + chevron
- Label block: small overline "DATACENTER" (Fira Code 10px, accent) + name+region line ("Seattle-01 · us-west", 13px / 600)

**Open menu:**
- 320px min-width, anchored 6px below trigger
- Background `rgba(28,28,30,0.98)`, 1px border `rgba(255,255,255,0.12)`, 8px radius, heavy shadow
- Items: flag (22px) + name/region/tier/power, "PRIMARY" pill on the user's primary DC, check icon on active
- Footer row: "Lease new datacenter…" with `add_business` icon

**Data centers** (from `racks-page.jsx`):

| id      | name           | region     | tier            | power   | flag |
|---------|----------------|------------|-----------------|---------|------|
| dc-sea  | Seattle-01     | us-west    | Tier III        | 480 kW  | 🇺🇸   |
| dc-fra  | Frankfurt-02   | eu-central | Tier IV         | 720 kW  | 🇩🇪   |
| dc-sgp  | Singapore-01   | apac       | Tier III        | 320 kW  | 🇸🇬   |
| dc-rey  | Reykjavik-01   | eu-north   | Tier II · Geo   | 200 kW  | 🇮🇸   |

In production the selected DC should drive what racks/inventory load. The prototype displays the same data regardless and only updates the breadcrumb — wire this up to your real backend.

### 4. Stat strip

6-column equal grid, 12px gap. Each cell is a `rgba(25,25,25,0.80)` card, 1px border, 12px radius, 12×14 padding.

Cell layout: overline label (10px / `0.16em` tracking, with leading icon) → big mono value (20px / 700, Fira Code) → meta line (10px Fira Code, muted).

Cells, left to right:
1. **RACKS DEPLOYED** — `racks.length`, meta = total U capacity
2. **SERVERS INSTALLED** — count, meta = `Nu/Mu used`, **accent green value with text-shadow glow**
3. **IN INVENTORY** — uninstalled count
4. **ACTIVE SWITCHES** — `up/total`, meta = total ports up
5. **AVG LOAD** — `%` across all installed servers, **income green if <80%**
6. **POWER DRAW** — `(totalWatts/1000).toFixed(2) + ' kW'`, meta `PUE 1.18`

### 5. Three-column working area

CSS grid, 16px gap, `height: calc(100vh - 380px)` with `min-height: 640px`.

Grid template (when topology is shown):
```
minmax(260px, 280px)   minmax(0, 1fr)   minmax(300px, 340px)
[      Inventory   ][   Rack Floor    ][     Network     ]
```

When the topology panel is toggled off, the third column collapses.

#### 5a. Inventory panel (left)

Card container, 12px radius, `rgba(25,25,25,0.82)` background.

- **Header:** 32×32 cyan avatar (`inventory_2` icon) + "Inventory" title + "DRAG TO INSTALL · N UNITS" subtitle
- **Hint banner:** thin tinted strip — `rgba(10,245,176,0.05)` bg, `drag_indicator` icon + "Drag any server onto an empty rack slot"
- **Scrollable list:** stack of ServerChip components (see below), 8px gap, 12px padding
- **Footer:** "Buy New Rack" outlined button (full-width) + "NEXT TIER UNLOCK · 2 RACKS" caption

**ServerChip** (used in inventory AND inside rack slots):
- Two render modes based on height: **1U-collapsed** (height ≤ 24px) vs **standard** (multi-U).
- **Standard mode:** flex row, 8px padding, gradient `rgba(40,40,42)→rgba(18,18,20)` bg, tier-colored 3px left border, 6px radius. Content: 2 dot "rack ear" screws → SKU + size + tier/watts text block → 3 LED column (tier-color, blink; green, blink-fast; gray, static) → 26×~70% vent strip (repeating-linear-gradient stripes).
- **1U-collapsed mode:** same chassis but single line, 4px radius, smaller text (Fira Code 10px), one screw + SKU + watts + 2 inline LEDs + 14×8 vent strip.
- `draggable` attribute is set when `onDragStart` is provided.
- Opacity drops to 0.4 while being dragged.

#### 5b. Rack Floor (center)

Card container with horizontal-scrolling row of racks.

- **Header:** accent-green avatar (`dns` icon), "Rack Floor" title, "N RACKS · M INSTALLED" subtitle, "HOT/COLD AISLE" cyan outlined chip on the right
- **Scroll area:** `overflow-x: auto`, 18px padding, decorated with two large soft radial gradients (`circle at 30% 20%` accent, `circle at 80% 70%` cyan, both at 0.04 alpha)

**RackUnit** card (280px wide, side by side, 18px gap):

```
┌─────────────────────────┐  ← chassis header (36px)
│ ● RACK A          42U   │
├─────────────────────────┤
│ 1 │   ┌──────────────┐  │  ← rack body
│ 2 │   │ ServerChip   │  │     repeating-linear-gradient
│ 3 │   │ (2U)         │  │     1px-dark stripes at U_HEIGHT=22px
│ 4 │   └──────────────┘  │
│ 5 │       (empty slot)  │
│ 6 │                     │
│ … │                     │
└─────────────────────────┘
│ ⚡ 2430W  ▓▓▓▓░░  62%  │  ← footer fill bar (28px)
└─────────────────────────┘
```

- **Chassis header** 36px: gradient `#1d1f22→#0e1011` strip with live-dot + rack name (`Fira Code 12px accent`) + U-count
- **Body**: `repeating-linear-gradient` showing 1px dark divider every 22px, height = `slots × 22px`. 22px left column shows U-numbers (Fira Code 8px, muted).
- **Drop zones**: one absolutely-positioned 22px-tall div per empty U. When dragging, the row(s) the dragged server would occupy show: green tint + green dashed border if valid; red tint + red dashed border if invalid (would overlap). Apply the `drop-active` keyframes animation on the valid range — it pulses the inset shadow.
- **Installed servers**: absolutely-positioned, `top: (u-1)×22 + 1`, `height: size×22 − 2`, `left: 24, right: 6`. The **entire tile is draggable** (no separate handle). On drag start, store `{rackId, server}` in page state so drop-target validation knows to ignore this server's own slots. The tile contains the ServerChip plus a small close (×) button in the top-right corner — `width: 16/18px` depending on 1U vs multi-U.
- **Footer** 28px: `⚡` icon + total watts (Fira Code 10px) + flex spacer + horizontal fill-bar (4px tall, accent green with glow) + percent (Fira Code 10px accent).

After the last rack, a **dashed "Add Rack" ghost card** — same 280px width, dashed border, large `add_circle` icon, "From $4,500" caption. Hover turns border + text accent green.

##### Drop validation: `canPlace(rack, startU, size, ignoreInstId)`

A placement is valid iff:
- `startU >= 1 && startU + size - 1 <= rack.slots`
- For every already-installed server (other than the one being moved within this rack), the new range `[startU, startU+size-1]` doesn't overlap its range `[u, u+size-1]`

##### Move-within / move-between

When a rack tile starts dragging:
- The page sets `moveDrag = {rackId, server}` and removes the visual server (drops to 0.35 opacity)
- Drop zones now allow the slot the server is currently in (via `ignoreInstId`)
- On drop: remove from source rack, insert into target rack at the new `u`, preserve the server's `util` value

When an inventory item starts dragging:
- The page sets `draggingId` to the inventory item id
- On drop: append to the target rack's `installed`, remove from inventory

#### 5c. Network panel (right)

Card container with three stacked sections.

**UplinkPanel** (top section):
- Tinted gradient background `rgba(10,245,176,0.06)→rgba(0,0,0,0.2)`, colored border keyed to status
- Row 1: globe icon + provider name ("AggroNet Tier-1") + live-dot (right)
- 2×2 grid of stats: BANDWIDTH (`10 Gbps`, mono, in status color), LATENCY (`4 ms`), PUBLIC IP (`198.51.100.42`), ASN (`AS64512`)
- Two text buttons: "Cycle" (autorenew icon, primary) and "BGP" (settings_ethernet icon, neutral)

**NetworkDiagram** (middle section):
- 280×220 SVG inside a `rgba(0,0,0,0.45)` framed box
- Three layers: UPLINK node at top center (rounded rect, 52×20, accent fill), switch nodes in row at y=100, rack nodes at y=184
- Lines drawn uplink→each switch, switch→assigned-racks, animated via `stroke-dasharray: 6 8` + `animation: packetFlow 1.2s linear infinite` (negative dashoffset = flow toward target)
- Color rules: accent green if both ends UP, warning orange if either side degraded, error red if down

**Switches list** (bottom section):
- Header row: "Switches" overline + optional `N UNLINKED` warning chip if any rack has no `switchId`
- One **SwitchRow** per switch:
  - Header: router icon (status color) + name + model + status chip
  - **Port grid:** 6×6px squares with 2px gap. First `used` squares are accent-green with glow, rest are muted gray.
  - Caption: `used/total PORTS · throughput · N RACKS`
  - When selected (click to expand), shows a checkbox list of all racks. Checking assigns that rack to this switch; unchecking sets `switchId: null`.
- Footer: outlined "Add Switch" button

### 6. Tweaks panel (floating)

Persistent floating panel, bottom-right of viewport. The host application provides this — in the prototype it's `tweaks-panel.jsx`. **Do not ship this in production**; it's a designer-side knob panel. Just use the defaults:

- Density: `comfortable`
- Scanlines: on
- Uplink status: `UP`
- Show topology: `true`
- Show power footers: `true`

## Interactions & Behavior

### Drag & drop

Use `@dnd-kit/core` in production. Three drag sources, two drop targets:

| Source                      | Target            | Action                                                |
|-----------------------------|-------------------|-------------------------------------------------------|
| Inventory item              | Rack U-slot       | Install: move from inventory to rack.installed        |
| Installed server (any rack) | Rack U-slot       | Move: remove from source rack, insert at new u        |

- Drop zones highlight green for valid, red for invalid; show a contiguous range based on the dragged server's `size`
- Invalid drops (out of range, overlapping) are silently ignored — no error toast in this design

### Live data shimmer

The prototype simulates load fluctuation by mutating each installed server's `util` value every 1500ms by a small random delta. In production this comes from your real telemetry stream — replace the interval with a websocket subscription.

### Uninstall (×)

Hover-visible × button in the top-right of each installed-server tile. Returns the server to inventory.

### Switch row expand/collapse

Click anywhere on a SwitchRow to toggle its rack-assignment checkbox list. The component manages this in local state.

### Uplink cycling

The "Cycle" button in the UplinkPanel rotates status `UP → DEGRADED → DOWN → UP`. In production this is for development only; remove or replace with a "Test failover" admin action.

### Datacenter switch

Selecting a different DC should refetch racks, inventory, switches, and uplink from your backend keyed to that DC. The prototype updates only the breadcrumb path.

## State Management

```ts
type Rack = {
  id: string;
  sku: string;          // RK-12U | RK-24U | RK-42U | RK-48U
  name: string;
  slots: number;        // U capacity
  switchId: string | null;  // assignment to a switch, or unlinked
  installed: InstalledServer[];
};

type InstalledServer = {
  instId: string;       // unique per server instance
  sku: string;          // server model SKU
  name: string;
  u: number;            // top-most U number (1-indexed)
  size: number;         // U height (1, 2, 4)
  tier: 1 | 2 | 3 | 4 | 5;
  watts: number;
  util: number;         // 0-100, live
};

type InventoryItem = {
  instId: string;
  sku: string;
  name: string;
  size: number;
  tier: number;
  watts: number;
};

type Switch = {
  id: string;
  name: string;
  model: string;
  ports: number;
  used: number;
  throughput: string;   // human label like "40 Gbps"
  status: 'UP' | 'DEGRADED' | 'DOWN';
};

type Uplink = {
  provider: string;
  status: 'UP' | 'DEGRADED' | 'DOWN';
  bandwidth: string;
  latency: string;
  ip: string;
  asn: string;
};

type DataCenter = {
  id: string;
  name: string;
  region: string;
  tier: string;
  power: string;
  flag: string;
  primary?: boolean;
};
```

**Page state:**
- `selectedDC: string` (default `'dc-sea'`)
- `racks: Rack[]`
- `inventory: InventoryItem[]`
- `switches: Switch[]`
- `uplink: Uplink`
- `draggingId: string | null` (inventory drag)
- `moveDrag: { rackId, server } | null` (rack→rack drag)
- `selectedInstId: string | null` (click-to-select highlight)

**Mutations:**
- `installServer(rackId, u, server)` — append to rack.installed, remove from inventory
- `moveServer(srcRackId, dstRackId, instId, newU)` — remove from src, insert into dst
- `uninstallServer(rackId, instId)` — remove from rack, push to inventory
- `addRack()` — append new empty rack
- `assignRackToSwitch(rackId, switchId | null)`
- `cycleUplink()`
- `selectDC(dcId)` — refetch all above

## Design Tokens

Pulled from `colors_and_type.css` (included in this bundle).

### Colors

| Token                       | Value                     | Usage                              |
|-----------------------------|---------------------------|------------------------------------|
| `--color-accent`            | `#0af5b0`                 | Primary brand, CTAs, active state  |
| `--color-accent-cyan`       | `#26c6da`                 | Secondary accents, inventory       |
| `--color-warning`           | `#ff9800`                 | Degraded uplink, warnings          |
| `--color-error`             | `#f44336`                 | Down uplink, invalid drops         |
| `--color-income`            | `#28ff28`                 | "Avg load < 80%" stat              |
| `--color-bg`                | `#242424`                 | Root background                    |
| `--color-bg-card`           | `rgba(25,25,25,0.80)`     | Card / panel surface               |
| Tier 1 (Bronze)             | `#9e9e9e`                 | Server chassis left-border         |
| Tier 2 (Silver)             | `#26c6da`                 |                                    |
| Tier 3 (Gold)               | `#0af5b0`                 |                                    |
| Tier 4 (Platinum)           | `#ba68c8`                 |                                    |
| Tier 5 (Quantum)            | `#ff9800`                 |                                    |
| Foreground primary          | `rgba(255,255,255,0.87)`  |                                    |
| Foreground secondary        | `rgba(255,255,255,0.60)`  |                                    |
| Border                      | `rgba(255,255,255,0.12)`  |                                    |
| Glow accent (large)         | `0 0 24px rgba(10,245,176,0.4), 0 0 48px rgba(10,245,176,0.2)` |  |

### Typography

- **UI:** Inter 300/400/500/600/700
- **Mono / data:** Fira Code 400/500/600/700 — used for SKUs, IPs, numbers, breadcrumb
- **Terminal:** `ibm_vga` — not used on this page (reserved for terminal screens)
- Body 14–16px, overline 10–11px / `0.16em` tracking / uppercase, H1 38px / 700 / `-0.01em`
- All text rendered with `-webkit-font-smoothing: antialiased` and `text-rendering: optimizeLegibility`

### Spacing (4-step scale)

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48` (px)

### Radius

`sm: 4 · md: 8 · lg: 12 · xl: 16 · pill: 9999`

Cards use 12px (MUI override). Buttons 8px. Chips 9999 (pill).

### Shadows

- `--shadow-card`: `0 2px 12px rgba(0,0,0,0.6)`
- `--shadow-elevated`: `0 4px 24px rgba(0,0,0,0.8)`
- `--glow-accent`: `0 0 12px rgba(10,245,176,0.6)`

### Motion

- Default transition: `225ms cubic-bezier(0,0,0.2,1)` (MUI standard)
- `packetFlow`: 1.2s linear infinite, animates SVG `stroke-dashoffset`
- `statusPulse`: 1.6s — live-dot scale + box-shadow ring
- `dropPulse`: 1.1s — drop-target inset shadow
- `scanX`: 1.6s — shimmer across progress bars
- `ledBlink` / `ledBlink-fast`: 1.4s / 0.4s — chassis LEDs

## Assets

- **`racks_bg.png`** — the dark server-room background scene (included). Apply with a 70-78% black overlay to keep foreground legible.
- **Material Symbols Rounded** — loaded from Google Fonts. Icons used on this page: `terminal · important_devices · storage · apartment · router · public · share · dns · inventory_2 · drag_indicator · add · add_circle · add_business · close · check · hub · lan · ac_unit · bolt · speed · public · settings_ethernet · autorenew · warning · arrow_drop_down · arrow_drop_up`
- **Tier color palette** — already part of the Codebreaker design system, mirrored from the Servers Store page

## Files in This Bundle

| Path                                 | Purpose                                                |
|--------------------------------------|--------------------------------------------------------|
| `Server Racks.html`                  | Entry point — bg, scripts, scanlines overlay           |
| `racks-page.jsx`                     | Page root: header, stat strip, layout, state, picker   |
| `racks-floor.jsx`                    | RackUnit, RackFloor, drop validation (`canPlace`)      |
| `racks-inventory.jsx`                | ServerChip (both modes) + Inventory panel              |
| `racks-topology.jsx`                 | UplinkPanel + NetworkDiagram (SVG) + SwitchRow         |
| `racks-data.jsx`                     | RACK_CATALOG, INITIAL_RACKS, INVENTORY, INITIAL_SWITCHES, tier maps |
| `station-mui.jsx`                    | Hand-rolled MUI primitives (replace with `@mui/material`) |
| `tweaks-panel.jsx`                   | Designer-side controls (do not ship)                   |
| `colors_and_type.css`                | Source of truth for the design tokens above            |
| `racks_bg.png`                       | Scene background                                       |
| `reference/Station v2.html`          | Sibling page for visual consistency reference          |
| `reference/station-page.jsx`         | Sibling page React code                                |

## Implementation Notes

1. **Start with the existing Station V2 React component as your skeleton** — same brand strip, same header pattern, same MUI card vocabulary. The Racks page is the third in a family (Station, Servers, Racks).
2. **Replace the hand-rolled `Mui*` shims with real `@mui/material`** components. Map: `MuiCard → Card`, `MuiCardHeader → CardHeader`, `MuiChip → Chip variant="outlined"`, `MuiButton → Button`, `MuiIconButton → IconButton`, `MuiSelect → Select`. Theme overrides should produce the same `rgba(25,25,25,0.80)` card surface.
3. **Use `@dnd-kit/core`** for drag-and-drop. The drop-zone-per-U pattern maps cleanly to `useDroppable({ id: \`\${rackId}:u\${u}\` })`. The drag preview is the ServerChip itself.
4. **The U-slot grid is the load-bearing layout primitive.** Don't try to use flex/CSS-grid for the rack body — keep the absolute-positioned approach so servers can span multiple Us cleanly and drop math stays simple (`u = clamp(round((y - rackTop) / 22), 1, slots)`).
5. **Persist `selectedDC`** in URL state or localStorage so DC selection survives navigation.
6. **Accessibility:** add keyboard alternatives to drag-and-drop (`@dnd-kit` ships with one), ensure status chips have `aria-live` for uplink state changes, ensure the data center picker is a proper combobox.

## Addendum: Server Hover Tooltip

Hovering an installed server tile reveals a rich tooltip with live operational data. This is the only on-demand detail surface for installed servers — the click action is reserved for selection (outline highlight).

### Rendering

- **Portal-rendered** at `position: fixed` with `z-index: 9998` so it floats above the rack-floor scroll container without being clipped.
- **Tracks cursor**: positioned 16px right and 12px below the cursor; flips to the left/above edge when it would overflow the viewport (clamped 8px from the top).
- **Non-interactive**: `pointer-events: none` — the tooltip never blocks the underlying server tile, so dragging stays smooth.
- **Hidden during drag**: any `onDragStart` on the server tile clears the hover state before the drag preview shows.

### Layout (280px wide)

```
┌─────────────────────────────────┐
│ ▣ GH-560 · 4U          U5       │  ← header (tier-tinted bg)
│   PLATINUM TIER                 │
├─────────────────────────────────┤
│ RACK            INST ID          │  ← 2×2 spec grid
│ Rack A Production  I-03         │
│ POWER           UPTIME           │
│ 1100 W          12d 03h          │
├─────────────────────────────────┤
│ UTILIZATION                62%   │  ← utilization bar
│ ▓▓▓▓▓▓▓▓▓░░░░░░░░             │
├─────────────────────────────────┤
│ </> ACTIVE CIPHERS · 2          │  ← ciphers list
│ ┌─────────────────────────────┐ │
│ │ RSA-2048           ETA 1m   │ │
│ │ ▓▓▓░░░░░░░░░░░░░░░░         │ │
│ │ 22% complete                │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ AES-128            ETA 4s   │ │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░         │ │
│ │ 88% complete                │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

- **Container**: `rgba(18,18,20,0.96)` with `backdrop-filter: blur(8px)`, 8px radius, 1px border tinted to the server's tier color (`${tierColor}55`), `0 16px 48px rgba(0,0,0,0.75)` shadow.
- **Header strip**: `linear-gradient(180deg, ${tierColor}1F, transparent)` background, 24×24 tier-tinted dns-icon avatar, SKU + U-size, tier name in uppercase Fira Code 9px, U-slot number on the right.
- **Spec grid**: 2 columns × 2 rows, 10px / 12px padding. Each cell has a 9px / `0.16em` tracking label and an 11px / 600 value (Fira Code where the value is alphanumeric like the instance ID).
- **Utilization bar**: 6px tall, 3px radius. Value color shifts: `> 85%` → warning orange `#ff9800`; `> 60%` → accent green `#0af5b0`; otherwise `rgba(255,255,255,0.85)`. The bar gets a matching glow (`0 0 8px ${color}99`).
- **Ciphers list**:
  - Section header: `</>` (code icon) + `ACTIVE CIPHERS · N`.
  - Empty state: italic "Idle · awaiting workload" in muted gray.
  - Each cipher row: 6px padding, `rgba(255,255,255,0.04)` background, 1px border, 4px radius. Inside: cipher name (Fira Code 11px, accent green) + ETA (right-aligned, 10px). Below: 3px-tall progress bar (accent green with glow). Below that: "{N}% complete" (Fira Code 9px, muted).

### Cipher data model

```ts
type Cipher = {
  name: string;      // e.g. 'SHA-256', 'RSA-2048', 'AES-128', 'BLAKE2', 'ChaCha20'
  progress: number;  // 0-100
  eta: string;       // human label like '12s', '1m 14s', '8m 12s'
};

type InstalledServer = {
  // ... existing fields
  uptime: string;    // e.g. '6d 14h'
  ciphers: Cipher[]; // may be empty
};
```

Cipher progress should tick from your real backend. The prototype simulates by:
- advancing `progress` by `1 + Math.random() * 3` every 800ms
- on `progress >= 100`, sampling a new cipher from the pool and resetting `progress` to `0–10`

In production, subscribe to the same telemetry stream as the utilization tick and update both. Server uptime should be a computed value from the install timestamp, not stored separately.

### Hover semantics

- Wired via `onMouseEnter` and `onMouseMove` (so the tooltip follows the cursor); `onMouseLeave` clears it.
- Hoist hover state to the **RackFloor** component (one tooltip at a time across the whole floor) — don't put it inside RackUnit, since switching racks needs to keep the tooltip alive but swap content.
- Selection (click) and hover (tooltip) are independent — clicking does not pin or close the tooltip.

### Click vs. hover

- **Hover** → ephemeral tooltip (described here)
- **Click** → selects the server (1px accent outline). In production this could open a side-drawer with full editing/management actions. The prototype just toggles the outline.
