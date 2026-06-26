import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

    // Portal to <body> so the position:fixed label is positioned relative to the
    // viewport, not a backdrop-filtered/transformed ancestor (e.g. the app bar).
    return createPortal(
        <div ref={divRef} className="glow">
            ${amount}
        </div>,
        document.body,
    );
}
