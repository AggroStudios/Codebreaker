import { useEffect, useMemo, useState } from 'react';
import { usePlayerStore } from '../../stores/player';

export type TitleMenuId = 'new' | 'continue' | 'load' | 'settings' | 'credits' | 'exit';

interface MenuItem {
    id: TitleMenuId;
    label: string;
    hint: string;
    enabled: boolean;
}

interface TitleMenuProps {
    onSelect: (id: TitleMenuId) => void;
}

export default function TitleMenu({ onSelect }: TitleMenuProps) {
    const level = usePlayerStore((s) => s.player.level);

    const items = useMemo<MenuItem[]>(() => [
        { id: 'new',      label: 'New Operation', hint: 'fresh save · level 0',         enabled: true },
        { id: 'continue', label: 'Continue',      hint: `op. live · lvl ${level}`,      enabled: true },
        { id: 'load',     label: 'Load Slot',     hint: '1 save available',             enabled: true },
        { id: 'settings', label: 'Settings',      hint: 'audio · display · keys',       enabled: true },
        { id: 'credits',  label: 'Credits',       hint: '',                             enabled: true },
        { id: 'exit',     label: 'Disconnect',    hint: 'quit to desktop',              enabled: true },
    ], [level]);

    const [activeId, setActiveId] = useState<TitleMenuId>('continue');

    useEffect(() => {
        const handle = (e: KeyboardEvent) => {
            if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') return;
            const enabled = items.filter((it) => it.enabled);
            if (enabled.length === 0) return;
            const currentIdx = enabled.findIndex((it) => it.id === activeId);
            const idx = currentIdx === -1 ? 0 : currentIdx;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveId(enabled[(idx + 1) % enabled.length].id);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveId(enabled[(idx - 1 + enabled.length) % enabled.length].id);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                onSelect(enabled[idx].id);
            }
        };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [activeId, items, onSelect]);

    return (
        <ul className="menu" role="menu">
            {items.map((m) => {
                const className = [
                    'menu-item',
                    activeId === m.id ? 'active' : '',
                    !m.enabled ? 'disabled' : '',
                ].filter(Boolean).join(' ');
                return (
                    <li
                        key={m.id}
                        role="menuitem"
                        className={className}
                        onMouseEnter={() => m.enabled && setActiveId(m.id)}
                        onClick={() => m.enabled && onSelect(m.id)}
                    >
                        <span className="caret">▸</span>
                        <span>{m.label}</span>
                        <span className="hint">{m.hint}</span>
                    </li>
                );
            })}
        </ul>
    );
}
