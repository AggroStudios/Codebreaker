import { useEffect, useRef } from 'react';
import { useAnchors } from '../AnchorsContext';
import './styles.scss';

export default function MoneyLabel({ amount }: { amount: number }) {
    const divRef = useRef<HTMLDivElement | null>(null);
    const { moneyAnchorRef } = useAnchors();

    useEffect(() => {
        const el = divRef.current;
        if (!el) return;
        const rotation = Math.round(Math.random() * 30 - 15);
        const anchor = moneyAnchorRef.current;
        if (anchor) {
            const rect = anchor.getBoundingClientRect();
            const offset = Math.round(Math.random() * rect.width);
            el.style.setProperty('--rotation', `${rotation}deg`);
            el.style.top = `${rect.top}px`;
            el.style.left = `${rect.left + offset}px`;
        } else {
            el.style.top = '100px';
            el.style.left = '100px';
        }
        requestAnimationFrame(() => {
            el.classList.add(amount < 0 ? 'expense' : 'income');
        });
    }, [amount, moneyAnchorRef]);

    return (
        <div ref={divRef} className="glow">
            ${amount}
        </div>
    );
}
