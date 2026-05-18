import { IDarkWebFaction, ReputationTiers, RiskTier } from '../includes/DarkWeb.interface';
import { CipherTypes } from './cipherList';

export const darkWebFactions: IDarkWebFaction[] = [
    {
        id: 'pale-circuit',
        name: 'Pale Circuit',
        handle: '@pale_circuit',
        glyph: 'Memory',
        color: {
            color: '#0af5b0',
            className: 'accent',
        },
        region: 'EU-WEST',
        blurb: 'Old-guard zine collective. Buys low-tier hashes by the bushel for archival drops.',
        reputation: {
            reputation: 1820,
            reputationTier: ReputationTiers.Trusted,
        },
        riskTier: RiskTier.low,
        online: true,
        bonus: [
            {
                cipher: CipherTypes.find((c) => c.name === 'CRC-32'),
                multiplier: 1.05,
            },
            {
                cipher: CipherTypes.find((c) => c.name === 'MD5'),
                multiplier: 1.15,
            }
        ],
        acceptedCiphers: CipherTypes.filter((c) => c.complexity < 1.8),
        lastActivity: '2026-05-04T12:00:00Z'
    },
    {
        id: 'null-syndicate',
        name: 'Null Syndicate',
        handle: '@null_syn',
        glyph: 'SecurityOutlined',
        color: {
            color: '#26c6da',
            className: 'cyan',
        },
        region: 'NA-EAST',
        blurb: 'Ransomware brokers. Premium for SHA-class blocks. Slow to respond, no chatter.',
        reputation: {
            reputation: 4120,
            reputationTier: ReputationTiers.Insider,
        },
        riskTier: RiskTier.medium,
        online: true,
        acceptedCiphers: CipherTypes.filter((c) => c.complexity >= 1.8),
        lastActivity: '2026-05-04T12:00:00Z'
    },
    {
        id: 'redline-cartel',
        name: 'Redline Cartel',
        handle: '@redline_cc',
        glyph: 'LocalFireDepartmentOutlined',
        color: {
            color: '#ff5f6d',
            className: 'red',
        },
        region: 'SA-SOUTH',
        blurb: 'High volume, high heat. Will overpay for AES blocks but flags increase intrusion alerts.',
        reputation: {
            reputation: 640,
            reputationTier: ReputationTiers.Contact,
        },
        riskTier: RiskTier.high,
        online: true,
        acceptedCiphers: CipherTypes.filter((c) => c.complexity >= 2.5),
        lastActivity: '2026-05-04T12:00:00Z'
    },
    {
        id: 'ghost-collective',
        name: 'Ghost Collective',
        handle: '@gh0st_collective',
        glyph: 'VisibilityOffOutlined',
        color: {
            color: '#9c7fe0',
            className: 'purple',
        },
        region: 'AC-PAC',
        blurb: 'Hacking collective. Buys any cipher for cash, pays in crypto.',
        reputation: {
            reputation: 2200,
            reputationTier: ReputationTiers.Unknown,
        },
        riskTier: RiskTier.low,
        online: true,
        acceptedCiphers: CipherTypes,
        lastActivity: '2026-05-04T12:00:00Z'
    },
    {
        id: 'iron-protocol',
        name: 'Iron Protocol',
        handle: '@ironproto',
        glyph: 'GavelRounded',
        color: {
            color: '#ffb74d',
            className: 'orange',
        },
        region: 'EU-EAST',
        blurb: 'State-adjacent buyers. Will only deal in RSA-2048 and above. Harsh penalties for failed handoffs.',
        reputation: {
            reputation: 3340,
            reputationTier: ReputationTiers.Insider,
        },
        riskTier: RiskTier.high,
        online: true,
        bonus: [
            {
                cipher: CipherTypes.find((c) => c.name === 'RSA-1024'),
                multiplier: 1.15,
            },
            {
                cipher: CipherTypes.find((c) => c.name === 'RSA-2048'),
                multiplier: 1.35,
            }
        ],
        acceptedCiphers: CipherTypes.filter((c) => c.complexity >= 3.2),
        lastActivity: '2026-05-04T12:00:00Z'
    },
    {
        id: 'driftnet',
        name: 'Driftnet',
        handle: '@driftnet',
        glyph: 'HubOutlined',
        color: {
            color: '#61dafb',
            className: 'blue',
        },
        region: 'GLOBAL',
        blurb: 'Aggregator bot - fair market rates, instant settlement, no relationship building.',
        reputation: {
            reputation: 980,
            reputationTier: ReputationTiers.Associate,
        },
        riskTier: RiskTier.low,
        online: false,
        acceptedCiphers: CipherTypes,
        lastActivity: '2026-05-04T12:00:00Z'
    },
]