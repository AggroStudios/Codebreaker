import { useEffect, useRef } from 'react';
import { useAnchors } from '../AnchorsContext';
import './styles.scss';

export default function XpLabel({
    amount,
    levelUp,
}: {
    amount: number;
    levelUp?: boolean;
}) {
    const divRef = useRef<HTMLDivElement | null>(null);
    const { xpAnchorRef } = useAnchors();

    useEffect(() => {
        const el = divRef.current;
        if (!el) return;
        const rotation = Math.round(Math.random() * 30 - 15);
        const anchor = xpAnchorRef.current;
        if (anchor) {
            const rect = anchor.getBoundingClientRect();
            const offsetX = Math.round(Math.random() * (rect.width / 2));
            const offsetY = Math.round(Math.random() * (rect.height / 2));
            el.style.setProperty('--rotation', `${rotation}deg`);
            el.style.top = `${(rect.height / 4) + offsetY}px`;
            el.style.left = `${(rect.width / 4) + offsetX}px`;
        } else {
            el.style.top = '100px';
            el.style.left = '100px';
        }
        requestAnimationFrame(() => {
            el.classList.add('animate');
        });
    }, [amount, xpAnchorRef]);

    return (
        <div ref={divRef} className="glow">
            {levelUp && (
                <>
                    LEVEL UP!
                    <br />
                </>
            )}
            +{amount} XP
        </div>
    );
}
