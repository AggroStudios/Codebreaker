import React from 'react';

import './styles.scss';

export interface GlyphWallProps {
    color: string;
    count?: number;
    className?: string;
    style?: React.CSSProperties;
}

interface Cell {
    ch: '0' | '1';
    left: number;
    delay: number;
    dur: number;
    size: number;
}

export default function GlyphWall({ color, count = 24, className, style }: GlyphWallProps) {
    const cells = React.useMemo<Cell[]>(() => {
        const out: Cell[] = [];
        for (let i = 0; i < count; i++) {
            out.push({
                ch: Math.random() < 0.5 ? '0' : '1',
                left: Math.random() * 100,
                delay: Math.random() * 4,
                dur: 3 + Math.random() * 3,
                size: 9 + Math.random() * 5,
            });
        }
        return out;
    }, [count]);

    return (
        <div
            aria-hidden
            className={className ? `glyph-wall ${className}` : 'glyph-wall'}
            style={style}
        >
            {cells.map((c, i) => (
                <span
                    key={i}
                    className="glyph"
                    style={{
                        left: `${c.left}%`,
                        color,
                        fontSize: c.size,
                        animationDuration: `${c.dur}s`,
                        animationDelay: `${c.delay}s`,
                        textShadow: `0 0 6px ${color}66`,
                    }}
                >
                    {c.ch}
                </span>
            ))}
        </div>
    );
}
