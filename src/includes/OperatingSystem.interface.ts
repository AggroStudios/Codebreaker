export enum NotificationLevel {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
}

export type Notification = {
    message: string;
    level: NotificationLevel;
    unread: boolean;
};

import {
    MessageAttachment,
    MessageBodyBlock,
    MessagePriority,
} from './messages.interface';

export type Message = {
    sender: string;
    body: string;
    date: Date;
    unread: boolean;
    // ── Optional SECURE_COMMS faction-mail metadata ─────────────────────────
    // Plain system messages omit these; the messages modal renders them when
    // present and falls back to sensible defaults otherwise.
    /** Dark-web faction id (see data/darkWebFactions.ts). */
    factionId?: string;
    /** Per-message handle of the sender within the faction, e.g. `broker.07`. */
    from?: string;
    /** Short subject line; falls back to the first line of `body`. */
    subject?: string;
    /** Curated preview/snippet; falls back to a slice of `body`. */
    preview?: string;
    encrypted?: boolean;
    /** Sealed — requires proof-of-skill before the body decrypts. */
    locked?: boolean;
    flagged?: boolean;
    /** Surfaces a warning glyph on the thread row. */
    warning?: boolean;
    priority?: MessagePriority;
    attachments?: MessageAttachment[];
    cipher?: string;
    hops?: number;
    fingerprint?: string;
    /** Structured body; when absent the modal wraps `body` as a single paragraph. */
    bodyBlocks?: MessageBodyBlock[];
};
