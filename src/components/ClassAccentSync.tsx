import { useEffect } from 'react';

import { usePlayerStore } from '../stores/player';
import { classConfigFor } from '../data/classConfig';
import { hexToRgba, hexToRgbTriple } from '../lib/utils';

/**
 * Applies the active operator class's accent color to the global CSS accent
 * tokens, so the whole UI (every `var(--accent)` / glow consumer) recolors to
 * match the chosen class: Cipherwright → green, The Operator → blue, Phantom →
 * orange. Before a character exists it falls back to Cipherwright's green,
 * which matches the app's default theme.
 */
export default function ClassAccentSync() {
    const classId = usePlayerStore((s) => s.player.classId);
    const accent = classConfigFor(classId).accent;

    useEffect(() => {
        const root = document.documentElement.style;
        root.setProperty('--color-accent', accent);
        root.setProperty('--accent', accent);
        // RGB channel triple powering every `rgba(var(--accent-rgb), α)` in the
        // nav menu / app-bar chrome, so their highlights track the class accent.
        root.setProperty('--accent-rgb', hexToRgbTriple(accent));
        root.setProperty('--accent-dim', hexToRgba(accent, 0.15));
        root.setProperty('--color-border-hi', hexToRgba(accent, 0.35));
        root.setProperty('--glow-accent', `0 0 12px ${hexToRgba(accent, 0.6)}`);
        root.setProperty(
            '--glow-accent-lg',
            `0 0 24px ${hexToRgba(accent, 0.4)}, 0 0 48px ${hexToRgba(accent, 0.2)}`,
        );
    }, [accent]);

    return null;
}
