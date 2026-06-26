import { Message } from '../includes/OperatingSystem.interface';

const MIN = 60_000;
const HR = 60 * MIN;
const ago = (ms: number) => new Date(Date.now() - ms);

/**
 * Sample faction-mail used to preview the SECURE_COMMS modal until the real
 * message pipeline emits this metadata. These are full store `Message`s (with
 * the optional faction-mail fields populated), so they flow through the same
 * `toFactionMessage` adapter as real inbox messages. The modal falls back to
 * this set when the player's inbox is empty.
 *
 * Includes encrypted and sealed transmissions, attachments, and every body
 * block type. Faction ids mirror the real registry (data/darkWebFactions.ts).
 */
export const SAMPLE_MESSAGES: Message[] = [
    {
        sender: 'Null Syndicate',
        factionId: 'null-syndicate',
        from: 'broker.07',
        subject: 'Re: SHA-256 block · counter-offer',
        preview:
            'Your last drop cleared. We can move another 14 at +18% if you can deliver before the next routing rotation…',
        body: 'Your last drop cleared the wash without a single flag. We can move another 14× SHA-256 blocks at +18% over standard.',
        date: ago(14 * MIN),
        unread: true,
        flagged: true,
        encrypted: true,
        priority: 'high',
        cipher: 'AES-256-GCM',
        hops: 7,
        fingerprint: '0x91F4 · CB07 · 1A3D',
        attachments: [
            { name: 'contract_07f9.crypt', size: '4.2 KB', kind: 'contract' },
            { name: 'route_table.b64', size: '1.1 KB', kind: 'data' },
        ],
        bodyBlocks: [
            { type: 'line', text: 'Operator,' },
            {
                type: 'para',
                text: 'Your last drop cleared the wash without a single flag — clean work. The Syndicate is opening a follow-on window. We can move another 14× SHA-256 blocks at +18% over standard, settlement on receipt, no escrow.',
            },
            {
                type: 'para',
                text: 'Condition: delivery must clear before the next routing rotation. We push the new rendezvous schedule at 03:00 UTC. Miss it and the rate drops back to baseline.',
            },
            {
                type: 'callout',
                label: 'OFFER',
                text: '14 × SHA-256 · $755.20 ea · +18% bonus · $10,572.80 total',
            },
            { type: 'para', text: 'Reply with INTENT and a window. Do not include identifiers in plaintext.' },
            { type: 'sig', text: '— broker.07' },
            { type: 'sig', text: 'NULL_SYN · onion://7f2a…q4cv.onion' },
        ],
    },
    {
        sender: 'Iron Protocol',
        factionId: 'iron-protocol',
        from: 'overseer.iv',
        subject: 'RSA-2048 procurement order #IRP-22-118',
        preview:
            'A standing order is open for RSA-2048 blocks. Reputation gate: TRUSTED. Penalty for failed handoff: 320 REP and channel cooldown…',
        body: 'A standing procurement order is open for RSA-2048 cipher blocks. The Protocol pays ×1.65 above standard rate.',
        date: ago(1 * HR),
        unread: true,
        flagged: true,
        encrypted: true,
        priority: 'high',
        cipher: 'AES-256-GCM',
        hops: 9,
        fingerprint: '0xE2C8 · 4471 · 9F0A',
        attachments: [{ name: 'IRP-22-118.signed', size: '8.7 KB', kind: 'contract' }],
        bodyBlocks: [
            { type: 'line', text: 'Operator file ref: 0xA3-91F4-CB07' },
            {
                type: 'para',
                text: 'A standing procurement order is open for RSA-2048 cipher blocks. The Protocol pays ×1.65 above standard rate. Reputation gate: TRUSTED or higher.',
            },
            {
                type: 'callout',
                label: 'TERMS',
                text: 'Min lot 1 · Max lot 4 per rotation · Settlement in two parts · Penalty for failed handoff: 320 REP and 72h channel cooldown.',
            },
            { type: 'para', text: 'Acknowledge with COMMIT and a quantity. Acknowledgement is binding.' },
            { type: 'sig', text: '— overseer.iv · Iron Protocol procurement' },
        ],
    },
    {
        sender: 'Redline Cartel',
        factionId: 'redline-cartel',
        from: 'kx.flare',
        subject: '!! heat advisory — pause AES drops',
        preview:
            'Three of our handlers got tagged this morning. Sweep is hot. Stand down on AES until we send the all-clear…',
        body: 'Three of our handlers got tagged this morning. Stand down on AES drops until we push the all-clear.',
        date: ago(2 * HR),
        unread: true,
        flagged: false,
        encrypted: false,
        warning: true,
        priority: 'high',
        cipher: 'AES-128-CBC',
        hops: 4,
        fingerprint: '0xC7B1 · 22DD · 31E4',
        attachments: [],
        bodyBlocks: [
            {
                type: 'para',
                text: 'Three of our handlers got tagged this morning. Sweep is hot — somebody upstream is selling routes.',
            },
            {
                type: 'warn',
                text: 'STAND DOWN on AES drops until we push the all-clear. Anyone moving inventory through Redline channels in the next 6h gets burned.',
            },
            {
                type: 'para',
                text: 'If you have an open quote, we will honor it at +0% premium once the lane reopens. Sit tight.',
            },
            { type: 'sig', text: '— kx.flare' },
        ],
    },
    {
        sender: 'Pale Circuit',
        factionId: 'pale-circuit',
        from: 'archivist',
        subject: 'archive request · CRC-32 bulk',
        preview:
            'Looking to absorb 200+ CRC-32 blocks for the quarterly mirror. Standard rate. Slow lane. Reputation rebate enclosed…',
        body: 'Quarterly mirror window opens in 36h. We are absorbing CRC-32 blocks at standard rate with a +5% reputation rebate for orders of 100+.',
        date: ago(5 * HR),
        unread: false,
        encrypted: true,
        priority: 'normal',
        cipher: 'ChaCha20-Poly1305',
        hops: 5,
        fingerprint: '0x4A91 · 7E22 · 30B8',
        attachments: [{ name: 'rebate_q3.crypt', size: '0.9 KB', kind: 'data' }],
        bodyBlocks: [
            {
                type: 'para',
                text: 'Quarterly mirror window opens in 36h. We are absorbing CRC-32 blocks at standard rate, no haggling — but a +5% rebate posts to your reputation balance for orders of 100+.',
            },
            { type: 'para', text: 'No rush. This lane is intentionally slow. Drop when convenient.' },
            { type: 'sig', text: '— archivist · Pale Circuit' },
        ],
    },
    {
        sender: 'Ghost Collective',
        factionId: 'ghost-collective',
        from: '∅',
        subject: '[encrypted block — awaiting proof]',
        preview: '████ ████████ ████ ███████ ██ ████ ███████ ████████ ███████ ████ ████████████ █████████…',
        body: 'This message is sealed. Ghost Collective requires proof-of-skill before transmission decrypts.',
        date: ago(7 * HR),
        unread: true,
        encrypted: true,
        locked: true,
        priority: 'normal',
        cipher: 'XChaCha20 + ECDH-X25519',
        hops: 12,
        fingerprint: '—',
        attachments: [{ name: 'proof_request.bin', size: '12.4 KB', kind: 'challenge' }],
        bodyBlocks: [
            {
                type: 'locked',
                text: 'This message is sealed. Ghost Collective requires proof-of-skill before transmission decrypts.',
            },
            {
                type: 'para',
                text: 'Solve the embedded challenge in proof_request.bin to retrieve the message body. Failure consumes the channel and resets reputation with this group.',
            },
        ],
    },
    {
        sender: 'Driftnet',
        factionId: 'driftnet',
        from: 'bot.market',
        subject: 'auto-quote · daily market snapshot',
        preview:
            'MD5 ×1.02 · SHA-1 ×0.98 · SHA-256 ×1.04 · AES-128 ×1.11 · RSA-2048 ×0.96. No relationship credit applied…',
        body: 'Daily market snapshot. Driftnet does not negotiate; these rates are live for the next rotation.',
        date: ago(9 * HR),
        unread: false,
        encrypted: false,
        priority: 'low',
        cipher: 'TLS 1.3',
        hops: 1,
        fingerprint: '0x0000 · BOT · AUTO',
        attachments: [],
        bodyBlocks: [
            {
                type: 'para',
                text: 'Daily market snapshot. Driftnet does not negotiate; these rates are live for the next rotation.',
            },
            {
                type: 'table',
                rows: [
                    ['MD5', '×1.02', '+0.4%'],
                    ['SHA-1', '×0.98', '-1.1%'],
                    ['SHA-256', '×1.04', '+2.0%'],
                    ['AES-128', '×1.11', '+5.6%'],
                    ['RSA-2048', '×0.96', '-2.8%'],
                ],
            },
            { type: 'sig', text: '— driftnet.aggregator · auto-issued' },
        ],
    },
    {
        sender: 'Iron Protocol',
        factionId: 'iron-protocol',
        from: 'overseer.iv',
        subject: 'reputation tier raised → INSIDER',
        preview:
            'Your standing with Iron Protocol has crossed 3000 REP. Additional contract lanes unlocked. See attached benefits sheet…',
        body: 'Your standing with Iron Protocol has crossed 3000 REP. Tier raised to INSIDER. Contract lanes 4 and 5 are now available.',
        date: ago(30 * HR),
        unread: false,
        encrypted: true,
        priority: 'normal',
        cipher: 'AES-256-GCM',
        hops: 9,
        fingerprint: '0xE2C8 · 4471 · 9F0A',
        attachments: [{ name: 'tier_INSIDER.pdf.crypt', size: '14.0 KB', kind: 'data' }],
        bodyBlocks: [
            {
                type: 'para',
                text: 'Your standing with Iron Protocol has crossed 3000 REP. Tier raised to INSIDER. Contract lanes 4 and 5 are now available. Penalty schedule unchanged.',
            },
            { type: 'sig', text: '— overseer.iv' },
        ],
    },
    {
        sender: 'Pale Circuit',
        factionId: 'pale-circuit',
        from: 'archivist',
        subject: 'thanks for the MD5 lot',
        preview: "Clean handoff, properly versioned. You're on the short list for the mirror sync. No action needed…",
        body: 'Clean handoff, properly versioned. You are on the short list for the mirror sync. No action needed.',
        date: ago(28 * HR),
        unread: false,
        encrypted: false,
        priority: 'low',
        cipher: 'ChaCha20-Poly1305',
        hops: 5,
        fingerprint: '0x4A91 · 7E22 · 30B8',
        attachments: [],
        bodyBlocks: [
            {
                type: 'para',
                text: 'Clean handoff, properly versioned. You are on the short list for the mirror sync. No action needed.',
            },
            { type: 'sig', text: '— archivist' },
        ],
    },
    {
        sender: 'Null Syndicate',
        factionId: 'null-syndicate',
        from: 'broker.07',
        subject: 'channel test',
        preview: 'ack',
        body: 'ack',
        date: ago(2 * 24 * HR + HR),
        unread: false,
        encrypted: true,
        priority: 'low',
        cipher: 'AES-256-GCM',
        hops: 7,
        fingerprint: '0x91F4 · CB07 · 1A3D',
        attachments: [],
        bodyBlocks: [
            { type: 'para', text: 'ack' },
            { type: 'sig', text: '— broker.07' },
        ],
    },
];
