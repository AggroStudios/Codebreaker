import { createSignal, createEffect, on } from 'solid-js';
import { styled } from 'solid-styled-components';
import { useLocation } from '@solidjs/router';

interface BackgroundProps {
    background: null | string
};

const BackgroundElement = styled('div')<BackgroundProps>( props => `
    boxSizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    backgroundImage: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${props.background}');
    backgroundSize: cover;
    backgroundRepeat: no-repeat;
    backgroundAttachment: fixed;
    backgroundPosition: center;
    width: 100%;
    zIndex: -1;
`);

const Background = () => {

    const location = useLocation();
    const [background, setBackground] = createSignal<null|string>(null);

    createEffect(
        on(
            () => location.pathname,
            async () => {
                let bg = await import('../assets/backgrounds/terminal_bg.png');
                try {
                    bg = await import(`../assets/backgrounds/${location.pathname.split('/')[1]}_bg.png`);
                }
                catch {
                }
                setBackground(bg.default);
            }
        )
    );

    return (
        <BackgroundElement background={ background() } />
    );
};

export default Background;