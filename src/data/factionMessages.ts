import InboxTwoTone from '@mui/icons-material/InboxTwoTone';
import PriorityHighTwoTone from '@mui/icons-material/PriorityHighTwoTone';
import DescriptionTwoTone from '@mui/icons-material/DescriptionTwoTone';
import LockTwoTone from '@mui/icons-material/LockTwoTone';
import EditNoteTwoTone from '@mui/icons-material/EditNoteTwoTone';
import SendTwoTone from '@mui/icons-material/SendTwoTone';
import ArchiveTwoTone from '@mui/icons-material/ArchiveTwoTone';
import LocalFireDepartmentTwoTone from '@mui/icons-material/LocalFireDepartmentTwoTone';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap } from '@mui/material/SvgIcon';

import { darkWebFactions } from './darkWebFactions';
import { IDarkWebFaction } from '../includes/DarkWeb.interface';
import { Message } from '../includes/OperatingSystem.interface';
import { FactionMessage } from '../includes/messages.interface';

type SvgIcon = OverridableComponent<SvgIconTypeMap<object, 'svg'>>;

export interface MessageFolder {
    id: string;
    label: string;
    icon: SvgIcon;
    /** Filters the thread list. Folders without a predicate stay empty for now. */
    filter?: (m: FactionMessage) => boolean;
}

export const MESSAGE_FOLDERS: MessageFolder[] = [
    { id: 'inbox', label: 'Inbox', icon: InboxTwoTone, filter: () => true },
    { id: 'flagged', label: 'Flagged', icon: PriorityHighTwoTone, filter: (m) => m.flagged },
    {
        id: 'contracts',
        label: 'Contracts',
        icon: DescriptionTwoTone,
        filter: (m) => m.attachments.some((a) => a.kind === 'contract'),
    },
    { id: 'encrypted', label: 'Encrypted', icon: LockTwoTone, filter: (m) => m.encrypted },
    { id: 'drafts', label: 'Drafts', icon: EditNoteTwoTone, filter: () => false },
    { id: 'sent', label: 'Sent', icon: SendTwoTone, filter: () => false },
    { id: 'archive', label: 'Archive', icon: ArchiveTwoTone, filter: () => false },
    { id: 'burned', label: 'Burned', icon: LocalFireDepartmentTwoTone, filter: () => false },
];

export const factionById = (id: string | null): IDarkWebFaction | undefined =>
    id ? darkWebFactions.find((f) => f.id === id) : undefined;

/** Resolves a flat message `sender` string to a dark-web faction, if one matches. */
const resolveFaction = (sender: string): IDarkWebFaction | undefined => {
    const needle = sender.trim().toLowerCase();
    if (!needle) return undefined;
    const handle = needle.replace(/^@/, '');
    return darkWebFactions.find(
        (f) =>
            f.id === needle ||
            f.name.toLowerCase() === needle ||
            f.handle.toLowerCase() === needle ||
            f.handle.toLowerCase().replace(/^@/, '') === handle,
    );
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Relative phrase for the envelope header, e.g. `14 min ago`. */
export const relativeTime = (date: Date): string => {
    const diff = Date.now() - date.getTime();
    if (!Number.isFinite(diff) || diff < 0) return 'just now';
    if (diff < MINUTE) return 'just now';
    if (diff < HOUR) {
        const m = Math.floor(diff / MINUTE);
        return `${m} min ago`;
    }
    if (diff < DAY) {
        const h = Math.floor(diff / HOUR);
        return `${h} hr ago`;
    }
    if (diff < 2 * DAY) return 'yesterday';
    return `${Math.floor(diff / DAY)} days ago`;
};

/** Compact stamp for the thread row, e.g. `00:14` / `YST` / `2d`. */
export const shortStamp = (date: Date): string => {
    const diff = Date.now() - date.getTime();
    if (!Number.isFinite(diff)) return '—';
    if (diff < DAY) {
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        return `${hh}:${mm}`;
    }
    if (diff < 2 * DAY) return 'YST';
    return `${Math.floor(diff / DAY)}d`;
};

const toDate = (raw: Message['date']): Date => {
    const d = raw instanceof Date ? raw : new Date(raw as unknown as string);
    return Number.isNaN(d.getTime()) ? new Date() : d;
};

const PREVIEW_LENGTH = 140;

/**
 * Adapts a flat persisted `Message` onto the rich faction-mail view model.
 * Unknown senders fall back to a faction-less presentation; the body becomes a
 * single paragraph. Richer fields populate as the real message pipeline grows.
 */
export const toFactionMessage = (msg: Message, index: number): FactionMessage => {
    // Prefer an explicit faction id; otherwise try to resolve one from the sender.
    const faction = (msg.factionId ? factionById(msg.factionId) : undefined) ?? resolveFaction(msg.sender);
    const date = toDate(msg.date);
    const body = (msg.body ?? '').trim();
    const id = `msg-0x${(0x0a00 + index).toString(16).toUpperCase()}`;

    return {
        id,
        index,
        factionId: faction?.id ?? msg.factionId ?? null,
        factionName: faction?.name ?? msg.sender ?? 'Unknown sender',
        from: msg.from ?? faction?.handle ?? msg.sender ?? '—',
        subject: msg.subject ?? (body.split('\n')[0]?.slice(0, 90) || '(no subject)'),
        preview:
            msg.preview ??
            (body.length > PREVIEW_LENGTH ? `${body.slice(0, PREVIEW_LENGTH)}…` : body),
        time: shortStamp(date),
        relTime: relativeTime(date),
        unread: msg.unread,
        flagged: msg.flagged ?? false,
        encrypted: msg.encrypted ?? false,
        locked: msg.locked,
        warning: msg.warning,
        priority: msg.priority ?? 'normal',
        attachments: msg.attachments ?? [],
        cipher: msg.cipher ?? 'AES-256-GCM',
        hops: msg.hops ?? 7,
        fingerprint: msg.fingerprint ?? '—',
        body:
            msg.bodyBlocks ??
            (body ? [{ type: 'para', text: body }] : [{ type: 'line', text: '(empty transmission)' }]),
    };
};
