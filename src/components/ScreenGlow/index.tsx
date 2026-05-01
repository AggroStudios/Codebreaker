import { useEffect } from 'react';
import { useStationState } from '../../stores/stationContext';
import './styles.scss';

export default function ScreenGlow() {
    const glowActive = useStationState((s) => s.glowActive);

    useEffect(() => {
        document.body.classList.toggle('glow-active', glowActive);
        return () => {
            document.body.classList.toggle('glow-active', false);
        };
    }, [glowActive]);
    return (
        <div className={`screen-glow${glowActive ? ' screen-glow--active' : ''}`} />
    );
}
