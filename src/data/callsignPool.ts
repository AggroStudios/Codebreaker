export const CALLSIGN_POOL: string[] = [
    'Null_Pointer',
    'PARITY_X',
    'h3xenburg',
    'glitchwitch',
    'kernel.panic',
    'rootkit_jane',
    '0xCascade',
    'SNOWLEOPARD',
    'midnight.fox',
    'EBP_RAIDER',
    'sk1d_marrow',
    'BLUEBIRD',
];

export const RESERVED_CALLSIGNS: ReadonlySet<string> = new Set(['admin', 'phantom', 'h4x0r']);

const CALLSIGN_RE = /^[A-Za-z0-9_.-]+$/;

export type CallsignValidity =
    | { kind: 'empty' }
    | { kind: 'too-short' }
    | { kind: 'invalid-chars' }
    | { kind: 'reserved' }
    | { kind: 'ok' };

export const validateCallsign = (raw: string): CallsignValidity => {
    const trimmed = raw.trim();
    if (trimmed.length === 0) return { kind: 'empty' };
    if (trimmed.length < 3) return { kind: 'too-short' };
    if (!CALLSIGN_RE.test(trimmed)) return { kind: 'invalid-chars' };
    if (RESERVED_CALLSIGNS.has(trimmed.toLowerCase())) return { kind: 'reserved' };
    return { kind: 'ok' };
};

export const randomCallsign = (current: string): string => {
    const choices = CALLSIGN_POOL.filter((c) => c !== current);
    return choices[Math.floor(Math.random() * choices.length)] ?? CALLSIGN_POOL[0];
};
