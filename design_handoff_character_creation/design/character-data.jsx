/* global */
// Three starter hacker profiles, balanced as a rock-paper-scissors triangle:
// CIPHERWRIGHT (crypto/intellect) · OPERATOR (hardware/economy) · PHANTOM (stealth/social)

const HACKER_PROFILES = [
  {
    id: 'cipherwright',
    callsign: 'CIPHERWRIGHT',
    realName: 'Dr. M. Vance',
    classification: 'CRYPTOLOGIST · CLASS-A',
    glyph: 'function',          // material symbol
    portraitId: 'CW-01',
    accent: '#0af5b0',
    accentSoft: 'rgba(10,245,176,0.14)',
    accentEdge: 'rgba(10,245,176,0.36)',
    difficulty: 2,
    tagline: 'Reads block ciphers like sheet music.',
    bio:
      'Tenured at a research lab until a leaked paper on lattice attacks ' +
      'ended that career overnight. Now sells decryption time on the gray ' +
      'market, one elegant proof at a time. Prefers a quiet workstation, ' +
      'a fresh notebook, and adversaries who underestimate mathematics.',
    stats: {
      cryptography: 92,
      hardware:     48,
      stealth:      55,
      networking:   60,
    },
    perks: [
      { icon: 'speed',       label: '+25% Cipher Cycle Speed',      desc: 'Workloads on SHA-2 and stronger complete faster.' },
      { icon: 'school',      label: '+50% Neural Net XP',           desc: 'Training runs gain bonus experience per epoch.' },
      { icon: 'auto_fix_high', label: 'Free re-roll on first 3 cracks', desc: 'Restart a stalled cipher cycle without penalty.' },
      { icon: 'workspaces',  label: 'Starts with Tier-2 SKU access', desc: 'Marketplace unlocks Cipher Engine SKUs from day one.' },
    ],
    startingKit: [
      { icon: 'memory',           name: 'AX-220 Cipher Engine',  qty: '×1',     meta: 'T2 · 16c/32t' },
      { icon: 'account_balance_wallet', name: 'Seed Wallet',      qty: '$8,400', meta: 'fiat balance' },
      { icon: 'token',            name: 'Lattice Reference Set',  qty: '×3',     meta: 'consumable hints' },
      { icon: 'menu_book',        name: 'Academic Backchannel',   qty: 'unlock', meta: 'rare cipher feed' },
    ],
    signature: {
      name:     'Eureka',
      cooldown: '6h',
      desc:
        'Instantly resolves one active cipher cycle of complexity ≤ 12 ' +
        'and refunds 50% of its power cost.',
      icon: 'lightbulb',
    },
    recommended: ['Idle / long sessions', 'Neural Net builds', 'Solo prestige runs'],
  },

  {
    id: 'operator',
    callsign: 'THE OPERATOR',
    realName: 'K. Sato',
    classification: 'INFRASTRUCTURE · CLASS-B',
    glyph: 'developer_board',
    portraitId: 'OP-04',
    accent: '#26c6da',
    accentSoft: 'rgba(38,198,218,0.14)',
    accentEdge: 'rgba(38,198,218,0.36)',
    difficulty: 1,
    tagline: 'Owns more rack space than most ISPs.',
    bio:
      'Cut their teeth re-soldering BGA chips in the back of a shipping ' +
      'container in Kawasaki. Knows every power-supply ripple by ear and ' +
      'has never paid retail for a server. Plays the long game — buy low, ' +
      'overclock smart, sell when the market peaks.',
    stats: {
      cryptography: 50,
      hardware:     94,
      stealth:      40,
      networking:   72,
    },
    perks: [
      { icon: 'sell',          label: '−15% Marketplace Prices',     desc: 'All Tier 1–3 servers cost less to acquire.' },
      { icon: 'storage',       label: '+4 Free Rack Slots',          desc: 'Begin with a 28-slot rack instead of 24.' },
      { icon: 'bolt',          label: '−20% Power Draw',             desc: 'Every owned node consumes less wattage.' },
      { icon: 'autorenew',     label: 'Free Daily Restart',          desc: 'One node per day can be restarted with zero downtime.' },
    ],
    startingKit: [
      { icon: 'memory',           name: 'R210-II Rack Unit',     qty: '×2',     meta: 'T1 · 8c/16t each' },
      { icon: 'account_balance_wallet', name: 'Seed Wallet',      qty: '$12,200', meta: 'fiat balance' },
      { icon: 'inventory_2',      name: 'Spare Parts Bin',       qty: '×6',     meta: 'consumable repairs' },
      { icon: 'handyman',         name: 'Workshop License',      qty: 'unlock', meta: 'crafting bench' },
    ],
    signature: {
      name:     'Cold Boot',
      cooldown: '4h',
      desc:
        'Brings every offline node back to 100% utilization for 5 minutes ' +
        'with zero power penalty.',
      icon: 'flash_on',
    },
    recommended: ['Beginners', 'Active play', 'Marketplace flips'],
  },

  {
    id: 'phantom',
    callsign: 'PHANTOM',
    realName: 'unknown',
    classification: 'SOCIAL ENGINEER · CLASS-S',
    glyph: 'visibility_off',
    portraitId: 'PH-??',
    accent: '#ff9800',
    accentSoft: 'rgba(255,152,0,0.14)',
    accentEdge: 'rgba(255,152,0,0.40)',
    difficulty: 4,
    tagline: 'Has been everyone. Has never been caught.',
    bio:
      'Authorities aren\'t sure if Phantom is one person or a rotating ' +
      'collective. What they know: a string of unrelated executives have ' +
      'handed over root credentials, smiled, and forgotten the conversation. ' +
      'The dark web treats them like weather — unpredictable and inevitable.',
    stats: {
      cryptography: 55,
      hardware:     45,
      stealth:      96,
      networking:   80,
    },
    perks: [
      { icon: 'storefront',   label: 'Dark Web Insider Pricing',     desc: '−25% on black-market listings, +15% on resales.' },
      { icon: 'visibility_off', label: '−40% Heat Generation',       desc: 'Stealth missions raise far less suspicion.' },
      { icon: 'travel_explore', label: '+2 Daily Bounty Slots',      desc: 'Extra contract slots in the Dark Web feed.' },
      { icon: 'psychology',    label: 'Social Engineering Tree',     desc: 'Unique perk tree unlocked at Prestige 1.' },
    ],
    startingKit: [
      { icon: 'usb',                 name: 'Burner Rig (Onion-7)',   qty: '×1',     meta: 'T1 · stealth-tuned' },
      { icon: 'account_balance_wallet', name: 'Crypto Wallet',       qty: '$5,800', meta: 'untraceable' },
      { icon: 'qr_code_2',           name: 'False Identity Pack',    qty: '×5',     meta: 'consumable disguises' },
      { icon: 'forum',               name: 'Encrypted Backchannel',  qty: 'unlock', meta: 'private contracts' },
    ],
    signature: {
      name:     'Ghostwalk',
      cooldown: '8h',
      desc:
        'Run any single mission with 0% heat and double payout. ' +
        'Cannot be detected, logged, or replayed.',
      icon: 'dark_mode',
    },
    recommended: ['Advanced players', 'High-risk runs', 'Dark Web mains'],
  },
];

const STAT_KEYS = [
  { key: 'cryptography', label: 'CRYPTOGRAPHY', icon: 'function' },
  { key: 'hardware',     label: 'HARDWARE',     icon: 'developer_board' },
  { key: 'stealth',      label: 'STEALTH',      icon: 'visibility_off' },
  { key: 'networking',   label: 'NETWORKING',   icon: 'lan' },
];

window.HACKER_PROFILES = HACKER_PROFILES;
window.STAT_KEYS = STAT_KEYS;
