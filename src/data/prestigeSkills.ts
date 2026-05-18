import {
    AllInclusiveTwoTone,
    AttachMoneyTwoTone,
    AutoFixHighTwoTone,
    AutorenewTwoTone,
    BoltTwoTone,
    CasinoTwoTone,
    ComputerTwoTone,
    ExploreTwoTone,
    FlashOnTwoTone,
    HubTwoTone,
    RemoveRedEyeTwoTone,
    RestartAltTwoTone,
    RocketLaunchTwoTone,
    ShieldTwoTone,
    SmartToyTwoTone,
    SplitscreenTwoTone,
    TrendingUpTwoTone,
    VerifiedTwoTone,
    VisibilityTwoTone,
    VpnKeyTwoTone,
    WorkspacePremiumTwoTone,
} from '@mui/icons-material';

import { Skill } from '../includes/prestige.interface';

export const SKILLS: Skill[] = [
    { id: 'genesis', branch: 'root', x: 800, y: 600, cost: 0, name: 'Genesis',         icon: AutorenewTwoTone,        short: 'CORE',                requires: [],            desc: 'Every prestige cycle awards this node automatically. Anchor for all skill paths.' },

    { id: 'n1', branch: 'N', x: 800, y: 460, cost: 1, name: 'Quick Break',      icon: BoltTwoTone,             short: '+10% CIPHER SPEED',   requires: ['genesis'],   desc: 'Permanently accelerate every cipher break by 10%.' },
    { id: 'n2', branch: 'N', x: 680, y: 320, cost: 2, name: 'Parallel Streams', icon: SplitscreenTwoTone,      short: '+1 CONCURRENT',       requires: ['n1'],        desc: 'Unlocks one additional cipher slot on the Station.' },
    { id: 'n3', branch: 'N', x: 920, y: 320, cost: 2, name: 'Burst Mode',       icon: FlashOnTwoTone,          short: '5× ON FIRST BREAK',   requires: ['n1'],        desc: 'The first cipher each session runs at 5× speed.' },
    { id: 'n4', branch: 'N', x: 800, y: 200, cost: 4, name: 'Quantum Pipelines',icon: RocketLaunchTwoTone,     short: '+20% SPEED',          requires: ['n2', 'n3'],  desc: 'Compounds with Quick Break for total +30% throughput.' },
    { id: 'n5', branch: 'N', x: 800, y:  70, cost: 6, name: 'Singularity',      icon: AllInclusiveTwoTone,     short: 'CAPSTONE — NEVER FAIL', requires: ['n4'],       desc: 'Ciphers can no longer fail. Cancellation refunds full payout.', capstone: true },

    { id: 'e1', branch: 'E', x:  940, y: 600, cost: 1, name: 'Compound Returns', icon: TrendingUpTwoTone,       short: '+15% PAYOUT',         requires: ['genesis'],   desc: 'All cipher payouts increased by 15%.' },
    { id: 'e2', branch: 'E', x: 1080, y: 480, cost: 2, name: 'Risk Tolerance',   icon: VerifiedTwoTone,         short: '+50% ON RSA-2048',    requires: ['e1'],        desc: 'The hardest ciphers pay out an extra 50%.' },
    { id: 'e3', branch: 'E', x: 1080, y: 720, cost: 2, name: 'Insider Trading',  icon: AttachMoneyTwoTone,      short: '2× XP / FIRST HOUR',  requires: ['e1'],        desc: 'Double XP for the first hour of every session.' },
    { id: 'e4', branch: 'E', x: 1200, y: 600, cost: 4, name: 'Black Swan',       icon: CasinoTwoTone,           short: 'RANDOM JACKPOTS',     requires: ['e2', 'e3'],  desc: '1% chance of a 100× payout on any cipher break.' },
    { id: 'e5', branch: 'E', x: 1330, y: 600, cost: 6, name: 'Midas Protocol',   icon: WorkspacePremiumTwoTone, short: 'CAPSTONE — 2× ALL',   requires: ['e4'],        desc: 'All cipher payouts permanently doubled.', capstone: true },

    { id: 's1', branch: 'S', x: 800, y:  740, cost: 1, name: 'Auto-Restart',     icon: RestartAltTwoTone,       short: 'AUTO-QUEUE',          requires: ['genesis'],   desc: 'Completed ciphers automatically restart with the same target.' },
    { id: 's2', branch: 'S', x: 680, y:  880, cost: 2, name: 'Daemon',           icon: ComputerTwoTone,         short: 'OFFLINE EARNINGS',    requires: ['s1'],        desc: 'Continues earning at 50% rate while the tab is closed.' },
    { id: 's3', branch: 'S', x: 920, y:  880, cost: 2, name: 'Smart Queue',      icon: AutoFixHighTwoTone,      short: 'OPTIMAL CIPHER',      requires: ['s1'],        desc: 'Auto-Restart picks the highest-EV cipher available.' },
    { id: 's4', branch: 'S', x: 800, y: 1000, cost: 4, name: 'Hivemind',         icon: HubTwoTone,              short: '+100% OFFLINE',       requires: ['s2', 's3'],  desc: 'Offline earnings rate raised to 100% of online rate.' },
    { id: 's5', branch: 'S', x: 800, y: 1130, cost: 6, name: 'Ghost in the Machine', icon: SmartToyTwoTone,     short: 'CAPSTONE — FULL AUTO', requires: ['s4'],       desc: 'Full autoplay: purchases, upgrades, and prestige decisions can be automated.', capstone: true },

    { id: 'w1', branch: 'W', x: 660, y: 600, cost: 1, name: 'Recon',            icon: VisibilityTwoTone,       short: 'EARLY DARK WEB',      requires: ['genesis'],   desc: 'Reveals one additional dark-web cipher per cycle.' },
    { id: 'w2', branch: 'W', x: 520, y: 480, cost: 2, name: 'Mapper',           icon: ExploreTwoTone,          short: 'SEE HIDDEN NODES',    requires: ['w1'],        desc: 'Reveals hidden upgrades and unlocks in advance.' },
    { id: 'w3', branch: 'W', x: 520, y: 720, cost: 2, name: 'Backdoor',         icon: VpnKeyTwoTone,           short: '-1 LVL REQ',          requires: ['w1'],        desc: 'Reduces prestige level requirement by 1 every cycle.' },
    { id: 'w4', branch: 'W', x: 400, y: 600, cost: 4, name: 'Stealth',          icon: ShieldTwoTone,           short: 'NO DETECTION',        requires: ['w2', 'w3'],  desc: 'Threat events ignored. No detection penalties on dark web ops.' },
    { id: 'w5', branch: 'W', x: 270, y: 600, cost: 6, name: 'Phantom Override', icon: RemoveRedEyeTwoTone,     short: 'CAPSTONE — GHOST OP', requires: ['w4'],        desc: 'Bypass any access gate. Instantly complete one cipher per cycle.', capstone: true },
];

export const SKILLS_BY_ID: Record<string, Skill> = Object.fromEntries(
    SKILLS.map((s) => [s.id, s]),
);

export const TOTAL_SKILL_COST = SKILLS.reduce((sum, s) => sum + s.cost, 0);
