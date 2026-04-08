import { Component, onMount } from "solid-js";
import './styles.scss';

const MoneyLabel: Component<{ amount: number, anchorRef?: HTMLElement }> = (props) => {
    const { amount, anchorRef } = props;

    let divRef: HTMLDivElement | undefined = undefined;

    onMount(() => {
        if (anchorRef) {
            const rect = anchorRef.getBoundingClientRect();
            const offset = Math.round(Math.random() * rect.width);
            divRef.style.top = `${rect.top}px`;
            divRef.style.left = `${rect.left + offset}px`;
        }
        else {
            divRef.style.top = '100px';
            divRef.style.left = '100px';
        }
        const el = divRef;
        if (!el) return;
        requestAnimationFrame(() => {
            el.classList.add(amount < 0 ? 'expense' : 'income');
        });
    });

    return (
        <div ref={el => divRef = el} class="glow">
            ${amount}
        </div>
    )
}

export default MoneyLabel;