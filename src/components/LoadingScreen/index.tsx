import { useEffect, useRef, useState } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import { styled, keyframes } from '@mui/material/styles';
import LoadingImage from '../../assets/CodeBreaker-Logo.jpeg';

import './LoadingScreen.scss';

const BackgroundElement = styled('div')({
    boxSizing: 'border-box',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundImage: 'linear-gradient(rgba(0,0,0,1), rgba(0,0,0,1))',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    backgroundPosition: 'center',
    width: '100%',
    zIndex: 9999,
});

const blink = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
`;

const ClickPrompt = styled('div')({
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#0af5b0',
    fontFamily: 'monospace',
    fontSize: '14px',
    letterSpacing: '0.15em',
    animation: `${blink} 1.2s ease-in-out infinite`,
    userSelect: 'none',
    whiteSpace: 'nowrap',
});

export default function LoadingScreen({
    loading,
    onHidden,
}: {
    loading: number;
    onHidden?: () => void;
}) {
    const [timerElapsed, setTimerElapsed] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const hiddenFiredRef = useRef(false);

    useEffect(() => {
        const id = window.setTimeout(() => setTimerElapsed(true), 1000);
        return () => window.clearTimeout(id);
    }, []);

    const readyToDismiss = loading >= 100 && timerElapsed;
    const isHidden = readyToDismiss && dismissed;

    useEffect(() => {
        if (isHidden && !hiddenFiredRef.current) {
            hiddenFiredRef.current = true;
            onHidden?.();
        }
    }, [isHidden, onHidden]);

    const handleClick = () => {
        if (readyToDismiss) setDismissed(true);
    };

    return (
        <BackgroundElement
            onClick={handleClick}
            style={{
                display: isHidden ? 'none' : 'block',
                overflow: 'hidden',
                textAlign: 'center',
                cursor: readyToDismiss ? 'pointer' : 'default',
            }}
        >
            <img src={LoadingImage} className="logoImage" />
            <LinearProgress
                variant="determinate"
                value={loading}
                sx={{
                    position: 'absolute',
                    bottom: '50px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    height: '10px',
                    backgroundColor: '#333333',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: '#0af5b0',
                    },
                }}
            />
            {readyToDismiss && (
                <ClickPrompt>[ CLICK ANYWHERE TO CONTINUE ]</ClickPrompt>
            )}
        </BackgroundElement>
    );
}
