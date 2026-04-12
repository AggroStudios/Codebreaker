import { Component, onMount } from "solid-js";
import "./styles.scss";

const XpLabel: Component<{
    amount: number;
    levelUp?: boolean;
    anchorRef?: HTMLElement;
}> = (props) => {
    const { amount, levelUp, anchorRef } = props;

    let divRef: HTMLDivElement | undefined = undefined;

    onMount(() => {
        if (anchorRef) {
            const rect = anchorRef.getBoundingClientRect();
            const offset = Math.round(Math.random() * (rect.width / 2));
            divRef.style.top = `${rect.top}px`;
            divRef.style.left = `${rect.left + offset}px`;
        } else {
            divRef.style.top = "100px";
            divRef.style.left = "100px";
        }
        const el = divRef;
        if (!el) return;
        requestAnimationFrame(() => {
            el.classList.add("animate");
        });
    });

    return (
        <div ref={(el) => (divRef = el)} class="glow">
            {levelUp ? (
                <>
                    LEVEL UP!
                    <br />
                </>
            ) : (
                ""
            )}
            +{amount} XP
        </div>
    );
};

export default XpLabel;
