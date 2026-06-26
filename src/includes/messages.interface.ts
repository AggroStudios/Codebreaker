/**
 * Rich view-model for the SECURE_COMMS messages modal.
 *
 * The persisted game `Message` (see OperatingSystem.interface.ts) is currently
 * flat (`{ sender, body, date, unread }`). This file describes the richer
 * faction-mail schema the modal renders; `data/factionMessages.ts` adapts the
 * flat store messages onto it with sensible fallbacks. Treat this as the
 * target schema to grow the real message pipeline toward.
 */

export type MessageFolderId =
    | 'inbox'
    | 'flagged'
    | 'contracts'
    | 'encrypted'
    | 'drafts'
    | 'sent'
    | 'archive'
    | 'burned';

export type MessagePriority = 'high' | 'normal' | 'low';

export type AttachmentKind = 'contract' | 'data' | 'challenge';

export interface MessageAttachment {
    name: string;
    size: string;
    kind: AttachmentKind;
}

export type MessageBodyBlock =
    | { type: 'line' | 'para'; text: string }
    | { type: 'callout'; label: string; text: string }
    | { type: 'warn'; text: string }
    | { type: 'table'; rows: [string, string, string][] }
    | { type: 'sig'; text: string }
    | { type: 'locked'; text: string };

export interface FactionMessage {
    /** Stable display id, e.g. `msg-0xA31`. */
    id: string;
    /** Index into the player store `messages` array (drives `markMessageAsRead`). */
    index: number;
    /** Resolved dark-web faction id, or null when the sender maps to no faction. */
    factionId: string | null;
    /** Display name — faction name when resolved, otherwise the raw sender. */
    factionName: string;
    from: string;
    subject: string;
    preview: string;
    /** Short timestamp for the thread row, e.g. `00:14` / `YST` / `2d`. */
    time: string;
    /** Relative phrase for the envelope header, e.g. `14 min ago`. */
    relTime: string;
    unread: boolean;
    flagged: boolean;
    encrypted: boolean;
    /** Sealed — requires proof-of-skill before the body decrypts. */
    locked?: boolean;
    /** Shows a warning glyph on the thread row. */
    warning?: boolean;
    priority: MessagePriority;
    attachments: MessageAttachment[];
    cipher: string;
    hops: number;
    fingerprint: string;
    body: MessageBodyBlock[];
}
