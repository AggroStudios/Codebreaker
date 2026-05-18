import React from 'react';
import { styled } from '@mui/material/styles';

interface Cell {
    ch: '0' | '1';
    left: number;
    delay: number;
    dur: number;
    size: number;
}

export const Glyph = styled('div', {
    name: 'Glyph',
    slot: 'root',
    shouldForwardProp: (prop) => prop !== 'color',
    overridesResolver: (props: any, styles: any) => ({
        ...styles.root,
        ...(props?.color && {
            color: props.theme.palette[props.color].light,
            textShadow: `0 0 6px ${props.theme.palette[props.color].light}`,
        })
    })
})({});

export interface GlyphWallComponentProps {
    'aria-hidden': boolean;
    className?: string;
    style?: React.CSSProperties;
}

const GlyphWallComponent = styled('div')<GlyphWallComponentProps>(() => ({
    inset: 0,
    opacity: 0.5,
    overflow: 'hidden',
    pointerEvents: 'none',
    position: 'absolute',
    '@keyframes glyphDrift': {
        '0%': {
        opacity: 0,
        transform: 'translateY(0)',
        },
        '10%': {
        opacity: 1
        },
        '50%': {
        opacity: 0.5
        },
        '100%': {
        opacity: 0,
        transform: 'translateY(140%)',
        }
    },
}));

export interface GlyphWallProps {
    color: string;
    count?: number;
}

declare module '@mui/material/styles' {
    interface Components {
        GlyphWall?: {
            defaultProps?: GlyphWallProps;
        };
    }
}

export default function GlyphWall({color, count = 24}: GlyphWallProps) {
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
        <GlyphWallComponent
            aria-hidden
        >
            {cells.map((c, i) => (
                <Glyph
                    color={color}
                    key={i}
                    style={{
                        left: `${c.left}%`,
                        fontSize: c.size,
                        animationDuration: `${c.dur}s`,
                        animationDelay: `${c.delay}s`,
                    }}
                >
                    {c.ch}
                </Glyph>
            ))}
        </GlyphWallComponent>
    );
}
