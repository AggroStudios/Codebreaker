import { useEffect, useState } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
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

export default function LoadingScreen({ loading }: { loading: number }) {
    const [timerElapsed, setTimerElapsed] = useState(false);

    useEffect(() => {
        const id = window.setTimeout(() => setTimerElapsed(true), 1000);
        return () => window.clearTimeout(id);
    }, []);

    return (
        <BackgroundElement
            style={{
                display:
                    loading < 100 || !timerElapsed ? 'block' : 'none',
                overflow: 'hidden',
                textAlign: 'center',
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
        </BackgroundElement>
    );
}
