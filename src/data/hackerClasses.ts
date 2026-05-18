import {
    AccountBalanceWalletTwoTone,
    AutorenewTwoTone,
    AutoFixHighTwoTone,
    BoltTwoTone,
    DarkModeTwoTone,
    DeveloperBoardTwoTone,
    FlashOnTwoTone,
    ForumTwoTone,
    FunctionsTwoTone,
    HandymanTwoTone,
    Inventory2TwoTone,
    LightbulbTwoTone,
    MemoryTwoTone,
    MenuBookTwoTone,
    PsychologyTwoTone,
    QrCode2TwoTone,
    SchoolTwoTone,
    SellTwoTone,
    SpeedTwoTone,
    StorageTwoTone,
    StorefrontTwoTone,
    TokenTwoTone,
    TravelExploreTwoTone,
    UsbTwoTone,
    VisibilityOffTwoTone,
    WorkspacesTwoTone,
} from '@mui/icons-material';

import { HackerClass } from '../includes/Character.interface';

export const HACKER_CLASSES: HackerClass[] = [
    {
        id: 'cipherwright',
        callsign: 'CIPHERWRIGHT',
        realName: 'Dr. M. Vance',
        classification: 'CRYPTOLOGIST · CLASS-A',
        glyph: FunctionsTwoTone,
        portraitId: 'CW-01',
        accent: '#0af5b0',
        accentSoft: 'rgba(10,245,176,0.14)',
        accentEdge: 'rgba(10,245,176,0.36)',
        difficulty: 2,
        tagline: 'Reads block ciphers like sheet music.',
        bio:
            'Tenured cryptologist who walked away from a department that wouldn\'t publish their lattice-attack work. ' +
            'Built a private rig over a weekend and never looked back. Treats every new cipher as a puzzle to be ' +
            'admired, then dismantled — the cleaner the proof, the better.',
        stats: { cryptography: 92, hardware: 48, stealth: 55, networking: 60 },
        perks: [
            { icon: SpeedTwoTone,        label: '+25% Cipher Cycle Speed',     desc: 'Workloads on SHA-2 and stronger complete faster.' },
            { icon: SchoolTwoTone,       label: '+50% Neural Net XP',          desc: 'Training runs gain bonus experience per epoch.' },
            { icon: AutoFixHighTwoTone,  label: 'Free re-roll on first 3 cracks', desc: 'Restart a stalled cipher cycle without penalty.' },
            { icon: WorkspacesTwoTone,   label: 'Starts with Tier-2 SKU access', desc: 'Marketplace unlocks Cipher Engine SKUs from day one.' },
        ],
        startingKit: [
            { icon: MemoryTwoTone,                 name: 'AX-220 Cipher Engine',   qty: '×1',     meta: 'T2 · 16c/32t' },
            { icon: AccountBalanceWalletTwoTone,   name: 'Seed Wallet',            qty: '$8,400', meta: 'fiat balance' },
            { icon: TokenTwoTone,                  name: 'Lattice Reference Set',  qty: '×3',     meta: 'consumable hints' },
            { icon: MenuBookTwoTone,               name: 'Academic Backchannel',   qty: 'unlock', meta: 'rare cipher feed' },
        ],
        signature: {
            name: 'Eureka',
            cooldown: '6h',
            icon: LightbulbTwoTone,
            desc: 'Instantly resolves one active cipher cycle of complexity ≤ 12 and refunds 50% of its power cost.',
        },
        recommended: ['Idle / long sessions', 'Neural Net builds', 'Solo prestige runs'],
        startingWallet: 8400,
    },
    {
        id: 'operator',
        callsign: 'THE OPERATOR',
        realName: 'K. Sato',
        classification: 'INFRASTRUCTURE · CLASS-B',
        glyph: DeveloperBoardTwoTone,
        portraitId: 'OP-04',
        accent: '#26c6da',
        accentSoft: 'rgba(38,198,218,0.14)',
        accentEdge: 'rgba(38,198,218,0.36)',
        difficulty: 1,
        tagline: 'Owns more rack space than most ISPs.',
        bio:
            'Spent twelve years racking gear for a Fortune 500 backbone before quitting in the middle of an outage. ' +
            'Took the runbooks and the spare parts bin. Believes the cheapest solve is always more iron, more uplink, ' +
            'and a clean cable run.',
        stats: { cryptography: 50, hardware: 94, stealth: 40, networking: 72 },
        perks: [
            { icon: SellTwoTone,      label: '−15% Marketplace Prices', desc: 'All Tier 1–3 servers cost less to acquire.' },
            { icon: StorageTwoTone,   label: '+4 Free Rack Slots',      desc: 'Begin with a 28-slot rack instead of 24.' },
            { icon: BoltTwoTone,      label: '−20% Power Draw',         desc: 'Every owned node consumes less wattage.' },
            { icon: AutorenewTwoTone, label: 'Free Daily Restart',      desc: 'One node per day can be restarted with zero downtime.' },
        ],
        startingKit: [
            { icon: MemoryTwoTone,                 name: 'R210-II Rack Unit',  qty: '×2',      meta: 'T1 · 8c/16t each' },
            { icon: AccountBalanceWalletTwoTone,   name: 'Seed Wallet',        qty: '$12,200', meta: 'fiat balance' },
            { icon: Inventory2TwoTone,             name: 'Spare Parts Bin',    qty: '×6',      meta: 'consumable repairs' },
            { icon: HandymanTwoTone,               name: 'Workshop License',   qty: 'unlock',  meta: 'crafting bench' },
        ],
        signature: {
            name: 'Cold Boot',
            cooldown: '4h',
            icon: FlashOnTwoTone,
            desc: 'Brings every offline node back to 100% utilization for 5 minutes with zero power penalty.',
        },
        recommended: ['Beginners', 'Active play', 'Marketplace flips'],
        startingWallet: 12200,
    },
    {
        id: 'phantom',
        callsign: 'PHANTOM',
        realName: 'unknown',
        classification: 'SOCIAL ENGINEER · CLASS-S',
        glyph: VisibilityOffTwoTone,
        portraitId: 'PH-??',
        accent: '#ff9800',
        accentSoft: 'rgba(255,152,0,0.14)',
        accentEdge: 'rgba(255,152,0,0.40)',
        difficulty: 4,
        tagline: 'Has been everyone. Has never been caught.',
        bio:
            'No verified identity. Has surfaced under four different passports and at least nine cover companies. ' +
            'Specialises in pulling secrets out of the humans nearest to them, not the silicon. Treats the dark web ' +
            'like a regular grocery store — frequent, predictable, anonymous.',
        stats: { cryptography: 55, hardware: 45, stealth: 96, networking: 80 },
        perks: [
            { icon: StorefrontTwoTone,    label: 'Dark Web Insider Pricing', desc: '−25% on black-market listings, +15% on resales.' },
            { icon: VisibilityOffTwoTone, label: '−40% Heat Generation',     desc: 'Stealth missions raise far less suspicion.' },
            { icon: TravelExploreTwoTone, label: '+2 Daily Bounty Slots',    desc: 'Extra contract slots in the Dark Web feed.' },
            { icon: PsychologyTwoTone,    label: 'Social Engineering Tree',  desc: 'Unique perk tree unlocked at Prestige 1.' },
        ],
        startingKit: [
            { icon: UsbTwoTone,                    name: 'Burner Rig (Onion-7)', qty: '×1',     meta: 'T1 · stealth-tuned' },
            { icon: AccountBalanceWalletTwoTone,   name: 'Crypto Wallet',        qty: '$5,800', meta: 'untraceable' },
            { icon: QrCode2TwoTone,                name: 'False Identity Pack',  qty: '×5',     meta: 'consumable disguises' },
            { icon: ForumTwoTone,                  name: 'Encrypted Backchannel',qty: 'unlock', meta: 'private contracts' },
        ],
        signature: {
            name: 'Ghostwalk',
            cooldown: '8h',
            icon: DarkModeTwoTone,
            desc: 'Run any single mission with 0% heat and double payout. Cannot be detected, logged, or replayed.',
        },
        recommended: ['Advanced players', 'High-risk runs', 'Dark Web mains'],
        startingWallet: 5800,
    },
];

export const HACKER_CLASS_BY_ID: Record<string, HackerClass> = Object.fromEntries(
    HACKER_CLASSES.map((c) => [c.id, c]),
);
