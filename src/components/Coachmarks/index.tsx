import { useState, useEffect, useCallback, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { Close, ArrowBack, ArrowForward, CheckCircleOutlined } from '@mui/icons-material';
import { usePlayerStore } from '../../stores/player';

import './styles.scss';

interface CoachmarkStep {
    target: string | null;
    title: string;
    description: string;
    placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const STEPS: CoachmarkStep[] = [
    {
        target: null,
        title: 'Welcome to your Station',
        description: "This is your command center. Cipher breaks run here, credits accumulate, and hardware upgrades unlock new capacity. Let's walk through the key parts.",
        placement: 'center',
    },
    {
        target: '#coachmark-statistics',
        title: 'Station Statistics',
        description: 'Monitor CPU cores, memory, and storage in real time. Each cipher break consumes resources — upgrade your hardware to run more processes simultaneously.',
        placement: 'right',
    },
    {
        target: '#coachmark-cpu-activity',
        title: 'CPU Activity',
        description: 'This graph shows processor load across all running processes. Saturating your CPU will throttle cipher break speed.',
        placement: 'bottom',
    },
    {
        target: '#cipher-add-card',
        title: 'Queue a Cipher Break',
        description: 'Select a cipher type and hit Begin Break to start cracking. Larger ciphers pay more credits but consume more CPU and memory.',
        placement: 'top',
    },
];

const SPOTLIGHT_PAD = 12;
const CALLOUT_WIDTH = 320;

function useTargetRect(selector: string | null): DOMRect | null {
    const [rect, setRect] = useState<DOMRect | null>(null);

    const update = useCallback(() => {
        if (!selector) { setRect(null); return; }
        const el = document.querySelector(selector);
        setRect(el ? el.getBoundingClientRect() : null);
    }, [selector]);

    useEffect(() => {
        update();
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [update]);

    return rect;
}

function calloutStyle(rect: DOMRect | null, placement: CoachmarkStep['placement']): CSSProperties {
    if (!rect || placement === 'center') {
        return { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
    const gap = SPOTLIGHT_PAD + 16;
    switch (placement) {
        case 'right':
            return { position: 'fixed', top: rect.top + rect.height / 2, left: rect.right + gap, transform: 'translateY(-50%)' };
        case 'left':
            return { position: 'fixed', top: rect.top + rect.height / 2, left: rect.left - CALLOUT_WIDTH - gap, transform: 'translateY(-50%)' };
        case 'bottom':
            return { position: 'fixed', top: rect.bottom + gap, left: Math.max(16, rect.left + rect.width / 2 - CALLOUT_WIDTH / 2) };
        case 'top':
            return { position: 'fixed', bottom: window.innerHeight - rect.top + gap, left: Math.max(16, rect.left + rect.width / 2 - CALLOUT_WIDTH / 2) };
    }
}

interface SpotlightProps {
    rect: DOMRect | null;
}

function Spotlight({ rect }: SpotlightProps) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (!rect) {
        return (
            <svg className="coachmark-overlay">
                <rect width={w} height={h} fill="rgba(0,0,0,0.78)" />
            </svg>
        );
    }

    const x = rect.left - SPOTLIGHT_PAD;
    const y = rect.top - SPOTLIGHT_PAD;
    const rw = rect.width + SPOTLIGHT_PAD * 2;
    const rh = rect.height + SPOTLIGHT_PAD * 2;

    return (
        <svg className="coachmark-overlay">
            <defs>
                <mask id="coachmark-spotlight">
                    <rect width={w} height={h} fill="white" />
                    <rect x={x} y={y} width={rw} height={rh} rx={10} fill="black" />
                </mask>
            </defs>
            <rect width={w} height={h} fill="rgba(0,0,0,0.78)" mask="url(#coachmark-spotlight)" />
            <rect x={x} y={y} width={rw} height={rh} rx={10} fill="none" stroke="rgba(10,245,176,0.5)" strokeWidth={1.5} />
        </svg>
    );
}

export default function Coachmarks() {
    const { hasSeenTutorial, markTutorialAsSeen } = usePlayerStore();
    const [step, setStep] = useState(0);

    const current = STEPS[step];
    const rect = useTargetRect(current.target);

    if (hasSeenTutorial) return null;

    const isFirst = step === 0;
    const isLast = step === STEPS.length - 1;

    const handleNext = () => {
        if (isLast) markTutorialAsSeen();
        else setStep((s) => s + 1);
    };

    const handlePrev = () => setStep((s) => s - 1);

    return createPortal(
        <div className="coachmark-root" onClick={(e) => e.stopPropagation()}>
            <Spotlight rect={rect} />

            <Box className="coachmark-callout" style={{ ...calloutStyle(rect, current.placement), width: CALLOUT_WIDTH }}>
                <div className="coachmark-callout-header">
                    <Typography className="coachmark-title">{current.title}</Typography>
                    <IconButton size="small" className="coachmark-close" onClick={markTutorialAsSeen}>
                        <Close fontSize="small" />
                    </IconButton>
                </div>

                <Typography className="coachmark-description">{current.description}</Typography>

                <div className="coachmark-dots">
                    {STEPS.map((_, i) => (
                        <span key={i} className={`coachmark-dot${i === step ? ' active' : ''}`} />
                    ))}
                </div>

                <div className="coachmark-actions">
                    <Button
                        size="small"
                        className="coachmark-btn-secondary"
                        startIcon={<ArrowBack />}
                        onClick={handlePrev}
                        disabled={isFirst}
                    >
                        Back
                    </Button>
                    <Button
                        size="small"
                        className="coachmark-btn-primary"
                        endIcon={isLast ? <CheckCircleOutlined /> : <ArrowForward />}
                        onClick={handleNext}
                    >
                        {isLast ? 'Got it' : 'Next'}
                    </Button>
                </div>
            </Box>
        </div>,
        document.body,
    );
}
