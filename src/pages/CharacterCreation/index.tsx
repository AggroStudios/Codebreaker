import { useCallback, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import {
    FingerprintTwoTone,
    PersonTwoTone,
    RocketLaunchTwoTone,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';

import BrandStrip from '../../components/CharacterCreation/BrandStrip';
import CharacterBottomNav from '../../components/CharacterCreation/CharacterBottomNav';
import CharacterStepper from '../../components/CharacterCreation/CharacterStepper';
import ChooseOperatorStep from '../../components/CharacterCreation/ChooseOperatorStep';
import FinalBriefingStep from '../../components/CharacterCreation/FinalBriefingStep';
import ForgeIdentityStep from '../../components/CharacterCreation/ForgeIdentityStep';
import ProfileDossierModal from '../../components/CharacterCreation/ProfileDossierModal';
import { HACKER_CLASS_BY_ID } from '../../data/hackerClasses';
import { ORIGIN_BY_ID } from '../../data/origins';
import { useCharacterStore } from '../../stores/character';
import { useDraftValidation } from '../../components/CharacterCreation/useDraftValidation';
import { usePlayerStore } from '../../stores/player';

import './style.scss';

const STEP_META: Record<1 | 2 | 3, { label: string; sub: string; path: string; icon: React.ComponentType<{ sx?: object }> }> = {
    1: {
        label: 'CHOOSE OPERATOR',
        path: 'class',
        sub: 'Pick the hacker profile that matches your style. The class locks in your starting kit, signature ability, and accent.',
        icon: PersonTwoTone,
    },
    2: {
        label: 'FORGE IDENTITY',
        path: 'call-sign',
        sub: 'Lock your callsign, paint your avatar, pick a hometown, and choose the backstory that grants your starting attribute.',
        icon: FingerprintTwoTone,
    },
    3: {
        label: 'FINAL BRIEFING',
        path: 'deploy',
        sub: 'Read the handshake from your handler. Confirm the dossier. Then deploy and start the run.',
        icon: RocketLaunchTwoTone,
    },
};

export default function CharacterCreation() {
    const navigate = useNavigate();
    const draft = useCharacterStore((s) => s.draft);
    const setStep = useCharacterStore((s) => s.setStep);
    const deploy = useCharacterStore((s) => s.deploy);
    const { canAdvance } = useDraftValidation();
    const klass = HACKER_CLASS_BY_ID[draft.classId];

    const [dossierOpen, setDossierOpen] = useState(false);

    const handleAdvance = useCallback(() => {
        if (!canAdvance) return;
        if (draft.step < 3) {
            setStep((draft.step + 1) as 1 | 2 | 3);
            return;
        }
        // Deploy
        const identity = deploy();
        if (!identity) return;

        // Seed wallet + origin bonus.
        const klassNow = HACKER_CLASS_BY_ID[identity.classId];
        const origin = ORIGIN_BY_ID[identity.origin];
        usePlayerStore.setState((s) => ({
            player: {
                ...s.player,
                money: klassNow.startingWallet,
                statBonuses: origin
                    ? {
                          ...s.player.statBonuses,
                          [origin.bonus.stat]: s.player.statBonuses[origin.bonus.stat] + origin.bonus.amt,
                      }
                    : s.player.statBonuses,
            },
        }));
        navigate('/station');
    }, [canAdvance, draft.step, deploy, navigate, setStep]);

    const handleBack = useCallback(() => {
        if (draft.step === 1) {
            navigate('/');
            return;
        }
        setStep((draft.step - 1) as 1 | 2 | 3);
    }, [draft.step, navigate, setStep]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (dossierOpen) return;
            if (e.key === 'ArrowRight' && canAdvance) {
                handleAdvance();
            } else if (e.key === 'ArrowLeft') {
                handleBack();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [canAdvance, dossierOpen, handleAdvance, handleBack]);

    const meta = STEP_META[draft.step];
    const Icon = meta.icon;
    const stepNum = String(draft.step).padStart(2, '0');

    return (
        <Box className="character-creation-page">
            <Box className="character-creation-inner">
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: 2.5,
                        mb: 3,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexDirection: 'row', width: '100%' }}>
                        <Box sx={{
                            display: 'flex', 
                            alignItems: 'center', 
                            flex: '1 1 0',
                            gap: 0.75,
                            fontFamily: 'Fira Code, monospace',
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: '0.18em',
                            color: klass.accent,
                            textTransform: 'uppercase',
                    }}>
                            <Icon sx={{ fontSize: 14 }} />
                            <span>
                                /home/identity/{meta.path} · STEP {stepNum} / 03 — {meta.label}
                            </span>
                        </Box>
                        <BrandStrip />
                    </Box>
                    <Box sx={{ maxWidth: 640 }}>
                        <Typography
                            component="h1"
                            sx={{
                                fontSize: 42,
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                                lineHeight: 1.1,
                                color: 'rgba(255,255,255,0.96)',
                                mb: 1,
                            }}
                        >
                            {draft.step === 1 ? 'Operator Class' : draft.step === 2 ? 'Call Sign' : 'Briefing'}
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                            {meta.sub}
                        </Typography>
                    </Box>
                    <CharacterStepper />
                </Box>

                <Box sx={{ flex: 1, minHeight: 0 }}>
                    {draft.step === 1 && (
                        <ChooseOperatorStep onOpenDossier={() => setDossierOpen(true)} />
                    )}
                    {draft.step === 2 && <ForgeIdentityStep />}
                    {draft.step === 3 && <FinalBriefingStep />}
                </Box>

                <CharacterBottomNav
                    onBack={handleBack}
                    onAdvance={handleAdvance}
                    onOpenDossier={() => setDossierOpen(true)}
                />
            </Box>

            <ProfileDossierModal
                open={dossierOpen}
                klass={klass}
                isSelected
                onClose={() => setDossierOpen(false)}
                onSelect={() => setDossierOpen(false)}
            />
        </Box>
    );
}
