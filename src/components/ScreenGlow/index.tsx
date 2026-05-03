import { useEffect } from 'react';
import { useStationState } from '../../stores/stationContext';
import './styles.scss';

export enum ScreenGlowType {
    ACTIVE = 'active',
    ALERT = 'alert',
    OVERCLOCK = 'overclock',
}

export default function ScreenGlow() {
    const glowActive = useStationState((s) => s.glowActive);
    const glowType = useStationState((s) => s.glowType ?? ScreenGlowType.ACTIVE);
    
    useEffect(() => {
        document.body.classList.toggle('glow-active', glowActive);
        return () => {
            document.body.classList.toggle('glow-active', false);
        };
    }, [glowActive]);
    return (
        <div className={`screen-glow${glowActive ? ` screen-glow--${glowType}` : ''}`} />
    );
}
