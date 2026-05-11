import { useState, useEffect, useCallback, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Box, Button, Checkbox, FormControlLabel, IconButton, Typography } from '@mui/material';
import { Close, ArrowBack, ArrowForward, CheckCircleOutlined } from '@mui/icons-material';
import { usePlayerStore } from '../../stores/player';
import { STEPS } from '../../data/tutorialSteps';

import './styles.scss';

export interface CoachmarkStep {
    target: string | null;
    title: string;
    description: string;
    stage: string[];
    placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

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

interface CoachmarkProps {
    open: boolean;
}

export default function Coachmarks({ open }: CoachmarkProps) {
    const { markTutorialAsSeen, setTutorialDisabled, tutorialStage } = usePlayerStore();
    const [step, setStep] = useState(0);
    const [disableForever, setDisableForever] = useState(false);

    useEffect(() => {
        if (open) {
            setStep(0);
            setDisableForever(false);
        }
    }, [open]);

    useEffect(() => {
        setStep(0);
    }, [tutorialStage]);

    const stepsForStage = STEPS.filter((s) => s.stage.includes(tutorialStage));

    const current = stepsForStage[step];
    const rect = useTargetRect(current?.target ?? null);

    if (!open || tutorialStage === '') return null;

    const isFirst = step === 0;
    const isLast = step === stepsForStage.length - 1;

    const dismiss = () => {
        if (disableForever) setTutorialDisabled(true);
        markTutorialAsSeen(tutorialStage);
    };

    const handleNext = () => {
        if (isLast || disableForever) dismiss();
        else setStep((s) => s + 1);
    };

    const handlePrev = () => setStep((s) => s - 1);

    return createPortal(
        <div className="coachmark-root" onClick={(e) => e.stopPropagation()}>
            <Spotlight rect={rect} />

            <Box className="coachmark-callout" style={{ ...calloutStyle(rect, current.placement), width: CALLOUT_WIDTH }}>
                <div className="coachmark-callout-header">
                    <Typography className="coachmark-title">{current.title}</Typography>
                    <IconButton size="small" className="coachmark-close" onClick={dismiss}>
                        <Close fontSize="small" />
                    </IconButton>
                </div>

                <Typography className="coachmark-description">{current.description}</Typography>

                <div className="coachmark-dots">
                    {stepsForStage.map((_, i) => (
                        <span key={i} className={`coachmark-dot${i === step ? ' active' : ''}`} />
                    ))}
                </div>

                <FormControlLabel
                    className="coachmark-disable-label"
                    control={
                        <Checkbox
                            size="small"
                            checked={disableForever}
                            onChange={(e) => setDisableForever(e.target.checked)}
                            className="coachmark-disable-checkbox"
                        />
                    }
                    label="Disable Tutorials"
                />

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
